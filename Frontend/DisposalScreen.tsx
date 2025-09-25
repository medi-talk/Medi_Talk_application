import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import { useAppStore } from "./store/appStore";

export type DisposalItem = {
  id: string;
  name: string;
  expiry: string;
};

function diffDays(expiryISO: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ex = new Date(expiryISO);
  ex.setHours(0, 0, 0, 0);
  const ms = ex.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function badgeColor(d: number) {
  if (d <= 0) return COLORS.danger;
  if (d <= 7) return "#FF9F43";
  return COLORS.gray;
}

export default function DisposalScreen({ navigation }: any) {
  const { state, removeDisposal } = useAppStore();

  const sorted = useMemo(
    () =>
      [...state.disposals].sort(
        (a, b) => diffDays(a.expiry) - diffDays(b.expiry)
      ),
    [state.disposals]
  );

  const remove = (id: string) => {
    Alert.alert("삭제", "이 항목을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => removeDisposal(id) },
    ]);
  };

  const renderItem = ({ item }: { item: DisposalItem }) => {
    const d = diffDays(item.expiry);
    const color = badgeColor(d);
    const label = d === 0 ? "D-Day" : d < 0 ? `D+${Math.abs(d)}` : `D-${d}`;

    return (
      <View style={styles.card}>
        {/* 약 이름, 유통기한 */}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>유통기한 {item.expiry}</Text>
        </View>

        {/* 우측 아이콘 영역 */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* D-Day 뱃지 */}
          <View style={[styles.badge, { borderColor: color }]}>
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
          </View>

          {/* ? 버튼 (폐기 안내 이동) */}
          <TouchableOpacity
            onPress={() => navigation.navigate("DisposalGuide", { id: item.id })}
            style={{ marginLeft: 8 }}
          >
            <Icon name="help-circle-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>

          {/* 삭제 버튼 */}
          <TouchableOpacity
            onPress={() => remove(item.id)}
            style={{ marginLeft: 8 }}
          >
            <Icon name="trash-can-outline" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <FlatList<DisposalItem>
        data={sorted}
        keyExtractor={(item: DisposalItem) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: SIZES.padding / 2 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>등록된 항목이 없어요</Text>
            <Text style={styles.emptySub}>
              + 버튼을 눌러 폐기 알림을 추가하세요
            </Text>
          </View>
        }
      />

      {/* ➕ 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("DisposalAdd")}
      >
        <Icon name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.base * 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  name: { ...FONTS.h3, color: COLORS.darkGray },
  sub: { ...FONTS.p, color: COLORS.gray, marginTop: 2 },
  badge: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { ...FONTS.p },
  empty: { flex: 1, alignItems: "center", marginTop: "30%" },
  emptyTitle: { ...FONTS.h2, color: COLORS.darkGray },
  emptySub: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base },
  fab: {
    position: "absolute",
    right: SIZES.padding,
    bottom: SIZES.padding * 2,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
});
