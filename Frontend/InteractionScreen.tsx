// InteractionScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { COLORS, SIZES, FONTS } from "./styles/theme";

//반드시 공공데이터포털 "디코딩 인증키" 원본 그대로 넣으세요 
const SERVICE_KEY = "";

// 문자열 정리 함수 
const cleanText = (txt: string) => (txt || "").replace(/\s+/g, " ");

// DUR 약품 검색 (자동완성)
async function fetchDrugList(query: string) {
  if (!query) return [];
  const url = `https://apis.data.go.kr/1471000/DURPrdlstInfoService03/getDurPrdlstInfoList03?serviceKey=${encodeURIComponent(
    SERVICE_KEY
  )}&type=json&itemName=${encodeURIComponent(query)}&numOfRows=20&pageNo=1`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    return json.body?.items || [];
  } catch (err) {
    console.error("검색 실패:", err);
    return [];
  }
}

// DUR API 공통 호출
async function fetchDurAPI(apiName: string, drug1: string, drug2?: string) {
  let url = `https://apis.data.go.kr/1471000/DURPrdlstInfoService03/${apiName}?serviceKey=${encodeURIComponent(
    SERVICE_KEY
  )}&type=json&numOfRows=10&pageNo=1`;

  if (["getUsjntTabooInfoList03", "getEfcyDplctInfoList03"].includes(apiName) && drug2) {
    url += `&itemName=${encodeURIComponent(drug1)}&itemName2=${encodeURIComponent(drug2)}`;
  } else {
    url += `&itemName=${encodeURIComponent(drug1)}`;
  }

  try {
    const response = await fetch(url);
    const json = await response.json();
    return json.body?.items || [];
  } catch (err) {
    console.error(`${apiName} 요청 실패:`, err);
    return [];
  }
}

export default function InteractionScreen() {
  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [results1, setResults1] = useState<any[]>([]);
  const [results2, setResults2] = useState<any[]>([]);
  const [mergedResults, setMergedResults] = useState<any[]>([]);

  const handleSearch1 = async (text: string) => {
    setDrug1(text);
    if (text.length > 0) {
      const list = await fetchDrugList(text);
      setResults1(list);
    } else {
      setResults1([]);
    }
  };

  const handleSearch2 = async (text: string) => {
    setDrug2(text);
    if (text.length > 0) {
      const list = await fetchDrugList(text);
      setResults2(list);
    } else {
      setResults2([]);
    }
  };

  const handleCheckInteraction = async () => {
    if (!drug1 || !drug2) {
      Alert.alert("알림", "두 개의 약품명을 모두 입력해주세요.");
      return;
    }

    // 병용금기
    const tabooRes = await fetchDurAPI("getUsjntTabooInfoList03", drug1, drug2);
    const tabooText =
      tabooRes.length > 0
        ? `병용금기 (${cleanText(
            tabooRes[0].PROHBT_CONTENT || tabooRes[0].MIXTURE || "사유 없음"
          )})`
        : null;

    // 효능군 중복
    const duplicateRes = await fetchDurAPI("getEfcyDplctInfoList03", drug1, drug2);
    const duplicateText = duplicateRes.length > 0 ? "효능군 중복" : null;

    // 결과 합치기 병용금기 > 효능군 중복 병용금기 약품은 효능군 중복을 봐도 필요가 없으므로 병용금기만 결과창에 나옴 
    const combined: any[] = [];
    if (tabooText) {
      combined.push({ level: "위험", text: tabooText });
    } else if (duplicateText) {
      combined.push({ level: "주의", text: duplicateText });
    }

    setMergedResults(combined);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>약물 상호작용 확인</Text>
          <Text style={styles.subtitle}>두 개의 약품명을 입력하고 결과를 확인하세요.</Text>

          {/* 첫 번째 약품 입력 */}
          <TextInput
            style={styles.input}
            placeholder="첫 번째 약품명"
            value={drug1}
            onChangeText={handleSearch1}
            placeholderTextColor="#666"
          />
          {results1.length > 0 && (
            <View style={styles.suggestionBox}>
              {results1.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setDrug1(item.ITEM_NAME);
                    setResults1([]);
                  }}
                >
                  <Text style={styles.suggestion}>{item.ITEM_NAME}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 두 번째 약품 입력 */}
          <TextInput
            style={styles.input}
            placeholder="두 번째 약품명"
            value={drug2}
            onChangeText={handleSearch2}
            placeholderTextColor="#666"
          />
          {results2.length > 0 && (
            <View style={styles.suggestionBox}>
              {results2.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setDrug2(item.ITEM_NAME);
                    setResults2([]);
                  }}
                >
                  <Text style={styles.suggestion}>{item.ITEM_NAME}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 상호작용 확인 버튼 */}
          <TouchableOpacity style={styles.checkButton} onPress={handleCheckInteraction}>
            <Text style={styles.buttonText}>상호작용 확인</Text>
          </TouchableOpacity>

          {/* 결과 출력 */}
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>[약물 상호작용 결과]</Text>
            {mergedResults.length === 0 ? (
              <Text style={styles.safeText}>특별한 상호작용 정보 없음</Text>
            ) : (
              mergedResults.map((item, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.detailText,
                    item.level === "위험" ? styles.dangerText : styles.warningText,
                  ]}
                >
                  {item.text}
                </Text>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flexGrow: 1, padding: SIZES.padding },
  title: { ...FONTS.h1, color: COLORS.primary, marginBottom: SIZES.base },
  subtitle: { ...FONTS.p, color: COLORS.darkGray, marginBottom: SIZES.padding * 2 },
  input: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...FONTS.p,
    color: "#000",
    fontWeight: "600",
  },
  suggestionBox: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    marginBottom: SIZES.base,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGray,
    color: COLORS.darkGray,
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
  buttonText: { ...FONTS.h3, color: COLORS.white },
  resultBox: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
  },
  resultTitle: { ...FONTS.h2, fontWeight: "bold", color: COLORS.darkGray, marginBottom: 8 },
  safeText: { ...FONTS.p, color: COLORS.gray },
  detailText: { ...FONTS.p, marginBottom: 5 },
  dangerText: { color: COLORS.danger, fontWeight: "bold" },
  warningText: { color: "#FF9F43", fontWeight: "600" },
});
