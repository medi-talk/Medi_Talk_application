// IntakeEditScreen.tsx
import React, { useEffect, useState } from "react";
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

export default function IntakeEditScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { state, updateIntake } = useAppStore();
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

  useEffect(() => {
    const found = state.intakes.find((i) => i.id === id);
    if (found) {
      setGroupName(found.name);
      try {
        const parsed = JSON.parse(found.dose);
        setNutrients(parsed);
      } catch {
        console.warn("영양소 데이터 파싱 실패");
      }
    }
  }, [id, state.intakes]);

  const handleChange = (key: string, value: string) => {
    setNutrients((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!groupName.trim()) {
      Alert.alert("입력 오류", "영양소 그룹명을 입력하세요.");
      return;
    }

    const updated = {
      id,
      name: groupName,
      dose: JSON.stringify(nutrients),
    };

    updateIntake(updated);
    Alert.alert("수정 완료", "영양소 정보가 수정되었습니다.");

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>IntakeEditScreen</Text>

        <Text style={styles.label}>영양소 그룹명</Text>
        <TextInput
          style={styles.input}
          placeholder="예: ○○○○○ 종합비타민"
          value={groupName}
          onChangeText={setGroupName}
          placeholderTextColor={COLORS.darkGray}
        />

        <View style={styles.grid}>
          {Object.entries(nutrients).map(([key, value]) => (
            <View key={key} style={styles.inputBox}>
              <Text style={styles.nutrientLabel}>{formatLabel(key)}</Text>
              <TextInput
                style={styles.nutrientInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.darkGray}
                value={String(value)}
                onChangeText={(val) => handleChange(key, val)}
              />
            </View>
          ))}
        </View>

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

function formatLabel(key: string) {
  const map: Record<string, string> = {
    vitaminA: "비타민 A (μg RAE)",
    vitaminD: "비타민 D (μg)",
    vitaminE: "비타민 E (mg α-TE)",
    vitaminK: "비타민 K (μg)",
    vitaminC: "비타민 C (mg)",
    thiamin: "티아민 (mg)",
    riboflavin: "리보플라빈 (mg)",
    vitaminB6: "비타민 B6 (mg)",
    folate: "엽산 (μg DFE)",
    vitaminB12: "비타민 B12 (μg)",
    pantothenic: "판토텐산 (mg)",
    biotin: "비오틴 (μg)",
  };
  return map[key] || key;
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
