// MedicationDetailScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from './styles/theme';
import api from './utils/api';

type MedicationData = {
  userMedicationId: number;
  medicationDiscardId: number;
  medicationType: string;
  medicationName: string;
  startDate: string | null;
  endDate: string | null;
  expirationDate: string | null;
  intervalTime: number | null;
  intervalMinutes: number | null;
  alarmFlag: number | boolean;
  dawnAlarmOffFlag: number | boolean;
  familyNotifyFlag: number | boolean;
  alarmTimes: string[];
};

function displayKoreanTime(hhmm: string) {
  if (!hhmm.includes(':')) return hhmm;
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return hhmm;
  const am = h < 12;
  const period = am ? '오전' : '오후';
  let dispH = h % 12;
  if (dispH === 0) dispH = 12;
  return `${period} ${dispH}:${String(m).padStart(2, '0')}`;
}

export default function MedicationDetailScreen({ route, navigation }: any) {
  const medicationId = route.params?.medicationId;

  const [medication, setMedication] = useState<MedicationData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!medicationId) {
      setMedication(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/api/medication/getUserMedicationDetail/${medicationId}`);
      if (res.data.success) {
        const med: MedicationData = res.data.medication;
        setMedication(med);
      } else {
        Alert.alert('오류', res.data.message || '약 정보를 불러오지 못했습니다.');
        setMedication(null);
      }
    } catch (err: any) {
      console.error('❌ getUserMedicationDetail error:', err);
      setMedication(null);
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [medicationId]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  const handleDelete = () => {
    Alert.alert('삭제 확인', '정말 이 약을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await api.delete(`/api/medication/deleteUserMedication/${medicationId}`);
            if (res.data.success) {
              Alert.alert('삭제 완료', '약이 삭제되었습니다.');
              navigation.goBack();
            } else {
              Alert.alert('삭제 실패', res.data.message);
            }
          } catch (err: any) {
            console.error('delete medication error:', err);
            const status = err?.response?.status;
            const message = err?.response?.data?.message;
            if (status === 500) {
              Alert.alert('서버 오류', message);
            } else {
              Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
            }
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.container, { alignItems: 'center', marginTop: '40%' }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ ...FONTS.p, color: COLORS.gray, marginTop: 8 }}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

  const hasPeriod = medication.startDate && medication.endDate;
  const intervalMinutes =
    typeof medication.intervalMinutes === 'number' ? medication.intervalMinutes : null;
  const alarms = medication.alarmTimes || [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.title}>{medication.medicationName}</Text>

          <Text style={styles.label}>약 종류</Text>
          <Text style={styles.value}>{medication.medicationType || '선택 안 함'}</Text>

          {hasPeriod ? (
            <>
              <Text style={styles.label}>복용 기간</Text>
              <Text style={styles.value}>
                {medication.startDate} ~ {medication.endDate}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>유통기한</Text>
              <Text style={styles.value}>{medication.expirationDate || '-'}</Text>
            </>
          )}

          {intervalMinutes && intervalMinutes > 0 ? (
            <>
              <Text style={styles.label}>복용 간격</Text>
              <Text style={styles.value}>{intervalMinutes}분</Text>
            </>
          ) : alarms.length > 0 ? (
            <>
              <Text style={styles.label}>복용 알람</Text>
              {alarms.map((t, i) => (
                <Text key={i} style={styles.value}>
                  {displayKoreanTime(t)}
                </Text>
              ))}
            </>
          ) : null}

          <Text style={styles.label}>알림</Text>
          <Text style={styles.value}>{medication.alarmFlag ? 'ON' : 'OFF'}</Text>

          <Text style={styles.label}>가족 공개</Text>
          <Text style={styles.value}>{medication.familyNotifyFlag ? '예' : '아니오'}</Text>

          <Text style={styles.label}>야간 알림</Text>
          <Text style={styles.value}>
            {medication.dawnAlarmOffFlag ? 'OFF (야간 끔)' : 'ON (야간 알림 허용)'}
          </Text>

          {/* 복용 확인 버튼 */}
          <TouchableOpacity
            style={styles.checkBtn}
            onPress={() =>
              navigation.navigate('MedicationIntake', { medicationId: medication.userMedicationId })
            }
          >
            <Text style={styles.checkText}>복용 확인</Text>
          </TouchableOpacity>

          {/* 수정/삭제 버튼 */}
          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={[styles.editBtn, { flex: 1, marginRight: 6 }]}
              onPress={() =>
                navigation.navigate('MedicationEdit', {
                  userMedicationId: medication.userMedicationId,
                })
              }
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  scroll: { paddingBottom: 40 },
  container: { padding: SIZES.padding },
  title: { ...FONTS.h1, color: COLORS.primary, marginBottom: 20 },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginTop: 16 },
  value: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  checkBtn: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 24,
  },
  checkText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  rowButtons: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 20,
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