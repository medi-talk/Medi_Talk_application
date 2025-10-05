// IntakeDetailScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useAppStore } from "./store/appStore";

export default function IntakeDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { state, removeIntake } = useAppStore();
  const [data, setData] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const found = state.intakes.find((i) => i.id === id);
      if (found) {
        try {
          const parsedDose = JSON.parse(found.dose);
          setData({ ...found, nutrients: parsedDose });
        } catch {
          setData({ ...found, nutrients: {} });
        }
      } else {
        navigation.navigate("IntakeListScreen");
      }
    }, [id, state.intakes, navigation])
  );

  const handleDelete = () => {
    Alert.alert("삭제 확인", "이 영양소를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          removeIntake(id);
          Alert.alert("삭제 완료", "영양소가 삭제되었습니다.");
          navigation.goBack(); 
        },
      },
    ]);
  };

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.black} />
        </TouchableOpacity>

        <Text style={styles.header}>IntakeDetailScreen</Text>

        <View style={styles.groupBox}>
          <Text style={styles.groupTitle}>{data.name}</Text>
        </View>

        <View style={styles.section}>
          {Object.entries(data.nutrients || {}).map(([key, value]) => {
            if (!value || value === "0") return null;
            return (
              <View key={key} style={styles.itemBlock}>
                <Text style={styles.itemLabel}>{formatLabel(key)}</Text>
                <Text style={styles.itemValue}>{String(value)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("IntakeEditScreen", { id })}
          >
            <Text style={styles.btnText}>수정하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.btnText}>삭제하기</Text>
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
  container: { padding: SIZES.padding, paddingBottom: 40 },
  backBtn: { marginBottom: 10 },
  header: { ...FONTS.h2, marginBottom: 10 },
  groupBox: { alignItems: "center", marginVertical: 20 },
  groupTitle: { ...FONTS.h2, color: COLORS.primary },
  section: { marginBottom: 40 },
  itemBlock: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    paddingBottom: 8,
  },
  itemLabel: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: 6 },
  itemValue: { ...FONTS.h3, color: COLORS.black, textAlign: "left", paddingLeft: 4 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  editBtn: {
    flex: 1,
    backgroundColor: "#4285F4",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { ...FONTS.h3, color: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { ...FONTS.h3, color: COLORS.darkGray },
});