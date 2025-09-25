import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppStore } from "./store/appStore";
import { COLORS, SIZES, FONTS } from "./styles/theme";

function toHHMM(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
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

function secondsUntilNext(hhmmList: string[]): number {
  if (hhmmList.length === 0) return 0;
  const now = new Date();
  const nowMs = now.getTime();

  const targets: number[] = hhmmList.map((t) => {
    const [hh, mm] = t.split(":").map(Number);
    const dt = new Date();
    dt.setHours(hh, mm, 0, 0);
    return dt.getTime();
  });

  const future = targets.filter((ms) => ms > nowMs);
  if (future.length > 0) {
    return Math.max(1, Math.floor((future[0] - nowMs) / 1000));
  }

  const [firstH, firstM] = hhmmList
    .map((t) => t.split(":").map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(firstH, firstM, 0, 0);
  return Math.max(1, Math.floor((tomorrow.getTime() - nowMs) / 1000));
}

export default function TimerEditScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { state, updateTimer } = useAppStore();

  const timer = state.timers.find((t) => t.id === id);

  const [name, setName] = useState(timer?.name || "");
  const [times, setTimes] = useState<string[]>(timer?.times || []);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!timer) {
      Alert.alert("오류", "타이머 데이터를 찾을 수 없습니다.", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    }
  }, [timer, navigation]);

  if (!timer) return null;

  const onChange = (_: any, date?: Date) => {
    if (!date) {
      setShowPicker(false);
      return;
    }
    setPickerDate(date);

    const val = toHHMM(date);
    setTimes((prev) => {
      if (prev.includes(val)) return prev;
      const next = [...prev, val].sort(
        (a, b) =>
          parseInt(a.slice(0, 2), 10) - parseInt(b.slice(0, 2), 10) ||
          parseInt(a.slice(3), 10) - parseInt(b.slice(3), 10)
      );
      return next;
    });

    setShowPicker(false);
  };

  const removeTime = (t: string) => {
    setTimes((prev) => prev.filter((x) => x !== t));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("알림", "약 이름을 입력하세요.");
      return;
    }
    if (times.length === 0) {
      Alert.alert("알림", "복용 시간을 최소 1개 이상 추가하세요.");
      return;
    }

    updateTimer({
      ...timer,
      name: name.trim(),
      times,
      nextRemainingSec: secondsUntilNext(times),
    });

    Alert.alert("완료", "타이머가 수정되었습니다.", [
      { text: "확인", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>타이머 수정</Text>

        <Text style={styles.label}>약 이름</Text>
        <TextInput
          style={styles.inputField}
          placeholder="약 이름을 입력하세요"
          placeholderTextColor={COLORS.gray}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>복용 시간</Text>
        <TouchableOpacity
          style={styles.addTimeBtn}
          onPress={() => setShowPicker(true)}
        >
          <Icon name="clock-plus-outline" size={18} color={COLORS.white} />
          <Text style={styles.addTimeBtnTxt}>복용 시간 추가</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 12 }}>
          {times.map((t) => (
            <View key={t} style={styles.timeCard}>
              <Text style={styles.timeTxt}>{displayKoreanTime(t)}</Text>
              <TouchableOpacity onPress={() => removeTime(t)} style={{ padding: 6 }}>
                <Icon name="close" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {showPicker && (
          <DateTimePicker
            value={pickerDate}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={onChange}
          />
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnTxt}>저장</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: SIZES.padding },
  title: { ...FONTS.h2, color: COLORS.darkGray, marginBottom: 16 },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: 8 },
  inputField: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    color: COLORS.darkGray,
    ...FONTS.p,
    marginBottom: 16,
  },
  addTimeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  addTimeBtnTxt: { ...FONTS.h3, color: COLORS.white, marginLeft: 6 },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 8,
  },
  timeTxt: { ...FONTS.p, color: COLORS.darkGray },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnTxt: { ...FONTS.h3, color: COLORS.white },
});
