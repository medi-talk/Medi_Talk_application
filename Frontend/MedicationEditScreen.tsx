// MedicationEditScreen.tsx
import React, { useState, useMemo, useEffect } from "react";
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
import api from "./utils/api";  

type DiscardType = { id: number; type: string };

function fmt(date: Date) {
  return date.toISOString().split("T")[0];
}

// minutes -> "HH:MM:SS" 변환 (MySQL TIME 형식)
function minutesToTimeStr(mins: number | string): string | null {
  const minutes = Number(mins);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;

  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");

  return `${hh}:${mm}:00`;
};

// "오전/오후 00:00" -> "HH:MM:SS" 변환 (MySQL TIME 형식)
function displayTimeToTimeStr(disp: string): string | null {
  if (!disp) return null;

  const time = disp.match(/(오전|오후)\s*(\d{1,2}):(\d{2})/);
  if (!time) return null;
  
  const [, ampm, hhStr, mmStr] = time;
  let hh = Number(hhStr);
  const mm = Number(mmStr);
  if (ampm === "오전") {
    if (hh === 12) hh = 0; // 12 AM -> 0
  } else {
    if (hh !== 12) hh += 12; // PM, 12 PM 제외하고 +12
  }
  const hhP = String(hh).padStart(2, "0");
  const mmP = String(mm).padStart(2, "0");

  return `${hhP}:${mmP}:00`;
};

// HH:mm 또는 "오전 08:00" 같은 문자열 변환
function displayKoreanTime(hhmm: string) {
  if (!hhmm.includes(":")) return hhmm;
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return hhmm;

  const am = h < 12;
  const period = am ? "오전" : "오후";
  let dispH = h % 12;
  if (dispH === 0) dispH = 12;
  return `${period} ${dispH}:${String(m).padStart(2, "0")}`;
}

// "HH:MM:SS" -> "HH:MM" 변환
function timeStrToHHMM(t: string) {
  const m = t?.match(/^(\d{2}):(\d{2}):\d{2}$/);
  if (!m) return t;
  return `${m[1]}:${m[2]}`;
}


