// MedicationAddScreen.tsx
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

export default function MedicationAddScreen({ navigation }: any) {
  const { addLinked, addTimer, addDisposal } = useAppStore();

  const [medicationName, setMedicationName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [alarmFlag, setAlarmFlag] = useState(true);
  const [familyShare, setFamilyShare] = useState(false);

  const [mode, setMode] = useState<"period" | "expiry">("period");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const [intervalMinutes, setIntervalMinutes] = useState("");
  const [nightSilent, setNightSilent] = useState(false);

  const [alarmTimes, setAlarmTimes] = useState<string[]>([]);
  const [showPickerIndex, setShowPickerIndex] = useState<number | null>(null);

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

    const id = Date.now().toString();

    let minutes = Number(intervalMinutes);
    if (isNaN(minutes) || minutes < 0) minutes = 0;

    let filteredTimes = alarmTimes.filter((t) => t && t.trim() !== "");

    // 복용기간 모드일 때는 interval OR alarm 둘 중 하나 필수
    if (mode === "period") {
      if (minutes <= 0 && filteredTimes.length === 0) {
        Alert.alert("알림", "복용 간격(분) 또는 알람 시간을 입력하세요.");
        return;
      }
      if (minutes > 0) {
        filteredTimes = []; // 간격 모드면 알람 무시
      } else {
        minutes = 0; // 알람 모드면 간격 0
      }
    } else {
      // 유통기한 모드면 타이머 X
      minutes = 0;
      filteredTimes = [];
    }

    // totalSec 안전 값
    const safeTotalSec = minutes > 0 ? Math.max(60, minutes * 60) : 0;

    const countMode: "auto" | "manual" =
      minutes > 0 ? "manual" : filteredTimes.length > 0 ? "auto" : "manual";

    // 약 저장
    addLinked({
      id,
      name: medicationName.trim(),
      type: selectedType,
      startDate: mode === "period" ? fmt(startDate) : "",
      endDate: mode === "period" ? fmt(endDate) : "",
      expiry: mode === "expiry" ? fmt(expiryDate) : "",
      times: filteredTimes,
      intervalMinutes: minutes,
      alarmFlag,
      familyShare,
      countMode,
      nightSilent,
    });

    // 타이머 저장 (간격 모드일 때만)
    if (minutes > 0) {
      addTimer({
        id,
        name: medicationName.trim(),
        times: [],
        totalSec: safeTotalSec,
        baseTime: 0,        // 자동 시작 방지
        isRunning: false,   // 기본은 멈춤 상태
        pauseOffset: 0,
      });
    }

    // 폐기 관리 등록
    addDisposal({
      id,
      name: medicationName.trim(),
      expiry: mode === "expiry" ? fmt(expiryDate) : fmt(endDate),
    });

    Alert.alert("완료", "약이 등록되었습니다.", [
      { text: "확인", onPress: () => navigation.goBack() },
    ]);
  };

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
        <Text style={styles.title}>복용 약 추가</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>어떤 약을 드시나요?</Text>
        <TextInput
          style={styles.input}
          placeholder="약 이름을 입력하세요 (예: 타이레놀)"
          placeholderTextColor={COLORS.gray}
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

        <Text style={styles.label}>복용 방식</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              mode === "period" && { backgroundColor: COLORS.primary },
            ]}
            onPress={() => setMode("period")}
          >
            <Text
              style={{
                color: mode === "period" ? COLORS.white : COLORS.darkGray,
              }}
            >
              복용 기간
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              mode === "expiry" && { backgroundColor: COLORS.primary },
            ]}
            onPress={() => setMode("expiry")}
          >
            <Text
              style={{
                color: mode === "expiry" ? COLORS.white : COLORS.darkGray,
              }}
            >
              유통기한
            </Text>
          </TouchableOpacity>
        </View>

        {mode === "period" ? (
          <>
            {/* 기간 */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.input, { flex: 1 }]}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={{ color: COLORS.darkGray }}>{fmt(startDate)}</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 8, color: COLORS.darkGray }}>~</Text>
              <TouchableOpacity
                style={[styles.input, { flex: 1 }]}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={{ color: COLORS.darkGray }}>{fmt(endDate)}</Text>
              </TouchableOpacity>
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
            </View>

            {/* 간격 */}
            <Text style={styles.label}>복용 간격 (분)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 180 (3시간마다)"
              placeholderTextColor={COLORS.gray}
              value={intervalMinutes}
              onChangeText={setIntervalMinutes}
              keyboardType="numeric"
            />

            {/* 알람 */}
            <Text style={styles.label}>복용 알람 추가</Text>
            {alarmTimes.map((t, idx) => (
              <View key={idx} style={styles.alarmRow}>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setShowPickerIndex(idx)}
                >
                  <Text style={{ color: COLORS.darkGray }}>
                    {t || "시간 선택"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeAlarmTime(idx)}
                >
                  <Icon name="trash-can" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addAlarmTime}>
              <Icon name="plus" size={20} color={COLORS.white} />
            </TouchableOpacity>

            {showPickerIndex !== null &&
              showPickerIndex < alarmTimes.length && (
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
        ) : (
          <>
            <Text style={styles.label}>유통기한</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowExpiryPicker(true)}
            >
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

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>새벽 알림 끄기</Text>
          <Switch value={nightSilent} onValueChange={setNightSilent} />
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
  pickerBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  picker: { height: 50, width: "100%" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
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
  alarmRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
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
