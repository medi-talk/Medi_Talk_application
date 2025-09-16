import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';

function fmt(date: Date) {
  return date.toISOString().split('T')[0];
}

export default function DisposalAddScreen({ navigation }: any) {
  const { addDisposal } = useAppStore();
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('알림', '약 이름을 입력하세요.');
      return;
    }
    addDisposal({
      id: Date.now().toString(),
      name: name.trim(),
      expiry: fmt(expiry),
    });
    Alert.alert('완료', '폐기 알림이 등록되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>폐기 알림 추가</Text>
      <TextInput
        style={styles.input}
        placeholder="약 이름"
        placeholderTextColor={COLORS.gray}
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={{ color: '#000000' }}>{fmt(expiry)}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={expiry}
          mode="date"
          display="default"
          onChange={(_, d) => {
            if (d) setExpiry(d);
            setShowPicker(false);
          }}
        />
      )}
      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnTxt}>저장</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.padding },
  title: { ...FONTS.h2, marginBottom: 20, color: '#000000' },
  input: {
    borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8,
    padding: 12, marginBottom: 16, ...FONTS.p,
    color: '#000000',
  },
  btn: {
    backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center',
  },
  btnTxt: { ...FONTS.h3, color: COLORS.white }, 
});
