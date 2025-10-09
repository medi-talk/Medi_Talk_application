/**
 * 사진 1장 촬영 -> 서버(/ocr/nutrition) 업로드 -> 결과 받기
 * analyzeNutritionRaw()       -> 서버 원본 { engine, lang, text, rows } 반환
 * analyzeNutritionForIntake()  -> 어플에서 사용하는 형태 { text, items } 반환
 * IntakeAddScreen.tsx에서 여기 함수 사용
 */

import { OPENCV_CONFIG } from "./config/apiConfig";

// 설정 
const BASE = OPENCV_CONFIG.BASE_URL;
const ENDPOINT = "/ocr/nutrition";        // 서버 FastAPI 라우트
const DEFAULT_LANG = "kor+eng";            // 서버 기본 언어(클라에서 고정 사용)

export type ServerRow = {
  "영양성분"?: string | null;
  "함량"?: string | null;
  "기준치"?: string | null;
  [k: string]: unknown;
};

export type ServerResp = {
  engine: "easyocr" | "tesseract";
  lang: string;        // 예: "kor eng"
  text: string;        // 서버 정규화 텍스트
  rows: ServerRow[];   // 서버 파서 결과(원본)
};

export type NutritionItem = {
  name: string;
  amount?: string;
  rdi?: string; // 기준치
};

export type IntakeItemsResult = {
  text: string;
  items: NutritionItem[];
};

// IntakeAddScreen의 nutrients와 동일 구조
export type NutrientFields = {
  vitaminA: string;
  vitaminD: string;
  vitaminE: string;
  vitaminK: string;
  vitaminC: string;
  thiamin: string;       // B1
  riboflavin: string;    // B2
  vitaminB6: string;
  folate: string;
  vitaminB12: string;
  pantothenic: string;   // B5
  biotin: string;
};

// 서버 한글명 → 화면 state 키 매핑
export const NAME_TO_KEY: Record<string, keyof NutrientFields> = {
  "비타민 A": "vitaminA",
  "비타민 D": "vitaminD",
  "비타민 E": "vitaminE",
  "비타민 K": "vitaminK",
  "비타민 C": "vitaminC",
  "티아민": "thiamin",          // B1
  "리보플라빈": "riboflavin",   // B2
  "비타민 B6": "vitaminB6",
  "엽산": "folate",
  "비타민 B12": "vitaminB12",
  "판토텐산": "pantothenic",    // B5
  "비오틴": "biotin",
};

// 업로드 보조
function guessNameFromUri(uri: string | undefined, fallback = "upload"): string {
  if (!uri) return `${fallback}.jpg`;
  try {
    const last = uri.split("/").pop() || "";
    const clean = last.split("?")[0].split("#")[0];
    return clean || `${fallback}.jpg`;
  } catch {
    return `${fallback}.jpg`;
  }
}

function guessMimeFromName(name: string | undefined, def = "image/jpeg"): string {
  if (!name) return def;
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "png":  return "image/png";
    case "webp": return "image/webp";
    case "heic": return "image/heic"; // 서버 미지원이면 추후 변환 고려
    default:     return def;
  }
}

function toFormData(file: { uri: string; type?: string; name?: string } | Blob): FormData {
  const fd = new FormData();
  if (file instanceof Blob) {
    fd.append("file", file as any);
    return fd;
  }
  const uri = (file as any).uri as string;
  const name = (file as any).name || guessNameFromUri(uri);
  const type = (file as any).type || guessMimeFromName(name);
  fd.append("file", { uri, name, type } as any);
  return fd;
}

// 서버 json 원본 받기
export default async function analyzeNutritionRaw(
  file: { uri: string; type?: string; name?: string } | Blob,
  opts?: { base?: string; lang?: string; timeoutMs?: number }
): Promise<ServerResp> {
  const base = opts?.base ?? BASE;
  const lang = opts?.lang ?? DEFAULT_LANG;
  const timeoutMs = opts?.timeoutMs ?? 15000;

  const url = `${base}${ENDPOINT}?lang=${encodeURIComponent(lang)}`;
  const form = toFormData(file);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, { method: "POST", body: form, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    try {
      const bad = await res.json();
      throw new Error(bad?.detail ?? `HTTP ${res.status}`);
    } catch {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `HTTP ${res.status}`);
    }
  }

  const payload = (await res.json()) as ServerResp;
  return payload;
}

// rows → items로 변환
export function adaptRowsToItems(raw: ServerResp): IntakeItemsResult {
  const items: NutritionItem[] = (raw.rows ?? [])
    .map((r: any) => {
      const name = (r["영양성분"] ?? "").toString().trim();
      const amount = (r["함량"] ?? "").toString().trim();
      const rdi = (r["기준치"] ?? "").toString().trim();
      return {
        name,
        ...(amount ? { amount } : {}),
        ...(rdi ? { rdi } : {}),
      };
    })
    .filter((it) => !!it.name);

  return {
    text: (raw.text ?? "").toString(),
    items,
  };
}

// 업로드, 변환
export async function analyzeNutritionForIntake(
  file: { uri: string; type?: string; name?: string } | Blob,
  opts?: { base?: string; lang?: string; timeoutMs?: number }
): Promise<IntakeItemsResult> {
  const raw = await analyzeNutritionRaw(file, opts);
  return adaptRowsToItems(raw);
}

// "100 mg", "160 ug" 같은 문자열에서 숫자만 추출
export function extractAmountNumber(amount?: string | null): string {
  if (!amount) return "";
  const m = amount.replaceAll(",", "").match(/(\d+(?:\.\d+)?)/);
  return m ? m[1] : "";
}

/**
 * OCR 결과(adapted)와 기존 nutrients를 받아,
 * 매칭되는 항목만 숫자값으로 채운 '새 nutrients' 반환 (불변성 유지)
 * 빈 값/매칭 실패는 건드리지 않음
 */
export function applyOcrToNutrients(
  ocr: IntakeItemsResult,
  prev: NutrientFields
): NutrientFields {
  const next: NutrientFields = { ...prev };
  for (const it of ocr.items || []) {
    const key = NAME_TO_KEY[it.name];
    if (!key) continue;                       // 관리 대상 12종 외는 스킵
    const val = extractAmountNumber(it.amount);
    if (!val) continue;                       // 숫자 못 뽑으면 유지
    next[key] = val;
  }
  return next;
}
