// MedicationDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';

// HH:mm → 오전/오후 hh:mm 변환
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

export default function MedicationDetailScreen({ route, navigation }: any) {
  const passed = route.params?.medication ?? null;
  const passedId = route.params?.id ?? passed?.id;
  const { state, removeLinked } = useAppStore();

  const medication =
    (passedId ? state.medications.find(m => m.id === passedId) : null) ?? passed ?? null;

  if (!medication) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <Text style={styles.value}>약 정보가 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('삭제 확인', '정말 이 약을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          removeLinked(medication.id);
          navigation.goBack();
        },
      },
    ]);
  };

  // 등록한 시각 + intervalMinutes로 다음 복용 알람 계산
  const nextAlarm = medication.intervalMinutes && medication.times?.length
    ? (() => {
        const base = medication.times[0]; // 첫 등록 시각
        const [hStr, mStr] = base.split(":");
        const baseDate = new Date();
        baseDate.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);

        const nextDate = new Date(baseDate.getTime() + medication.intervalMinutes * 60000);
        const hh = String(nextDate.getHours()).padStart(2, "0");
        const mm = String(nextDate.getMinutes()).padStart(2, "0");

        return displayKoreanTime(`${hh}:${mm}`);
      })()
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>{medication.name}</Text>

        <Text style={styles.label}>약 종류</Text>
        <Text style={styles.value}>{medication.type || '선택 안 함'}</Text>

        {medication.startDate && medication.endDate ? (
          <>
            <Text style={styles.label}>복용 기간</Text>
            <Text style={styles.value}>
              {medication.startDate} ~ {medication.endDate}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.label}>유통기한</Text>
            <Text style={styles.value}>{medication.expiry}</Text>
          </>
        )}

        {medication.intervalMinutes ? (
          <>
            <Text style={styles.label}>복용 간격</Text>
            <Text style={styles.value}>{medication.intervalMinutes}분</Text>
          </>
        ) : null}

        <Text style={styles.label}>다음 복용 알람</Text>
        <Text style={styles.value}>{nextAlarm ?? '없음'}</Text>

        <Text style={styles.label}>알림</Text>
        <Text style={styles.value}>{medication.alarmFlag ? 'ON' : 'OFF'}</Text>

        <Text style={styles.label}>가족 공개</Text>
        <Text style={styles.value}>{medication.familyShare ? '예' : '아니오'}</Text>

        {/* 새로 추가된 속성들 표시 */}
        <Text style={styles.label}>카운트 모드</Text>
        <Text style={styles.value}>
          {medication.countMode === 'auto' ? '자동 카운트' : '수동 카운트'}
        </Text>

        <Text style={styles.label}>야간 알림</Text>
        <Text style={styles.value}>
          {medication.nightSilent ? 'OFF (야간 끔)' : 'ON (야간 알림 허용)'}
        </Text>

        <View style={styles.rowButtons}>
          <TouchableOpacity
            style={[styles.editBtn, { flex: 1, marginRight: 6 }]}
            onPress={() => navigation.navigate('MedicationEdit', { id: medication.id })}
          >
            <Text style={styles.editBtnText}>수정하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteBtn, { flex: 1, marginLeft: 6 }]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteBtnText}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: SIZES.padding },
  title: { ...FONTS.h1, color: COLORS.primary, marginBottom: 20 },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginTop: 16 },
  value: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  rowButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  editBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  editBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    padding: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  deleteBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});
