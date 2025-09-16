import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, StatusBar, Platform, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import { useAppStore } from "./store/appStore";

function fmt(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function DisposalAddScreen({ navigation }: any) {
  const { addDisposal } = useAppStore();
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("안내", "약 이름을 입력하세요.");
      return;
    }
    addDisposal({
      id: Date.now().toString(),
      name: name.trim(),
      expiry: fmt(expiry),
    });
    Alert.alert("완료", "폐기 알림이 등록되었습니다.", [
      { text: "확인", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.label}>약 이름</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="예: 이부프로펜" />
        
        <Text style={styles.label}>유통기한</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateTxt}>{fmt(expiry)}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker value={expiry} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(_, d) => { setShowPicker(false); if (d) setExpiry(d); }} />
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveTxt}>저장</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.padding },
  container: { flex: 1 },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius, padding: 12, ...FONTS.p },
  dateTxt: { ...FONTS.p, color: COLORS.darkGray },
  saveBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: SIZES.radius, marginTop: 30, alignItems: "center" },
  saveTxt: { ...FONTS.h3, color: COLORS.white },
});
