// FamilyMedicationIntakeScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { COLORS, FONTS, SIZES } from "./styles/theme";

export default function FamilyMedicationIntakeScreen({ route, navigation }: any) {
  const { medicationName = "복용약", familyName = "가족" } = route.params || {};

  // 예시 데이터 (DB 연동 시 medicationId, familyId 기준으로 가져올 예정)
  const [intakeHistory] = useState([
    { date: "2025년 10월 15일", times: ["09:00", "18:00"] },
    { date: "2025년 10월 16일", times: ["09:10", "18:05"] },
    { date: "2025년 10월 17일", times: ["08:55", "18:00"] },
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {familyName}님 - {medicationName} 복용 이력
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 복용 기록 리스트 */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {intakeHistory.length === 0 ? (
          <Text style={styles.emptyText}>복용 기록이 없습니다.</Text>
        ) : (
          intakeHistory
            .sort((a, b) => (a.date < b.date ? -1 : 1))
            .map((item, idx) => (
              <View key={idx} style={styles.section}>
                <Text style={styles.dateTitle}>{item.date}</Text>
                {item.times.map((t, i) => (
                  <View key={i} style={styles.timeRow}>
                    <Text style={styles.timeText}>{t}</Text>
                    <Text style={styles.doneText}>복용 완료</Text>
                  </View>
                ))}
                <View style={styles.separator} />
              </View>
            ))
        )}
      </ScrollView>

      {/* 확인 버튼 */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
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
  backArrow: { ...FONTS.h2, color: COLORS.darkGray },
  headerTitle: { ...FONTS.h3, color: COLORS.darkGray, textAlign: "center", flex: 1 },

  scroll: { padding: SIZES.padding, paddingBottom: SIZES.padding * 2 },
  section: { marginBottom: 20 },
  dateTitle: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: 6 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  timeText: { ...FONTS.p, color: COLORS.darkGray },
  doneText: { ...FONTS.p, color: "#4CAF50", fontWeight: "bold" },
  separator: { height: 1, backgroundColor: COLORS.lightGray, marginTop: 6 },
  emptyText: {
    ...FONTS.p,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 40,
  },

  bottom: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  confirmBtn: {
    borderRadius: SIZES.radius,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  confirmText: { ...FONTS.h3, color: COLORS.white },
});