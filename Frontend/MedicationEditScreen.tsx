import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, StatusBar, Alert, Switch
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';

function fmt(date: Date) {
  return date.toISOString().split('T')[0];
}

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

function getNextAlarmFromInterval(minutes: number): string {
  const now = new Date();
  const next = new Date(now.getTime() + minutes * 60000);
  const hh = String(next.getHours()).padStart(2, '0');
  const mm = String(next.getMinutes()).padStart(2, '0');
  return displayKoreanTime(`${hh}:${mm}`);
}

function generateTimesFromNow(minutes: number): string[] {
  const list: string[] = [];
  const now = new Date();
  let current = new Date(now);
  for (let m = 0; m < 1440; m += minutes) {
    const hh = String(current.getHours()).padStart(2, '0');
    const mm = String(current.getMinutes()).padStart(2, '0');
    list.push(`${hh}:${mm}`);
    current = new Date(current.getTime() + minutes * 60000);
  }
  return list;
}

export default function MedicationEditScreen({ route, navigation }: any) {
  const { state, updateLinked, updateTimer } = useAppStore();

  const passed = route.params?.medication ?? null;
  const id = route.params?.id ?? passed?.id;
  const medication = (id ? state.medications.find(m => m.id === id) : null) ?? passed;

  const [medicationName, setMedicationName] = useState(medication?.name ?? '');
  const [selectedType, setSelectedType] = useState(medication?.type ?? '');
  const [expiryDate, setExpiryDate] = useState(
    medication?.expiry ? new Date(medication.expiry) : new Date()
  );
  const [alarmFlag, setAlarmFlag] = useState(medication?.alarmFlag ?? true);
  const [familyShare, setFamilyShare] = useState(medication?.familyShare ?? false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const [intervalMinutes, setIntervalMinutes] = useState(
    medication?.intervalMinutes ? String(medication.intervalMinutes) : ''
  );

  const [countMode, setCountMode] = useState<'auto' | 'manual'>(medication?.countMode ?? 'auto');
  const [nightSilent, setNightSilent] = useState(medication?.nightSilent ?? false);

  const [nextAlarm, setNextAlarm] = useState<string | null>(null);

  const medTypes = ['해열제', '항생제', '진통제', '혈압약'];

  useEffect(() => {
    if (!medication) {
      Alert.alert('오류', '수정할 약 정보를 찾을 수 없습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } else if (medication.intervalMinutes) {
      setNextAlarm(getNextAlarmFromInterval(medication.intervalMinutes));
    }
  }, [medication, navigation]);

  const handleSave = () => {
    if (!medicationName.trim()) {
      Alert.alert('알림', '약 이름을 입력하세요.');
      return;
    }
    if (!selectedType.trim()) {
      Alert.alert('알림', '약 종류를 선택하세요.');
      return;
    }
    if (!intervalMinutes.trim() || Number(intervalMinutes) <= 0) {
      Alert.alert('알림', '복용 간격을 입력하세요.');
      return;
    }

    const minutes = Number(intervalMinutes);
    const finalTimes = generateTimesFromNow(minutes);
    const fixedNextAlarm = getNextAlarmFromInterval(minutes);

    updateLinked({
      ...medication,
      name: medicationName.trim(),
      type: selectedType,
      expiry: fmt(expiryDate),
      times: finalTimes,
      intervalMinutes: minutes,
      alarmFlag,
      familyShare,
      countMode,
      nightSilent,
    });

    const targetTimer = state.timers.find(t => t.id === medication.id);
    if (targetTimer) {
      updateTimer({
        ...targetTimer,
        totalSec: minutes * 60,
        baseTime: Date.now(),
        isRunning: countMode === "auto",
      });
    }

    setNextAlarm(fixedNextAlarm);

    Alert.alert('완료', '수정되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  if (!medication) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.title}>복용 약 수정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>약 이름</Text>
        <TextInput
          style={styles.input}
          value={medicationName}
          onChangeText={setMedicationName}
        />

        <Text style={styles.label}>약 종류 선택</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedType}
            onValueChange={(itemValue) => setSelectedType(itemValue)}
            style={[styles.picker, { color: COLORS.darkGray }]}
            dropdownIconColor={COLORS.primary}
            itemStyle={{ color: COLORS.darkGray }} // ✅ 여기만 수정
          >
            <Picker.Item label="약 종류를 선택하세요" value="" />
            {medTypes.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>복용 간격 (분)</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 180"
          placeholderTextColor={COLORS.gray}
          value={intervalMinutes}
          onChangeText={setIntervalMinutes}
          keyboardType="numeric"
        />

        <Text style={styles.label}>다음 복용 알람</Text>
        <Text style={styles.value}>{nextAlarm ?? '없음'}</Text>

        <Text style={styles.label}>유통기한</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowExpiryPicker(true)}>
          <Text style={{ color: COLORS.darkGray }}>{fmt(expiryDate)}</Text>
        </TouchableOpacity>
        {showExpiryPicker && (
          <DateTimePicker
            value={expiryDate}
            mode="date"
            display="spinner"
            onChange={(_, d) => {
              if (d) setExpiryDate(d);
              setShowExpiryPicker(false);
            }}
          />
        )}

        <Text style={styles.label}>알림 설정</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>복용 알림</Text>
          <Switch value={alarmFlag} onValueChange={setAlarmFlag} />
        </View>

        <Text style={styles.label}>가족 공개</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>가족 공개</Text>
          <Switch value={familyShare} onValueChange={setFamilyShare} />
        </View>

        <Text style={styles.label}>카운트 모드</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.toggleBtn, countMode === 'auto' && { backgroundColor: COLORS.primary }]}
            onPress={() => setCountMode('auto')}
          >
            <Text style={{ color: countMode === 'auto' ? COLORS.white : COLORS.darkGray }}>
              자동 카운트
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, countMode === 'manual' && { backgroundColor: COLORS.primary }]}
            onPress={() => setCountMode('manual')}
          >
            <Text style={{ color: countMode === 'manual' ? COLORS.white : COLORS.darkGray }}>
              수동 카운트
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>야간 알림</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>새벽 시간 알림 끄기</Text>
          <Switch value={nightSilent} onValueChange={setNightSilent} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>저장</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base,
  },
  backButton: { padding: SIZES.base },
  title: { ...FONTS.h2, color: COLORS.darkGray, textAlign: 'center' },
  container: { padding: SIZES.padding, paddingBottom: 40 },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginTop: 20, marginBottom: 8 },
  value: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 12,
    ...FONTS.p,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  pickerBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  picker: { height: 50, width: '100%' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  toggleBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: SIZES.radius,
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  switchLabel: { ...FONTS.p, color: COLORS.darkGray },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: { ...FONTS.h3, color: COLORS.white },
});
