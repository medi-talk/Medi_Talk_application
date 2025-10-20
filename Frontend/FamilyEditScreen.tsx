// FamilyEditScreen.tsx
import React, { useState, useEffect, use } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';
import api from './utils/api';

const RELATIONS = ['부모', '형제자매', '자녀', '배우자', '보호자', '기타'];

export default function FamilyEditScreen({ route, navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;
  const familyId = route.params?.familyId;

  const [nickname, setNickname] = useState("");
  const [relation, setRelation] = useState("");
  const [memo, setMemo] = useState("");

  // 가족 정보 API 호출
  useEffect(() => {
    if (!familyId || !userId) return;
    (async () => {
      try {
        const res = await api.get(`/api/family/getUserFamilyDetail/${userId}/${familyId}`);

        if (!res.data.success) {
          Alert.alert('오류', '가족 정보를 불러오는 데 실패했습니다.');
          return;
        }

        const family = res.data.family;
        setNickname(family.nickname);
        setRelation(family.relation);
        setMemo(family.memo || "");

      } catch (err: any) {
        console.error('❌ fetch family detail error:', err);

        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status == 500) {
          Alert.alert('서버 오류', message);
        } else {
          Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
        }
      } 
    })();
  }, [userId, familyId]);

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('입력 오류', '이름을 입력해주세요.');
      return;
    }
    if (!relation) {
      Alert.alert('입력 오류', '관계를 선택해주세요.');
      return;
    }

    try {
      const res = await api.put(`/api/family/updateUserFamily/${userId}/${familyId}`, {
        nickname: nickname.trim(),
        relation,
        memo: memo.trim(),
      });

      if (!res.data.success) {
        Alert.alert('오류', res.data?.message || '가족 정보 수정에 실패했습니다.');
        return;
      }

      Alert.alert('저장 완료', '가족 정보가 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);

    } catch (err: any) {
      console.error('❌ update family error:', err);

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
        <Text style={styles.headerTitle}>가족 정보 수정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>이름 (별명)</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="이름을 입력하세요"
          placeholderTextColor={COLORS.gray}
        />

        <Text style={styles.label}>관계</Text>
        <View style={styles.relationContainer}>
          {RELATIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.relationBtn,
                relation === r && styles.relationSelected,
              ]}
              onPress={() => setRelation(r)}
            >
              <Text
                style={[
                  styles.relationText,
                  relation === r && { color: COLORS.white },
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>복약 메모 (선택)</Text>
        <TextInput
          style={[styles.input, styles.memo]}
          value={memo}
          onChangeText={setMemo}
          placeholder="복약 관련 메모를 입력하세요"
          placeholderTextColor={COLORS.gray}
          multiline
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>저장</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: { ...FONTS.h2, color: COLORS.darkGray },

  container: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },

  label: { ...FONTS.h3, color: COLORS.gray, marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    padding: SIZES.base * 1.5,
    marginTop: 8,
    color: COLORS.darkGray,
    backgroundColor: COLORS.lightGray,
  },
  memo: { height: 100, textAlignVertical: 'top' },

  relationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  relationBtn: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  relationSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  relationText: {
    ...FONTS.p,
    color: COLORS.darkGray,
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 30,
  },
  saveBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});