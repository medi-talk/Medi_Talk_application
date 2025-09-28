// MedicationListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  FlatList, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';

function displayKoreanTime(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const am = h < 12;
  const period = am ? "오전" : "오후";
  let dispH = h % 12;
  if (dispH === 0) dispH = 12;
  return `${period} ${dispH}:${String(m).padStart(2, "0")}`;
}

// intervalMinutes 기준 다음 알람 (등록 시각을 기준으로 1회만 고정)
function getNextAlarmFromInterval(minutes: number, baseTime: number): string {
  const next = new Date(baseTime + minutes * 60000);
  const hh = String(next.getHours()).padStart(2, '0');
  const mm = String(next.getMinutes()).padStart(2, '0');
  return displayKoreanTime(`${hh}:${mm}`);
}

// times 배열 기준 → 첫 등록된 시간 고정
function getNextAlarmTime(times: string[]): string | null {
  if (!times?.length) return null;
  return displayKoreanTime(times[0]);
}

export default function MedicationListScreen({ navigation }: any) {
  const { state } = useAppStore();
  const [nextAlarms, setNextAlarms] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    const now = Date.now();
    const calc: { [key: string]: string | null } = {};
    state.medications.forEach((item) => {
      calc[item.id] = item.intervalMinutes
        ? getNextAlarmFromInterval(item.intervalMinutes, now)
        : getNextAlarmTime(item.times);
    });
    setNextAlarms(calc);
  }, [state.medications]);

  const renderItem = ({ item }: any) => {
    const nextAlarm = nextAlarms[item.id];

    const intervalText = item.intervalMinutes
      ? `복용 간격: ${item.intervalMinutes}분`
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MedicationDetail', { medication: item })}
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
            <Text style={styles.medicationPeriod}>
              유통기한: {item.expiry}
            </Text>
          )}

          {nextAlarm && (
            <Text style={styles.medicationTimes}>다음 알람: {nextAlarm}</Text>
          )}

          {intervalText && (
            <Text style={styles.medicationTimes}>{intervalText}</Text>
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
              <Text style={styles.emptySubText}>아래 버튼을 눌러 추가해보세요!</Text>
            </View>
          }
          contentContainerStyle={{ paddingTop: SIZES.padding }}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('MedicationAdd')}
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
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: SIZES.padding, marginHorizontal: SIZES.padding, marginBottom: SIZES.base * 2,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary + '1A',
    justifyContent: 'center', alignItems: 'center', marginRight: SIZES.padding,
  },
  textContainer: { flex: 1 },
  medicationName: { ...FONTS.h3, color: COLORS.darkGray },
  medicationPeriod: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  medicationTimes: { ...FONTS.p, color: COLORS.darkGray, marginTop: 2 },
  fab: {
    position: 'absolute', right: SIZES.padding, bottom: SIZES.padding * 2,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8,
  },
  emptyContainer: { flex: 1, marginTop: '50%', alignItems: 'center' },
  emptyText: { ...FONTS.h2, color: COLORS.darkGray },
  emptySubText: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base },
});
