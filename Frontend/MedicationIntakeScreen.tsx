// MedicationIntakeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SIZES } from './styles/theme';

export default function MedicationIntakeScreen({ navigation }: any) {
  const [intakeHistory, setIntakeHistory] = useState([
    { date: '2025년 08월 27일', times: ['12:30', '18:30'] },
    { date: '2025년 08월 28일', times: ['17:23'] },
    { date: '2025년 08월 29일', times: ['09:01', '13:05', '19:21'] },
  ]);

  const handleDeleteTime = (date: string, time: string) => {
    setIntakeHistory((prev) =>
      prev
        .map((item) =>
          item.date === date
            ? { ...item, times: item.times.filter((t) => t !== time) }
            : item
        )
        .filter((item) => item.times.length > 0)
    );
  };

  const handleNowIntake = () => {
    const now = new Date();
    const today = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}월 ${String(now.getDate()).padStart(2, '0')}일`;
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    setIntakeHistory((prev) => {
      const existing = prev.find((item) => item.date === today);
      if (existing) {
        if (!existing.times.includes(nowTime)) existing.times.push(nowTime);
        return [...prev];
      } else {
        return [...prev, { date: today, times: [nowTime] }];
      }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>복용 확인</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {intakeHistory
          .sort((a, b) => (a.date < b.date ? -1 : 1))
          .map((item, idx) => (
            <View key={idx} style={styles.section}>
              <Text style={styles.dateTitle}>{item.date}</Text>
              {item.times.map((t, i) => (
                <View key={i} style={styles.timeRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.timeText}>{t}</Text>
                    <Text style={styles.doneText}>복용 완료</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteTime(item.date, t)}
                  >
                    <Text style={styles.deleteText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.separator} />
            </View>
          ))}

        {/* Buttons (지정 복용 제거, 두 버튼만) */}
        <View style={styles.buttons}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.halfBtn, { backgroundColor: '#81C784' }]}
              onPress={handleNowIntake}
            >
              <Text style={styles.actionText}>지금 복용</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.halfBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.actionText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backArrow: { ...FONTS.h2, color: COLORS.darkGray },
  headerTitle: { ...FONTS.h2, color: COLORS.darkGray },

  scroll: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 3,
  },

  section: { marginBottom: 20 },
  dateTitle: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: 6 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  timeText: { ...FONTS.p, color: COLORS.darkGray, marginRight: 8 },
  doneText: { ...FONTS.p, color: '#4CAF50', fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: COLORS.lightGray, marginTop: 8 },

  deleteBtn: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteText: { ...FONTS.p, color: COLORS.darkGray, fontWeight: '500' },

  // 버튼 영역 (두 개 나란히)
  buttons: {
    marginTop: 30,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  actionText: { ...FONTS.h3, color: COLORS.white },
});