// DrugInfoScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
} from "react-native";
import { COLORS, SIZES, FONTS } from "./styles/theme";

const SERVICE_KEY = ""; // 공공데이터포털 디코딩키

async function fetchDrugInfo(name: string) {
  const url = `https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList?serviceKey=${encodeURIComponent(
    SERVICE_KEY
  )}&type=json&itemName=${encodeURIComponent(name)}&numOfRows=5&pageNo=1`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.body?.items || [];
  } catch (e) {
    console.error("약품 조회 실패:", e);
    return [];
  }
}

// 자동완성 (입력값 기반)
async function fetchDrugSuggestions(query: string) {
  return fetchDrugInfo(query);
}

export default function DrugInfoScreen() {
  const [name, setName] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // 입력값 바뀔 때 자동완성 실행
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (name.trim().length > 0) {
        const list = await fetchDrugSuggestions(name.trim());
        setSuggestions(list);
      } else {
        setSuggestions([]);
      }
    }, 500); // 0.5초 지연
    return () => clearTimeout(timer);
  }, [name]);

  const handleSearch = async () => {
    if (!name.trim()) {
      Alert.alert("알림", "약 이름을 입력하세요.");
      return;
    }
    const infoList = await fetchDrugInfo(name.trim());
    if (infoList.length === 0) {
      Alert.alert("안내", "해당 약품 정보를 찾을 수 없습니다.");
    }
    setResults(infoList);
    setSuggestions([]); // 자동완성 닫기
  };

  const handleSelectSuggestion = (item: any) => {
    setName(item.itemName || item.ITEM_NAME || "");
    setSuggestions([]);
  };

  //FlatList에 넣을 데이터 구성
  const dataToRender = [
    { type: "header" },
    ...(suggestions.length > 0
      ? suggestions.map((s, i) => ({ type: "suggestion", key: `s-${i}`, ...s }))
      : results.map((r, i) => ({ type: "result", key: `r-${i}`, ...r }))),
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={dataToRender}
        keyExtractor={(item, index) => item.key || index.toString()}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View style={styles.container}>
                <Text style={styles.title}>약품 정보 조회</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="예: 타이레놀"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                  <Text style={styles.searchTxt}>조회</Text>
                </TouchableOpacity>
              </View>
            );
          }

          if (item.type === "suggestion") {
            return (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Text style={styles.suggestionText}>
                  {item.ITEM_NAME || item.itemName || "이름 없음"}
                </Text>
              </TouchableOpacity>
            );
          }

          if (item.type === "result") {
            return (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>{item.ITEM_NAME || "약품명"}</Text>
                <Text>📌 효능: {item.efcyQesitm || "정보 없음"}</Text>
                <Text>💊 사용법: {item.useMethodQesitm || "정보 없음"}</Text>
                <Text>⚠ 경고: {item.atpnWarnQesitm || "정보 없음"}</Text>
                <Text>ℹ 주의사항: {item.atpnQesitm || "정보 없음"}</Text>
                <Text>🔄 상호작용: {item.intrcQesitm || "정보 없음"}</Text>
                <Text>❗ 부작용: {item.seQesitm || "정보 없음"}</Text>
                <Text>📦 보관법: {item.depositMethodQesitm || "정보 없음"}</Text>
              </View>
            );
          }

          return null;
        }}
        contentContainerStyle={{ padding: SIZES.padding }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { marginBottom: 20 },
  title: { ...FONTS.h1, color: COLORS.primary, marginBottom: 20 },
  input: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: SIZES.radius,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 10,
    color: "#000",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  suggestionText: { color: COLORS.darkGray, fontSize: 15 },
  searchBtn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginBottom: 10,
  },
  searchTxt: { ...FONTS.h3, color: COLORS.white },
  infoBox: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: SIZES.radius,
    marginTop: 10,
  },
  infoTitle: {
    ...FONTS.h2,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.darkGray,
  },
});
