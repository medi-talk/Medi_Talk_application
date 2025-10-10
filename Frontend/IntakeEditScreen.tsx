// IntakeEditScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
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
import api from "./utils/api";

type intakeNutrient = {
  nutrientId: number;
  intake: number | string;
};

type EditParams = {
  userNutrientId: number;
  groupTitle: string;
  intakes: intakeNutrient[];
};

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

const labelList: Array<[label: string, key: keyof NutrientsShape]> = [
  ["비타민 A (μg RAE)", "vitaminA"],
  ["비타민 D (μg)", "vitaminD"],
  ["비타민 E (mg α-TE)", "vitaminE"],
  ["비타민 K (μg)", "vitaminK"],
  ["비타민 C (mg)", "vitaminC"],
  ["티아민 (mg)", "thiamin"],
  ["리보플라빈 (mg)", "riboflavin"],
  ["비타민 B6 (mg)", "vitaminB6"],
  ["엽산 (μg)", "folate"],
  ["비타민 B12 (μg)", "vitaminB12"],
  ["판토텐산 (mg)", "pantothenic"],
  ["비오틴 (μg)", "biotin"],
];

type NutrientsShape = {
  vitaminA: string;
  vitaminD: string;
  vitaminE: string;
  vitaminK: string;
  vitaminC: string;
  thiamin: string;
  riboflavin: string;
  vitaminB6: string;
  folate: string;
  vitaminB12: string;
  pantothenic: string;
  biotin: string;
};


export default function IntakeEditScreen({ route, navigation }: any) {

  const { 
    userNutrientId, groupTitle: initialGroupTitle, intakes 
  } = (route.params as EditParams) ?? ({} as EditParams);

  const [groupName, setGroupName] = useState(initialGroupTitle || "");
  const [nutrients, setNutrients] = useState<NutrientsShape>({
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

  // id -> key 맵핑
  const idToKey = useMemo(() => {
    const rev: Record<number, keyof NutrientsShape> = {};
    (Object.keys(nutrientIdMap) as Array<keyof NutrientsShape>).forEach((key) => {
      rev[nutrientIdMap[key]] = key;
    });
    return rev;
  }, []);

  useEffect(() => {
    try {
      const next: NutrientsShape = { ...nutrients };
      intakes.forEach(({ nutrientId, intake }) => {
        const key = idToKey[nutrientId];
        if (key) {
          next[key] = String(intake);
        }
      });
      setNutrients(next);
    } catch {
      console.warn("영양소 데이터 파싱 실패");
    }
  }, [userNutrientId, intakes, idToKey]);

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
    return (Object.keys(nutrientIdMap) as Array<keyof NutrientsShape>).map((key) => ({
      nutrientId: nutrientIdMap[key],
      intake: toZeroNumber(nutrients[key]),
    }));
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert("입력 오류", "영양소 그룹명을 입력하세요.");
      return;
    }

    try {
      const payload = {
        groupName: groupName.trim(),
        nutrients: buildNutrientsPayload(),
      };

      const res = await api.put(`/api/intakeCalc/updateUserNutrientGroupWithIntakes/${userNutrientId}`, payload);

      if (res.data.success) {
        Alert.alert("수정 완료", "영양소 정보가 수정되었습니다.");
        navigation.goBack();
      }


    } catch (err : any) {
      console.error("Error updating nutrient group:", err);
      
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
