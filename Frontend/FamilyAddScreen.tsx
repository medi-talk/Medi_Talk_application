// FamilyAddScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';
import api from './utils/api';

export default function FamilyAddScreen({ navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;

  const [familyId, setFamilyId] = useState('');
  const [familyName, setFamilyName] = useState('');

  const handleAdd = async () => {
    if (!familyId.trim() || !familyName.trim()) {
      Alert.alert('입력 오류', '아이디와 이름을 모두 입력해주세요.');
      return;
    }

    // 사용자 존재 여부 확인
    try {
      const res = await api.get(`/api/family/getUser/${familyId}/${familyName}`);
      if (!res.data.success || res.data.user === null) {
        Alert.alert('오류', '해당 아이디와 이름의 사용자가 존재하지 않습니다.');
        return;
      }
    } catch (err: any) {
      console.error("❌ getUser error:", err);
      
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }
    }

    try {
      const res = await api.post(`/api/family/createFamilyLink/${userId}`, { familyId });

      if (!res.data.success) {
        Alert.alert('오류', '가족 추가에 실패했습니다.');
        return;
      }

      Alert.alert("등록 완료", `${familyName}님이 추가되었습니다.`, [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
        
    } catch (err: any) {
      console.error('❌createFamilyLink error:', err);

      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가족 추가</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>아이디</Text>
        <TextInput
          style={styles.input}
          placeholder="아이디를 입력하세요"
          placeholderTextColor={COLORS.gray}
          value={familyId}
          onChangeText={setFamilyId}
        />

        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          placeholder="이름을 입력하세요"
          placeholderTextColor={COLORS.gray}
          value={familyName}
          onChangeText={setFamilyName}
        />

        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addText}>추가</Text>
        </TouchableOpacity>

        <View style={styles.guideBox}>
          <Text style={styles.guideText}>
            아이디, 이름 입력 후 추가 버튼 클릭 시 해당 아이디와 이름이 일치하는 유저가 있는지 확인 후 추가됩니다.
            {'\n'}관계(기타), 메모(null)로 추가 후 수정 시에만 변경 가능합니다.
            {'\n'}한 명만 추가해도 서로 가족으로 등록됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  headerTitle: { ...FONTS.h2, color: COLORS.darkGray },
  container: { flex: 1, paddingHorizontal: SIZES.padding, marginTop: SIZES.padding },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.75,
    ...FONTS.p,
    color: COLORS.darkGray,
    marginBottom: SIZES.padding,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: SIZES.padding,
    elevation: 3,
  },
  addText: { ...FONTS.h3, color: COLORS.white },
  guideBox: {
    marginTop: SIZES.padding * 1.5,
    borderWidth: 1,
    borderColor: COLORS.gray,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  guideText: { ...FONTS.p, color: COLORS.darkGray, lineHeight: 20 },
});