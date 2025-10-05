// MedicationListScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import { useAppStore } from "./store/appStore";


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
}

export default function MedicationListScreen({ navigation }: any) {
  const { state } = useAppStore();

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("MedicationDetail", { medication: item })
        }
      >
        <View style={styles.iconContainer}>
          <Icon name="pill" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.medicationName}>{item.name}</Text>

          {item.startDate && item.endDate ? (
            <Text style={styles.medicationPeriod}>
              복용기간: {item.startDate} ~ {item.endDate}
            </Text>
          ) : (
            <Text style={styles.medicationPeriod}>유통기한: {item.expiry}</Text>
          )}

          {/* 복용 주기 표시 */}
          {item.intervalMinutes > 0 ? (
            <Text style={styles.medicationTimes}>
              복용 간격: {item.intervalMinutes}분
            </Text>
          ) : item.times && item.times.length > 0 ? (
            <Text style={styles.medicationTimes}>
              복용 알람: {item.times.map(displayKoreanTime).join(", ")}
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <FlatList
          data={state.medications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>등록된 약이 없습니다.</Text>
              <Text style={styles.emptySubText}>
                아래 버튼을 눌러 추가해보세요!
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingTop: SIZES.padding }}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("MedicationAdd")}
        >
          <Icon name="plus" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightGray },
  container: { flex: 1 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base * 2,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
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
  fab: {
    position: "absolute",
    right: SIZES.padding,
    bottom: SIZES.padding * 2,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  emptyContainer: { flex: 1, marginTop: "50%", alignItems: "center" },
  emptyText: { ...FONTS.h2, color: COLORS.darkGray },
  emptySubText: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base },
});
