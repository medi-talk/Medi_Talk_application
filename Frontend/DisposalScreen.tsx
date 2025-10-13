// DisposalScreen.tsx
import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import { useAppStore } from "./store/appStore";
import api from "./utils/api";

export type DisposalItem = {
  id: string;
  name: string;
  expiry: string;
  discardId: number;
};

type DiscardMedicationData = {
  userMedicationId: number;
  medicationDiscardId: number;
  medicationName: string;
  endDate: string | null;
  expirationDate: string | null;
}

function toYMD(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;
}

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
  const { state } = useAppStore();
  const userId = state.user?.id;

  const [items, setItems] = useState<DisposalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    try {
      const res = await api.get(`/api/discardInfo/listDiscardMedications/${userId}`);
      const list: DiscardMedicationData[] = res?.data?.medications ?? [];

      const mapped: DisposalItem[] = list
        .map((m) => {
          const chosen = 
            (m.endDate && toYMD(m.endDate)) ||
            (m.expirationDate && toYMD(m.expirationDate)) ||
            "";
          if (!chosen) return null;
          return {
            id: String(m.userMedicationId),
            name: m.medicationName,
            expiry: chosen,
            discardId: m.medicationDiscardId,
          };
        })
        .filter((m): m is DisposalItem => !!m);
      
      setItems(mapped);

    } catch (err : any) {
      console.error("❌ load discard medications error:", err);
      setItems([]);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }

    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => diffDays(a.expiry) - diffDays(b.expiry)
      ),
    [items]
  );

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

        {/* D-Day 뱃지 */}
        <View style={[styles.badge, { borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>

        {/* ? 버튼 (폐기 안내 이동) */}
        <TouchableOpacity
          onPress={() => navigation.navigate("DisposalGuide", { 
            medicationDiscardId: item.discardId,
            medicationName: item.name
           })}
          style={{ marginLeft: 8 }}
        >
          <Icon name="help-circle-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.empty, { gap: 12 }]}>
          <ActivityIndicator />
          <Text style={styles.sub}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

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
          </View>
        }
      />
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
});
