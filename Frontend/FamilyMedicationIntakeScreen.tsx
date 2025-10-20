// FamilyMedicationIntakeScreen.tsx
import React, { useState, useEffect, useMemo } from "react";
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
import { COLORS, FONTS, SIZES } from "./styles/theme";
import api from "./utils/api";

type IntakeData = {
  medicationIntakeId: number;
  intakeDate: string; // 'YYYY-MM-DD'
  intakeTime: string; // 'HH:MM:SS'
};

export default function FamilyMedicationIntakeScreen({ route, navigation }: any) {
  const familyName = route.params?.familyName;
  const medicationId = route.params?.medicationId;
  const medicationName = route.params?.medicationName;

  const [intakes, setIntakes] = useState<IntakeData[]>([]);
  const [loading, setLoading] = useState(false);

  // 'YYYY-MM-DD' -> 'YYYY년 MM월 DD일' 변환
  const toKoreanDate = (isoYmd: string) => {
    if (!isoYmd || isoYmd.length < 10) return isoYmd;
    const y = isoYmd.slice(0, 4);
    const m = isoYmd.slice(5, 7);
    const d = isoYmd.slice(8, 10);
    return `${y}년 ${m}월 ${d}일`;
  };

  // 'HH:MM:SS' -> 'HH:MM' 변환
  const toHHMM = (hms: string) => {
    if (!hms?.includes(':')) return hms || '';
    const [h, m] = hms.split(':');
    return `${h}:${m}`;
  };

  // 복용약 복용 기록 API 호출
  useEffect(() => {
    if (!medicationId) return;
    (async () => {
      try {
        setLoading(true);

        const res = await api.get(`/api/medication/getUserMedicationIntakes/${medicationId}`);

        if (res.data.success) {
          const list: IntakeData[] = res.data.intakes || [];
          setIntakes(list);
        } else {
          Alert.alert('오류', res?.data.message || '복용 기록을 불러오지 못했습니다.');
        }
      } catch (err : any) {
        console.error("❌ getUserMedicationIntakes error:", err);

        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status == 500) {
          Alert.alert('서버 오류', message);
        } else {
          Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [medicationId]);

  // intakes -> 날짜별 그룹으로 변환
  const groupIntakesByDate = useMemo(() => {
    const byDate: Record<string, { id: number, hhmm: string }[]> = {};
    for (const intake of intakes) {
      const dateISO = intake.intakeDate;
      const hhmm = toHHMM(intake.intakeTime);
      if (!byDate[dateISO]) byDate[dateISO] = [];
      byDate[dateISO].push({ id: intake.medicationIntakeId, hhmm });
    }
    return Object.keys(byDate)
      .sort()
      .map((dateISO) => ({
        dateISO,
        dateLabel: toKoreanDate(dateISO),
        times: byDate[dateISO].sort((a, b) => (a.hhmm < b.hhmm ? -1 : 1)),
      }));
  }, [intakes]);

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
        {/* 로딩 메시지 */}
        {loading && (
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <Text style={{ ...FONTS.p, color: COLORS.gray }}>불러오는 중...</Text>
          </View>
        )}

        {!loading &&
          groupIntakesByDate.map((g) => (
            <View key={g.dateISO} style={styles.section}>
              <Text style={styles.dateTitle}>{g.dateLabel}</Text>
              {g.times.map((t) => (
                <View key={t.id} style={styles.timeRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.timeText}>{t.hhmm}</Text>
                    <Text style={styles.doneText}> 복용 완료</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        
        {!loading && groupIntakesByDate.length === 0 && (
          <View style={{ alignItems: 'center', marginVertical: '40%' }}>
            <Text style={{ ...FONTS.p, color: COLORS.gray }}>복용 기록이 없습니다.</Text>
          </View>
        )}

      {/* 확인 버튼 */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
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