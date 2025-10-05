// MedicationEditScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import { useAppStore } from "./store/appStore";

function fmt(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function MedicationEditScreen({ route, navigation }: any) {
  const { state, updateLinked, updateTimer, addTimer, removeTimer } =
    useAppStore();

  const passed = route.params?.medication ?? null;
  const id = route.params?.id ?? passed?.id;
  const medication =
    (id ? state.medications.find((m) => m.id === id) : null) ?? passed;

  const [medicationName, setMedicationName] = useState(medication?.name ?? "");
  const [selectedType, setSelectedType] = useState(medication?.type ?? "");

  const [expiryDate, setExpiryDate] = useState(
    medication?.expiry ? new Date(medication.expiry) : new Date()
  );
  const [startDate, setStartDate] = useState(
    medication?.startDate ? new Date(medication.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    medication?.endDate ? new Date(medication.endDate) : new Date()
  );

  const [alarmFlag, setAlarmFlag] = useState(medication?.alarmFlag ?? true);
  const [familyShare, setFamilyShare] = useState(
    medication?.familyShare ?? false
  );
  const [nightSilent, setNightSilent] = useState(
    medication?.nightSilent ?? false
  );

  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [intervalMinutes, setIntervalMinutes] = useState(
    medication?.intervalMinutes ? String(medication.intervalMinutes) : ""
  );
  const [alarmTimes, setAlarmTimes] = useState<string[]>(
    Array.isArray(medication?.times) ? medication!.times : []
  );
  const [showPickerIndex, setShowPickerIndex] = useState<number | null>(null);

  // 모드 판별 (복용기간 / 유통기한)
  const [mode, setMode] = useState<"period" | "expiry">(
    medication?.expiry && !medication?.startDate && !medication?.endDate
      ? "expiry"
      : "period"
  );

  // interval/alarm 구분은 그대로 유지
  const initialMode =
    medication?.intervalMinutes && medication.intervalMinutes > 0
      ? "interval"
      : medication?.times && medication.times.length > 0
      ? "alarm"
      : "interval";

  const medTypes = ["해열제", "항생제", "진통제", "혈압약"];

  const addAlarmTime = () => {
    setAlarmTimes([...alarmTimes, ""]);
    setShowPickerIndex(alarmTimes.length);
  };

  const removeAlarmTime = (index: number) => {
    setAlarmTimes(alarmTimes.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!medicationName.trim()) {
      Alert.alert("알림", "약 이름을 입력하세요.");
      return;
    }
    if (!selectedType.trim()) {
      Alert.alert("알림", "약 종류를 선택하세요.");
      return;
    }

    let minutes = parseInt(intervalMinutes, 10);
    if (isNaN(minutes) || minutes < 0) minutes = 0;

    let filteredTimes = alarmTimes.filter((t) => t && t.trim() !== "");

    if (mode === "period") {
      if (initialMode === "interval") {
        if (minutes <= 0) {
          Alert.alert("알림", "복용 간격(분)을 입력하세요.");
          return;
        }
        filteredTimes = [];
      } else if (initialMode === "alarm") {
        if (filteredTimes.length === 0) {
          Alert.alert("알림", "복용 알람 시간을 입력하세요.");
          return;
        }
        minutes = 0;
      }
    } else {
      minutes = 0;
      filteredTimes = [];
    }

    let safeTotalSec = minutes > 0 ? minutes * 60 : 0;
    if (!safeTotalSec || isNaN(safeTotalSec) || safeTotalSec <= 0) {
      safeTotalSec = 60;
    }

    const countMode: "auto" | "manual" =
      minutes > 0 ? "manual" : filteredTimes.length > 0 ? "auto" : "manual";

    updateLinked({
      ...medication,
      name: medicationName.trim(),
      type: selectedType,
      startDate: mode === "period" ? fmt(startDate) : "",
      endDate: mode === "period" ? fmt(endDate) : "",
      expiry: mode === "expiry" ? fmt(expiryDate) : "",
      times: mode === "period" ? filteredTimes : [],
      intervalMinutes: mode === "period" ? minutes : 0,
      alarmFlag,
      familyShare,
      nightSilent,
      countMode,
    });

    const targetTimer = state.timers.find((t) => t.id === medication.id);
    if (mode === "period" && minutes > 0) {
      if (targetTimer) {
        updateTimer({
          ...targetTimer,
          name: medicationName.trim(),
          totalSec: safeTotalSec,
          baseTime: 0,
          isRunning: false,
          pauseOffset: 0,
        });
      } else {
        addTimer({
          id: medication.id,
          name: medicationName.trim(),
          times: [],
          totalSec: safeTotalSec,
          baseTime: 0,
          isRunning: false,
          pauseOffset: 0,
        });
      }
    } else {
      if (targetTimer) removeTimer(medication.id);
    }

    Alert.alert("완료", "수정되었습니다.", [
      { text: "확인", onPress: () => navigation.goBack() },
    ]);
  };

  if (!medication) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
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
          >
            <Picker.Item label="약 종류를 선택하세요" value="" />
            {medTypes.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>

        {/* 복용 방식 선택 */}
        <Text style={styles.label}>복용 방식</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "period" && { backgroundColor: COLORS.primary }]}
            onPress={() => setMode("period")}
          >
            <Text style={{ color: mode === "period" ? COLORS.white : COLORS.darkGray }}>복용 기간</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "expiry" && { backgroundColor: COLORS.primary }]}
            onPress={() => setMode("expiry")}
          >
            <Text style={{ color: mode === "expiry" ? COLORS.white : COLORS.darkGray }}>유통기한</Text>
          </TouchableOpacity>
        </View>

        {/* 복용기간 모드 */}
        {mode === "period" && (
          <>
            <Text style={styles.label}>복용 기간</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.input, { flex: 1 }]}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={{ color: COLORS.darkGray }}>{fmt(startDate)}</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 8, alignSelf: "center", color: COLORS.darkGray }}>~</Text>
              <TouchableOpacity
                style={[styles.input, { flex: 1 }]}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={{ color: COLORS.darkGray }}>{fmt(endDate)}</Text>
              </TouchableOpacity>
            </View>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
                onChange={(_, d) => {
                  if (d) setStartDate(d);
                  setShowStartPicker(false);
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="spinner"
                onChange={(_, d) => {
                  if (d) setEndDate(d);
                  setShowEndPicker(false);
                }}
              />
            )}

            <Text style={styles.label}>
              복용 간격 (분)
              {initialMode === "interval" && <Text style={{ color: "red" }}> ※ 수정 불가</Text>}
              {initialMode === "alarm" && <Text style={{ color: "red" }}> ※ 복용 알람은 간격 수정 불가</Text>}
            </Text>
            <TextInput
              style={[styles.input, (initialMode === "alarm" || initialMode === "interval") && { backgroundColor: COLORS.gray }]}
              placeholder="예: 180"
              placeholderTextColor={COLORS.gray}
              value={intervalMinutes}
              onChangeText={setIntervalMinutes}
              keyboardType="numeric"
              editable={false}
            />

            <Text style={styles.label}>
              복용 알람
              {initialMode === "interval" && <Text style={{ color: "red" }}> ※ 복용 간격으로 등록된 약은 수정 불가</Text>}
            </Text>
            {alarmTimes.map((t, idx) => (
              <View key={idx} style={styles.alarmRow}>
                <TouchableOpacity
                  style={[styles.timeInput, initialMode === "interval" && { backgroundColor: COLORS.gray }]}
                  onPress={() => initialMode === "alarm" && setShowPickerIndex(idx)}
                  disabled={initialMode === "interval"}
                >
                  <Text style={{ color: COLORS.darkGray }}>{t || "시간 선택"}</Text>
                </TouchableOpacity>
                {initialMode === "alarm" && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => removeAlarmTime(idx)}>
                    <Icon name="trash-can" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {initialMode === "alarm" && (
              <TouchableOpacity style={styles.addBtn} onPress={addAlarmTime}>
                <Icon name="plus" size={20} color={COLORS.white} />
              </TouchableOpacity>
            )}

            {showPickerIndex !== null && showPickerIndex < alarmTimes.length && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={(_, d) => {
                  if (d && showPickerIndex !== null) {
                    const mm = String(d.getMinutes()).padStart(2, "0");
                    const ampm = d.getHours() < 12 ? "오전" : "오후";
                    const dispH = d.getHours() % 12 || 12;
                    setAlarmTimes((prev) => {
                      const newTimes = [...prev];
                      if (showPickerIndex < newTimes.length) {
                        newTimes[showPickerIndex] = `${ampm} ${dispH}:${mm}`;
                      }
                      return newTimes;
                    });
                  }
                  setShowPickerIndex(null);
                }}
              />
            )}
          </>
        )}

        {/* 유통기한 모드 */}
        {mode === "expiry" && (
          <>
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
          </>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  backButton: { padding: SIZES.base },
  title: { ...FONTS.h2, color: COLORS.darkGray, textAlign: "center" },
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
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  pickerBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  picker: { height: 50, width: "100%" },
  toggleBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: SIZES.radius,
    padding: 12,
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: { ...FONTS.h3, color: COLORS.white },
  alarmRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  timeInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: SIZES.radius,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    alignSelf: "flex-start",
  },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    padding: 10,
    borderRadius: 30,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