export default function MedicationEditScreen({ route, navigation }: any) {
  const id = route.params?.userMedicationId;

  // 약 이름
  const [medicationName, setMedicationName] = useState("");

  // 약 종류
  const [types, setTypes] = useState<DiscardType[]>([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const selectedType = useMemo(
    () => types.find((t) => t.id === selectedTypeId)?.type ?? "",
    [types, selectedTypeId]
  );

  // 날짜
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // 플래그
  const [alarmFlag, setAlarmFlag] = useState(true);
  const [familyShare, setFamilyShare] = useState(false);
  const [nightSilent, setNightSilent] = useState(false);

  // 피커
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // 간격/알람
  const [intervalMinutes, setIntervalMinutes] = useState("");
  const [alarmTimes, setAlarmTimes] = useState<string[]>([]);
  const [showPickerIndex, setShowPickerIndex] = useState<number | null>(null);

  // 모드(기간/유통기한) + 초기 간격/알람 모드
  const [mode, setMode] = useState<"period" | "expiry">("period");
  const [initialMode, setInitialMode] = useState<"interval" | "alarm">("interval");

  // 약 종류 API 호출
  useEffect(() => {
    (async () => {
      try {
        setTypesLoading(true);

        const res = await api.get(`/api/discardInfo/listMedicationDiscardTypes`);

        if (res.data.success) {
          const list: DiscardType[] = (res.data.types || []).map((t: any) => ({
            id: t.medicationDiscardId,
            type: t.medicationType,
          }));
          setTypes(list);
        } else {
          Alert.alert("오류", "약 종류를 불러오지 못했습니다.");
        }
      } catch (err : any) {
        console.error("❌ load discard types error:", err);

        const status = err?.response?.status;
        const message = err?.response?.data?.message;

        if (status == 500) {
          Alert.alert('서버 오류', message);
        } else {
          Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
        }
      } finally {
        setTypesLoading(false);
      }
    })();
  }, []);

  // 기존 약 정보 불러오기
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/api/medication/getUserMedicationDetail/${id}`);

        if (!res.data.success) {
          Alert.alert("오류", "약 정보를 불러오지 못했습니다.");
          return;
        }

        const med = res.data.medication;

        setMedicationName(med.medicationName);
        setSelectedTypeId(med.medicationDiscardId || null);

        if (med.startDate) setStartDate(new Date(med.startDate));
        if (med.endDate) setEndDate(new Date(med.endDate));
        if (med.expirationDate) setExpiryDate(new Date(med.expirationDate));

        setAlarmFlag(!!med.alarmFlag);
        setFamilyShare(!!med.familyNotifyFlag);
        setNightSilent(!!med.dawnAlarmOffFlag);

        const isExpiry = !!med.expirationDate && !med.startDate && !med.endDate;
        setMode(isExpiry ? "expiry" : "period");
        
        const ivMin = Number(med.intervalMinutes ?? 0);
        setIntervalMinutes(ivMin > 0 ? String(ivMin) : "");
        const timesDisp = Array.isArray(med.alarmTimes)
          ? med.alarmTimes
            .map((t: string) => displayKoreanTime(timeStrToHHMM(t)))
            .filter(Boolean)
          : [];
        setAlarmTimes(timesDisp);
        setInitialMode(ivMin > 0 ? "interval" : timesDisp.length > 0 ? "alarm" : "interval");

      } catch (err : any) {
        console.error("❌ load medication error:", err);

        const status = err?.response?.status;
        const message = err?.response?.data?.message;

        if (status == 500) {
          Alert.alert('서버 오류', message);
        } else {
          Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
        }
      }
    })();
  }, [id]);

  const addAlarmTime = () => {
    setAlarmTimes([...alarmTimes, ""]);
    setShowPickerIndex(alarmTimes.length);
  };

  const removeAlarmTime = (index: number) => {
    setAlarmTimes(alarmTimes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!medicationName.trim()) {
      Alert.alert("알림", "약 이름을 입력하세요.");
      return;
    }
    if (selectedTypeId === null) {
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

    const intervalTimeStr = minutesToTimeStr(minutes);
    const alarmTimeList = Array.from(
      new Set(
        filteredTimes
          .map(displayTimeToTimeStr)
          .filter((t): t is string => !!t)
      )
    );

    const isPeriod = mode === "period";
    const medicationPayload = {
      medicationDiscardId: selectedTypeId,
      medicationName: medicationName.trim(),
      startDate: isPeriod ? fmt(startDate) : null,
      endDate: isPeriod ? fmt(endDate) : null,
      expirationDate: !isPeriod ? fmt(expiryDate) : null,
      intervalTime: isPeriod && initialMode === "interval" ? intervalTimeStr : null,
      alarmFlag: !!alarmFlag,
      dawnAlarmOffFlag: !!nightSilent,
      familyNotifyFlag: !!familyShare,
    };

    try {
      const isAlarmMode = (mode === "period" && initialMode === "alarm");

      if (isAlarmMode) {
        await api.put(`/api/medication/updateUserMedicationWithAlarms/${id}`, {
          medication: medicationPayload,
          alarmTimes: alarmTimeList,
        });
      } else {
        await api.put(`/api/medication/updateUserMedication/${id}`, {
          medication: medicationPayload
        });
      }
    } catch (err : any) {
      console.error("❌ update medication error:", err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }
    }

    Alert.alert("완료", "수정되었습니다.", [
      { text: "확인", onPress: () => navigation.goBack() },
    ]);
  };

  if (!id) return null;

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
            selectedValue={selectedTypeId ?? ""}
            onValueChange={(val) => {
              if (val === "" || val === null || val === undefined) {
                setSelectedTypeId(null);
              } else if (typeof val === "number") {
                setSelectedTypeId(val);
              } else {
                const num = Number(val);
                setSelectedTypeId(Number.isFinite(num) ? num : null);
              }
            }}
            style={[styles.picker, { color: COLORS.darkGray }]}
            dropdownIconColor={COLORS.primary}
          >
            <Picker.Item
              label={typesLoading ? "불러오는 중..." : "약 종류를 선택하세요"}
              value=""
              />
            {types.map((t) => (
              <Picker.Item key={t.id} label={t.type} value={t.id} />
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
