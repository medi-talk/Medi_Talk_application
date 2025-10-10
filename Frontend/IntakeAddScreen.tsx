// IntakeAddScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  PermissionsAndroid,
  Platform
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import api from "./utils/api";
import { useAppStore } from "./store/appStore";
import { launchCamera } from "react-native-image-picker";
import { analyzeNutritionForIntake, applyOcrToNutrients, type IntakeItemsResult } from "./opencv";

const nutrientIdMap: Record<string, number> = {
  vitaminA: 1,
  vitaminD: 2,
  vitaminE: 3,
  vitaminK: 4,
  vitaminC: 5,
  thiamin: 6,
  riboflavin: 7,
  vitaminB6: 8,
  folate: 9,
  vitaminB12: 10,
  pantothenic: 11,
  biotin: 12,
};

export default function IntakeAddScreen({ navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;

  const [groupName, setGroupName] = useState("");
  const [nutrients, setNutrients] = useState({
    vitaminA: "",
    vitaminD: "",
    vitaminE: "",
    vitaminK: "",
    vitaminC: "",
    thiamin: "",
    riboflavin: "",
    vitaminB6: "",
    folate: "",
    vitaminB12: "",
    pantothenic: "",
    biotin: "",
  });

  /* OpenCV 관련 함수 Start*/
  // 권한 함수
  async function ensureCameraAndImagePerms(): Promise<boolean> {
    if (Platform.OS !== "android") return true;

    // Android 13+는 READ_MEDIA_IMAGES, 그 이하는 READ_EXTERNAL_STORAGE
    const perms = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ];

    const results = await PermissionsAndroid.requestMultiple(perms);
    return Object.values(results).every(
      (v) => v === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  // 카메라 촬영 → 서버 업로드 → 결과 반영
  const handleCameraScan = async () => {
    // 권한 체크
    const ok = await ensureCameraAndImagePerms();
    if (!ok) {
      Alert.alert("권한 필요", "카메라/사진 접근 권한을 허용해 주세요.");
      return;
    }

    try {
      // 카메라 실행
      const resp = await new Promise<any>((resolve) =>
        launchCamera(
          {
            mediaType: "photo",
            includeBase64: false,
            cameraType: "back",
            quality: 1.0,
            maxWidth: 2560,
            maxHeight: 2560,
            saveToPhotos: false, // 저장 안 함
          },
          (r: any) => resolve(r)
        )
      );

      // 사용자 취소/에러 처리
      if (resp?.didCancel) return;
      if (resp?.errorCode) {
        Alert.alert("촬영 실패", resp.errorMessage || resp.errorCode);
        return;
      }

      // 업로드용 파일 구성
      const asset = resp?.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("오류", "이미지 위치를 가져올 수 없습니다.");
        return;
      }

      const file = {
        uri: asset.uri,
        type: asset.type || "image/jpeg",
        name: asset.fileName || "photo.jpg",
      };

      // 서버 업로드 & JSON 수신
      const adapted = await analyzeNutritionForIntake(file, { timeoutMs: 30000 });

      // 결과 확인
      console.log("🧩 OCR 전체 결과:", JSON.stringify(adapted, null, 2));

      // 화면 반영
      if (!adapted.items?.length) {
        Alert.alert("알림", "표를 인식하지 못했습니다. 더 선명하게 촬영해 보세요.");
        return;
      }

      setNutrients((prev) => applyOcrToNutrients(adapted, prev));

      Alert.alert("완료", "영양성분을 채웠습니다.");
    } catch (e: any) {
      Alert.alert("OCR 실패", e?.message || "네트워크 오류");
    }
  };
  /* OpenCV 관련 함수 End*/

  const handleChange = (key: string, value: string) => {
    setNutrients((prev) => ({ ...prev, [key]: value }));
  };

  // 숫자 정규화
  const toZeroNumber = (v: unknown) => {
    if (v === null || v == undefined) return 0;
    const s = String(v).replace(/,/g, "").trim();
    if (s === "") return 0;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const buildNutrientsPayload = () => {
    const nutrientIntakes: { nutrientId: number; intake: number }[] = [];
    Object.entries(nutrients).forEach(([key, value]) => {
      const nutrientId = nutrientIdMap[key];
      const intake = toZeroNumber(value);
      nutrientIntakes.push({ nutrientId, intake });
    });
    return nutrientIntakes;
  };

  const handleSave = async () => {
    try {
      if (!groupName.trim()) {
      Alert.alert("입력 오류", "영양소 그룹명을 입력하세요.");
      return;
      }

      const nutrientsPayload = buildNutrientsPayload();

      const res = await api.post(`/api/intakeCalc/createUserNutrientGroupWithIntakes/${userId}`, {
        groupName: groupName.trim(),
        nutrients: nutrientsPayload,
      });
      if (res.data.success) {
        Alert.alert("저장 완료", "영양소가 추가되었습니다.");
        navigation.goBack();
      } 
    } catch (err: any) {
      console.error("Save Intake Error:", err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>영양소 추가</Text>

        <Text style={styles.label}>영양소 그룹명</Text>
        <TextInput
          style={styles.input}
          placeholder="예: ○○○○○ 종합비타민"
          value={groupName}
          onChangeText={setGroupName}
          placeholderTextColor={COLORS.darkGray}
        />

        {/* 영양소 입력칸 */}
        <View style={styles.grid}>
          {[
            ["비타민 A (μg RAE)", "vitaminA"],
            ["비타민 D (μg)", "vitaminD"],
            ["비타민 E (mg α-TE)", "vitaminE"],
            ["비타민 K (μg)", "vitaminK"],
            ["비타민 C (mg)", "vitaminC"],
            ["티아민 (mg)", "thiamin"],
            ["리보플라빈 (mg)", "riboflavin"],
            ["비타민 B6 (mg)", "vitaminB6"],
            ["엽산 (μg DFE)", "folate"],
            ["비타민 B12 (μg)", "vitaminB12"],
            ["판토텐산 (mg)", "pantothenic"],
            ["비오틴 (μg)", "biotin"],
          ].map(([label, key]) => (
            <View key={key} style={styles.inputBox}>
              <Text style={styles.nutrientLabel}>{label}</Text>
              <TextInput
                style={styles.nutrientInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.darkGray}
                value={nutrients[key as keyof typeof nutrients]}
                onChangeText={(val) => handleChange(key, val)}
              />
            </View>
          ))}
        </View>

        {/* 하단 버튼 영역 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cameraBtn} onPress={handleCameraScan}>
            <Icon name="camera" size={28} color={COLORS.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>저장</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: SIZES.padding, paddingBottom: 60 },
  header: { ...FONTS.h2, marginBottom: 16 },
  label: { ...FONTS.h3, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: COLORS.lightGray,
    color: COLORS.black,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inputBox: {
    width: "48%",
    marginBottom: 12,
  },
  nutrientLabel: {
    ...FONTS.p,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  nutrientInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 8,
    backgroundColor: COLORS.lightGray,
    textAlign: "center",
    color: COLORS.black,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cameraBtn: {
    backgroundColor: "#FFEB3B",
    borderRadius: 8,
    padding: 14,
    flex: 1,
    alignItems: "center",
    marginRight: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    flex: 3,
    alignItems: "center",
  },
  saveText: { color: COLORS.white, ...FONTS.h3 },
});
