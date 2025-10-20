// MedicationIntakeScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from './styles/theme';
import api from './utils/api';


type IntakeData = {
  medicationIntakeId: number;
  intakeDate: string;   // 'YYYY-MM-DD'
  intakeTime: string;   // 'HH:MM:SS'
};

export default function MedicationIntakeScreen({ route, navigation }: any) {
  const medicationId = route.params?.medicationId;

  const [intakes, setIntakes] = useState<IntakeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);  // 지금 복용 중복 방지

  // 'YYYY-MM-DD' -> 'YYYY년 MM월 DD일' 변환
  const toKoreanDate = (isoYmd: string) => {
    if (!isoYmd || isoYmd.length < 10) return isoYmd;
    const y = isoYmd.slice(0, 4);
    const m = isoYmd.slice(5, 7);
    const d = isoYmd.slice(8, 10);
    return `${y}년 ${m}월 ${d}일`;
  };

  // 'HH:MM:SS' -> 'HH:MM' 변환
  const toHHMM = (hms: string) => {
    if (!hms?.includes(':')) return hms || '';
    const [h, m] = hms.split(':');
    return `${h}:${m}`;
  };

  // 복용약 복용 기록 API 호출
  const fetchIntakeList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/medication/getUserMedicationIntakes/${medicationId}`);

      if (res.data.success) {
        const list: IntakeData[] = res.data.intakes || [];
        setIntakes(list);
      } else {
        Alert.alert('오류', res?.data.message || '복용 기록을 불러오지 못했습니다.');
      }

    } catch (err : any) {
      console.error("❌ getUserMedicationIntakes error:", err);

      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }

    } finally {
      setLoading(false);
    }
  }, [medicationId])

  useFocusEffect(
    useCallback(() => {
      fetchIntakeList();
    }, [fetchIntakeList])
  );

  // intakes -> 날짜별 그룹으로 변환
  const groupIntakesByDate = useMemo(() => {
    const byDate: Record<string, { id: number, hhmm: string }[]> = {};
    for (const intake of intakes) {
      const dateISO = intake.intakeDate;
      const hhmm = toHHMM(intake.intakeTime);
      if (!byDate[dateISO]) byDate[dateISO] = [];
      byDate[dateISO].push({ id: intake.medicationIntakeId, hhmm });
    }
    return Object.keys(byDate)
      .sort()
      .map((dateISO) => ({
        dateISO,
        dateLabel: toKoreanDate(dateISO),
        times: byDate[dateISO].sort((a, b) => (a.hhmm < b.hhmm ? -1 : 1)),
      }));
  }, [intakes]);

  const handleDeleteTime = (medicationIntakeId: number) => {
    Alert.alert('삭제 확인', '정말 이 복용 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await api.delete(`/api/medication/deleteUserMedicationIntake/${medicationIntakeId}`);

            if (res.data.success) {
              Alert.alert('삭제 완료', '복용 기록이 삭제되었습니다.');
              await fetchIntakeList();

            } else {
              Alert.alert('삭제 실패', res.data.message || '복용 기록을 삭제하지 못했습니다.');
            }

          } catch (err: any) {
            console.error("❌ deleteUserMedicationIntake error:", err);

            const status = err.response?.status;
            const message = err.response?.data?.message;

            if (status == 500) {
              Alert.alert('서버 오류', message);
            } else {
              Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
            }
          }
        },
      },
    ]);
  };

  const handleNowIntake = async () => {
    if (creating) return;  // 중복 방지
    try {
      setCreating(true);

      const now = new Date();
      const y = String(now.getFullYear());
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');

      const intakeDate = `${y}-${m}-${d}`;
      const intakeTime = `${hh}:${mm}:${ss}`;

      const res = await api.post(`/api/medication/createUserMedicationIntake/${medicationId}`, {
        intake: { intakeDate, intakeTime }
      });

      if (res.data.success) {
        Alert.alert('복용 완료', '복용 기록이 추가되었습니다.');
        await fetchIntakeList();
      } else {
        Alert.alert('오류', res.data.message || '복용 기록을 추가하지 못했습니다.');
      }

    } catch (err: any) {
      console.error("❌ createUserMedicationIntake error:", err);

      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }

    } finally {
      setCreating(false);
    }
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
        {/* 로딩 메시지 */}
        {loading && (
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <Text style={{ ...FONTS.p, color: COLORS.gray }}>불러오는 중...</Text>
          </View>
        )}

        {/* 복용 기록 리스트 */}
        {!loading &&
          groupIntakesByDate.map((g) => (
            <View key={g.dateISO} style={styles.section}>
              <Text style={styles.dateTitle}>{g.dateLabel}</Text>
              {g.times.map((t) => (
                <View key={t.id} style={styles.timeRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.timeText}>{t.hhmm}</Text>
                    <Text style={styles.doneText}>복용 완료</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteTime(t.id)}
                  >                    
                    <Text style={styles.deleteText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        
        {!loading && groupIntakesByDate.length === 0 && (
          <View style={{ alignItems: 'center', marginVertical: '40%' }}>
            <Text style={{ ...FONTS.p, color: COLORS.gray }}>복용 기록이 없습니다.</Text>
          </View>
        )}

        {/* Buttons (지정 복용 제거, 두 버튼만) */}
        <View style={styles.buttons}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.halfBtn, { backgroundColor: '#81C784', opacity: creating ? 0.6 : 1 }]}
              onPress={handleNowIntake}
              disabled={creating}
            >
              <Text style={styles.actionText}>{creating ? '기록 중...' : '지금 복용'}</Text>
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