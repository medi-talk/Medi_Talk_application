import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import BackgroundTimer from "react-native-background-timer";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import { useAppStore, TimerItem } from "./store/appStore";

function formatHMS(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// 남은 시간 계산
function getRemainingSec(item: TimerItem, now: Date) {
  if (!item.isRunning) {
    return Math.max(0, item.totalSec - item.pauseOffset);
  }
  const elapsed = Math.floor((now.getTime() - item.baseTime) / 1000);
  return Math.max(0, item.totalSec - (item.pauseOffset + elapsed));
}

export default function TimerScreen() {
  const { state, updateTimer } = useAppStore();
  const [items, setItems] = useState<TimerItem[]>(state.timers);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setItems(state.timers);
  }, [state.timers]);

  useEffect(() => {
    const intervalId = BackgroundTimer.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      BackgroundTimer.clearInterval(intervalId);
    };
  }, []);

  // 시작
  const handleStart = (item: TimerItem) => {
    if (!item.isRunning) {
      updateTimer({
        ...item,
        baseTime: Date.now(),
        isRunning: true,
      });
    }
  };

  // 일시정지
  const handlePause = (item: TimerItem) => {
    if (item.isRunning) {
      const elapsed = Math.floor((Date.now() - item.baseTime) / 1000);
      updateTimer({
        ...item,
        isRunning: false,
        pauseOffset: item.pauseOffset + elapsed,
      });
    }
  };

  // 리셋
  const handleReset = (item: TimerItem) => {
    updateTimer({
      ...item,
      baseTime: Date.now(),
      isRunning: false,
      pauseOffset: 0,
    });
  };

  const renderItem = ({ item }: { item: TimerItem }) => {
    const medication = state.medications.find((m) => m.id === item.id);
    if (!medication) return null;

    const remainingSec = getRemainingSec(item, now);

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.row}>
          <View style={styles.leftCol}>
            <Text style={styles.time}>{formatHMS(remainingSec)}</Text>
            {medication.intervalMinutes ? (
              <Text style={styles.interval}>{medication.intervalMinutes} 분</Text>
            ) : null}
          </View>
          {medication.countMode === "manual" && (
            <View style={styles.rightCol}>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => handleStart(item)}
              >
                <Text style={styles.btnText}>▶</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pauseBtn}
                onPress={() => handlePause(item)}
              >
                <Text style={styles.btnText}>⏸</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => handleReset(item)}
              >
                <Text style={styles.btnText}>⟲</Text>
              </TouchableOpacity>
            </View>
          )}
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
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightCol: {
    flexDirection: "row",
  },
  time: { ...FONTS.h2, color: COLORS.primary, marginRight: 12 },
  interval: { ...FONTS.p, color: COLORS.gray, marginRight: 12 },
  playBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  pauseBtn: {
    backgroundColor: "#FF9F43",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  resetBtn: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnText: { color: COLORS.white, ...FONTS.h3 },
  empty: { flex: 1, alignItems: "center", marginTop: "40%" },
  emptyText: { ...FONTS.h2, color: COLORS.darkGray },
});
