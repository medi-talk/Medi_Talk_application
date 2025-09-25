// MedicationEditScreen.tsx
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
function fmtTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MedicationEditScreen({ route, navigation }: any) {
  const { state, updateLinked } = useAppStore();

  const passed = route.params?.medication ?? null;
  const id = route.params?.id ?? passed?.id;
  const medication = (id ? state.medications.find(m => m.id === id) : null) ?? passed;

  const [medicationName, setMedicationName] = useState(medication?.name ?? '');
  const [selectedType, setSelectedType] = useState(medication?.type ?? '');
  const [expiryDate, setExpiryDate] = useState(
    medication?.expiry ? new Date(medication.expiry) : new Date()
  );
  const [times, setTimes] = useState<string[]>(medication?.times ?? []);
  const [tempTime, setTempTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alarmFlag, setAlarmFlag] = useState(medication?.alarmFlag ?? true);
  const [familyShare, setFamilyShare] = useState(medication?.familyShare ?? false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  // 데모용 약 종류 (DB 연동 시 삭제)
  const medTypes = ['해열제', '항생제', '진통제', '혈압약'];

  // ✅ medication이 없으면 Alert 띄우고 뒤로가기
  useEffect(() => {
    if (!medication) {
      Alert.alert('오류', '수정할 약 정보를 찾을 수 없습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    }
  }, [medication, navigation]);

  const addTime = () => {
    const timeStr = fmtTime(tempTime);
    if (times.includes(timeStr)) {
      Alert.alert('알림', '이미 추가된 시간입니다.');
      return;
    }
    setTimes(prev => [...prev, timeStr]);
  };

  const removeTime = (t: string) => {
    setTimes(prev => prev.filter(x => x !== t));
  };

  const handleSave = () => {
    if (!medicationName.trim()) {
      Alert.alert('알림', '약 이름을 입력하세요.');
      return;
    }
    if (!selectedType.trim()) {
      Alert.alert('알림', '약 종류를 선택하세요.');
      return;
    }
    if (times.length === 0) {
      Alert.alert('알림', '복용 시간을 최소 1개 이상 추가하세요.');
      return;
    }

    updateLinked({
      ...medication,
      name: medicationName.trim(),
      type: selectedType,
      expiry: fmt(expiryDate),
      times,
      alarmFlag,
      familyShare,
    });

    Alert.alert('완료', '수정되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  if (!medication) {
    // 훅 실행 후 렌더만 막음
    return null;
  }

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
            itemStyle={{ color: COLORS.darkGray }}
          >
            <Picker.Item label="약 종류를 선택하세요" value="" color={COLORS.gray} />
            {medTypes.map((t) => (
              <Picker.Item key={t} label={t} value={t} color={COLORS.darkGray} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>복용 시간</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.input, { flex: 1, justifyContent: 'center' }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={{ color: COLORS.darkGray }}>{fmtTime(tempTime)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={addTime}>
            <Icon name="plus" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={(_, d) => {
              if (d) setTempTime(d);
              setShowTimePicker(false);
            }}
          />
        )}

        {times.map((t, i) => (
          <View key={i} style={styles.timeCard}>
            <Text style={styles.timeText}>{t}</Text>
            <TouchableOpacity onPress={() => removeTime(t)}>
              <Icon name="close" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        ))}

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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  addBtn: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  timeText: { ...FONTS.p, color: COLORS.darkGray },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 12,
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
