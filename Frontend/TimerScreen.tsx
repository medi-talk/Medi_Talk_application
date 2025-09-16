// TimerScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import { useAppStore, TimerItem } from "./store/appStore";

function formatHMS(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function TimerScreen({ navigation }: any) {
  const { state, removeTimer } = useAppStore();
  const [items, setItems] = useState<TimerItem[]>(state.timers);

  // 전역 timers 변경 시 로컬 items와 동기화
  useEffect(() => {
    setItems(state.timers);
  }, [state.timers]);

  // 1초마다 로컬 카운트다운만 감소
  useEffect(() => {
    const intervalId = setInterval(() => {
      setItems((prev) =>
        prev.map((it) =>
          it.nextRemainingSec > 0
            ? { ...it, nextRemainingSec: it.nextRemainingSec - 1 }
            : it
        )
      );
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = (timerId: string) => {
    Alert.alert("삭제 확인", "정말 이 타이머를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => removeTimer(timerId),
      },
    ]);
  };

  const renderItem = ({ item }: { item: TimerItem }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>

      {/* 시간 + 삭제 버튼 같은 줄 배치 */}
      <View style={styles.row}>
        <Text style={styles.time}>{formatHMS(item.nextRemainingSec)}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Icon name="delete" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {item.times.map((t, i) => (
        <Text key={i} style={styles.subTime}>{t}</Text>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>등록된 타이머가 없습니다.</Text>
            <Text style={styles.emptySub}>아래 + 버튼을 눌러 타이머를 추가하세요</Text>
          </View>
        }
      />

      {/* + 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("TimerAdd")}
      >
        <Icon name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>
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
  subTime: { ...FONTS.p, color: COLORS.gray },
  empty: { flex: 1, alignItems: "center", marginTop: "40%" },
  emptyText: { ...FONTS.h2, color: COLORS.darkGray },
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
