// FamilyAddScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';
// import api from './utils/api'; // 추후 DB 연동 시 사용

export default function FamilyAddScreen({ navigation }: any) {
  const [familyId, setFamilyId] = useState('');
  const [familyName, setFamilyName] = useState('');

  const handleAdd = async () => {
    if (!familyId.trim() || !familyName.trim()) {
      Alert.alert('입력 오류', '아이디와 이름을 모두 입력해주세요.');
      return;
    }

    try {
      // TODO: 추후 DB 연동
      // const res = await api.post('/api/family/addFamily', { familyId, familyName });
      // if (res.data.success) {
      //   Alert.alert('등록 완료', '가족이 추가되었습니다.');
      //   navigation.goBack();
      //   return;
      // }

      // 현재는 더미 동작
      Alert.alert('등록 완료', `${familyName}님이 가족 목록에 추가되었습니다.`);
      navigation.navigate('FamilyList', {
        added: { id: Date.now().toString(), name: familyName, relation: '기타', note: null },
      });
    } catch (err: any) {
      console.error('add family error:', err);
      Alert.alert('오류', '가족 추가 중 문제가 발생했습니다.');
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