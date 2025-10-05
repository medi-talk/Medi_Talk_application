// TimerScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Button,
} from "react-native";
import notifee from "@notifee/react-native";
import { useIsFocused } from "@react-navigation/native";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import { useAppStore, TimerItem, MedicationItem } from "./store/appStore";

// 알람 예정 시각 계산 → "HH:mm"
function formatAlarmTime(totalSec: number) {
  if (!isFinite(totalSec) || isNaN(totalSec) || totalSec <= 0) totalSec = 60;
  const now = new Date();
  const target = new Date(now.getTime() + totalSec * 1000);
  const h = target.getHours();
  const m = target.getMinutes();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

function TimerScreen() {
  const { state, updateTimer, removeTimer } = useAppStore();
  const isFocused = useIsFocused();
  const [now, setNow] = useState(new Date());

  const notifiedRef = useRef<Set<string>>(new Set());

  // 알림 채널 (앱 시작 시 1회)
  useEffect(() => {
    (async () => {
      await notifee.requestPermission();
      await notifee.createChannel({
        id: "timer-channel",
        name: "타이머 알림",
        vibration: true,
      });
    })();
  }, []);

  // 유효 타이머만 필터링
  const items = useMemo(() => {
    const medsById = new Map<string, MedicationItem>(
      state.medications.map((m) => [m.id, m])
    );
    return state.timers.filter((t) => {
      const med = medsById.get(t.id);
      return med && Number(med.intervalMinutes) > 0;
    });
  }, [state.medications, state.timers]);

  // 1초마다 now 갱신
  useEffect(() => {
    if (!isFocused) return;
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, [isFocused]);

  // 잘못된 타이머 정리
  useEffect(() => {
    const medsById = new Map(state.medications.map((m) => [m.id, m]));
    const toRemove = state.timers
      .filter((t) => {
        const med = medsById.get(t.id);
        return !med || !med.intervalMinutes || med.intervalMinutes <= 0;
      })
      .map((t) => t.id);

    if (toRemove.length) {
      toRemove.forEach((id) => removeTimer(id));
    }
  }, [state.medications, state.timers, removeTimer]);

  // 타이머 종료 시 알림
  useEffect(() => {
    items.forEach((item) => {
      if (!item?.id) return;
      let safeSec = Number(item.totalSec);
      if (!safeSec || isNaN(safeSec) || safeSec <= 0) safeSec = 60;

      const remaining =
        item.isRunning && item.baseTime
          ? Math.max(0, Math.floor((item.baseTime - now.getTime()) / 1000))
          : safeSec;

      if (item.isRunning && remaining <= 0 && !notifiedRef.current.has(item.id)) {
        notifiedRef.current.add(item.id);

        updateTimer({
          ...item,
          isRunning: false,
          pauseOffset: 0,
          baseTime: 0,
        });

        notifee.displayNotification({
          title: "약 복용 알림",
          body: `${item.name || "이 약"} 복용 시간이 되었습니다.`,
          android: {
            channelId: "timer-channel",
            pressAction: { id: "default" },
            vibrationPattern: [500, 1000, 500, 1000],
            sound: "default",
          },
        });
      }
    });
  }, [now, items, updateTimer]);

  const handleStart = (item: TimerItem) => {
    if (!item?.id) return;

    let safeSec = Number(item.totalSec);
    if (!safeSec || isNaN(safeSec) || safeSec <= 0) safeSec = 60;

    updateTimer({
      ...item,
      baseTime: Date.now() + safeSec * 1000, // 알람 예정 시각 저장
      isRunning: true,
      pauseOffset: 0,
      totalSec: safeSec,
    });

    notifee.displayNotification({
      title: "타이머 시작",
      body: `${item.name || "이 약"} 타이머가 시작되었습니다.`,
      android: {
        channelId: "timer-channel",
        vibrationPattern: [300, 600],
        sound: "default",
      },
    });
  };

  const handleReset = (item: TimerItem) => {
    if (!item?.id) return;
    let safeSec = Number(item.totalSec);
    if (!safeSec || isNaN(safeSec) || safeSec <= 0) safeSec = 60;

    updateTimer({
      ...item,
      baseTime: 0,
      isRunning: false,
      pauseOffset: 0,
      totalSec: safeSec,
    });
    notifiedRef.current.delete(item.id);
  };

  const renderItem = ({ item }: { item: TimerItem }) => {
    if (!item?.id) return null;
    const med = state.medications.find((m) => m.id === item.id);
    if (!med || !med.intervalMinutes || med.intervalMinutes <= 0) return null;

    let safeSec = Number(item.totalSec);
    if (!safeSec || isNaN(safeSec) || safeSec <= 0) safeSec = 60;

    // 남은 시간 계산
    const remainingSec =
      item.isRunning && item.baseTime
        ? Math.max(0, Math.floor((item.baseTime - now.getTime()) / 1000))
        : safeSec;

    // "몇시간 몇분 남음"
    const h = Math.floor(remainingSec / 3600);
    const m = Math.floor((remainingSec % 3600) / 60);
    const remainText =
      item.isRunning || remainingSec < safeSec
        ? h > 0
          ? `${h}시간 ${m}분 남음`
          : `${m}분 남음`
        : `${Math.floor(safeSec / 60)}분 후`;

    // 예정 시각
    const alarmTime = item.isRunning
      ? new Date(item.baseTime).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : formatAlarmTime(safeSec);

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name || "이름 없음"}</Text>
        <View style={styles.row}>
          <View style={styles.leftCol}>
            <Text style={styles.time}>
              {remainText} ({alarmTime} 예정)
            </Text>
          </View>
          <View style={styles.rightCol}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => handleStart(item)}
            >
              <Text style={styles.btnText}>시작</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => handleReset(item)}
            >
              <Text style={styles.btnText}>초기화</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Button
        title="테스트 알림 보내기"
        onPress={() =>
          notifee.displayNotification({
            title: "테스트 알림",
            body: "이건 테스트 알림입니다. 잘 보이면 정상입니다!",
            android: {
              channelId: "timer-channel",
              vibrationPattern: [500, 1000, 500, 1000],
              sound: "default",
            },
          })
        }
      />
      <FlatList
        data={items}
        keyExtractor={(i, idx) => (i?.id ? i.id : String(idx))}
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

export default TimerScreen;

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
  leftCol: { flex: 1 },
  rightCol: { flexDirection: "row" },
  time: { ...FONTS.h3, color: COLORS.primary, marginBottom: 4 },
  playBtn: {
    backgroundColor: COLORS.primary,
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
