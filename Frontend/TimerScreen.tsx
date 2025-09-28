// TimerScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, FlatList
} from "react-native";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import { useAppStore, TimerItem } from "./store/appStore";

function formatHMS(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// 등록 시각(baseTime)부터 흘러간 시간으로 남은 시간 계산
function getRemainingSec(item: TimerItem, now: Date) {
  const elapsed = Math.floor((now.getTime() - item.baseTime) / 1000);
  return Math.max(0, item.totalSec - elapsed);
}

export default function TimerScreen() {
  const { state } = useAppStore();
  const [items, setItems] = useState<TimerItem[]>(state.timers);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setItems(state.timers);
  }, [state.timers]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const renderItem = ({ item }: { item: TimerItem }) => {
    const remainingSec = getRemainingSec(item, now);

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.row}>
          <Text style={styles.time}>{formatHMS(remainingSec)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>등록된 타이머가 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.lightGray, padding: SIZES.padding },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 12,
    elevation: 3,
  },
  name: { ...FONTS.h3, color: COLORS.darkGray },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  time: { ...FONTS.h2, color: COLORS.primary },
  empty: { flex: 1, alignItems: "center", marginTop: "40%" },
  emptyText: { ...FONTS.h2, color: COLORS.darkGray },
});
