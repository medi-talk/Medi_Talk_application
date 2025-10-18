// FamilyMedicationListScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";

export default function FamilyMedicationListScreen({ route, navigation }: any) {
  const { familyId, familyName } = route.params;

  // 더미 데이터 (추후 DB 연동 시 familyId 기준으로 가져오기)
  const medications = [
    { id: 1, name: "타이레놀", startDate: "2025-10-17", endDate: "2025-10-20", interval: 30 },
    { id: 2, name: "비타민C", startDate: "2025-10-10", endDate: "2025-10-30", interval: 60 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{familyName}님의 복용약 목록</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 약 목록 */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {medications.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("FamilyMedicationIntake", {
                medicationId: item.id,
                medicationName: item.name,
                familyName,
                familyId,
              })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>{item.name}</Text>
              <Text style={styles.period}>
                복용기간: {item.startDate} ~ {item.endDate}
              </Text>
              <Text style={styles.interval}>복용 간격: {item.interval}분</Text>
            </View>
            <Icon name="chevron-right" size={26} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: { ...FONTS.h2, color: COLORS.darkGray },

  scroll: { padding: SIZES.padding },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medName: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: 4 },
  period: { ...FONTS.p, color: COLORS.gray },
  interval: { ...FONTS.p, color: COLORS.gray },
});