// FamilyMedicationListScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import api from "./utils/api";

type MedicationData = {
  userMedicationId: number;
  medicationName: string;
  startDate: string | null;
  endDate: string | null;
  expirationDate: string | null;
  intervalTime: number | null;
  intervalMinutes: number | null;
  alarmTimes: string[];
};

function displayKoreanTime(hhmm: string) {
  if (!hhmm.includes(":")) return hhmm;
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return hhmm;

  const am = h < 12;
  const period = am ? "오전" : "오후";
  let dispH = h % 12;
  if (dispH === 0) dispH = 12;
  return `${period} ${dispH}:${String(m).padStart(2, "0")}`;
};

export default function FamilyMedicationListScreen({ route, navigation }: any) {
  const { familyId, familyName } = route.params;

  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMedicationList = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/medication/listFamilyMedications/${familyId}`);

      if (res.data.success) {
        const meds: MedicationData[] = res.data.medications || [];
        setMedications(meds);
      } else {
        Alert.alert("오류", res.data.message || "가족 복용약 목록을 불러오는 데 실패했습니다.");
      }

    } catch (err : any) {
      console.error("❌ fetch family medication list error:", err);

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
  }, [familyId]);

  useFocusEffect(
    useCallback(() => {
      fetchMedicationList();
    }, [familyId])
  );

  const renderItem = ({ item }: { item: MedicationData }) => {
    const hasPeriod = item.startDate && item.endDate;
    const showInterval =
      typeof item.intervalMinutes === "number"
        ? item.intervalMinutes > 0
        : !!item.intervalTime;
    const alarms = item.alarmTimes || [];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("FamilyMedicationIntake", { 
            familyName,
            medicationId: item.userMedicationId, 
            medicationName: item.medicationName
          })
        }
      >
        <View style={styles.iconContainer}>
          <Icon name="pill" size={28} color={COLORS.primary} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.medicationName}>{item.medicationName}</Text>

          {hasPeriod ? (
            <Text style={styles.medicationPeriod}>
              복용기간: {item.startDate} ~ {item.endDate}
            </Text>
          ) : (
            <Text style={styles.medicationPeriod}>유통기한: {item.expirationDate}</Text>
          )}

          {/* 복용 주기 표시 */}
          {showInterval  ? (
            <Text style={styles.medicationTimes}>
              {typeof item.intervalMinutes === "number" &&
                item.intervalMinutes >= 0
                ? `복용 간격: ${item.intervalMinutes}분`
                : `복용 간격: ${item.intervalTime ?? "-"}`}
            </Text>
          ) : alarms.length > 0 ? (
            <Text style={styles.medicationTimes}>
              복용 알람: {alarms.map(displayKoreanTime).join(", ")}
            </Text>
          ) : (
            <Text style={[styles.medicationTimes, { color: COLORS.gray }]}>
              복용 주기 없음 (유통기한 관리)
            </Text>
          )}
        </View>
        <Icon name="chevron-right" size={24} color={COLORS.gray} />
      </TouchableOpacity>
    );
  };
      
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
      {loading ? (
        <View style={(styles.emptyContainer, { marginTop: '40%' })}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ ...FONTS.p, color: COLORS.gray, marginTop: 8 }}>
            불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.userMedicationId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>표시할 약이 없습니다.</Text>
              <Text style={styles.emptySubText}>
                가족이 약을 등록하거나 공개하면 여기서 확인할 수 있습니다.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingTop: SIZES.padding }}
        />
      )}
    
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + "1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.padding,
  },
  textContainer: { flex: 1 },
  medicationName: { ...FONTS.h3, color: COLORS.darkGray },
  medicationPeriod: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  medicationTimes: { ...FONTS.p, color: COLORS.darkGray, marginTop: 2 },
  emptyContainer: { flex: 1, marginTop: "50%", alignItems: "center" },
  emptyText: { ...FONTS.h2, color: COLORS.darkGray },
  emptySubText: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base },
});