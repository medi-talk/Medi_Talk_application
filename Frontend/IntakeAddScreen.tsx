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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useAppStore } from "./store/appStore"; 

export default function IntakeAddScreen({ navigation }: any) {
  const { addIntake } = useAppStore(); 

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

  const handleChange = (key: string, value: string) => {
    setNutrients((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!groupName.trim()) {
      Alert.alert("입력 오류", "영양소 그룹명을 입력하세요.");
      return;
    }

    addIntake({
      id: Date.now().toString(),
      name: groupName,
      dose: JSON.stringify(nutrients),
    });

    Alert.alert("저장 완료", "영양소가 추가되었습니다.");
    navigation.goBack();
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
          <TouchableOpacity style={styles.cameraBtn}>
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
