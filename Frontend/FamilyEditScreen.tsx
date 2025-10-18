// FamilyEditScreen.tsx
import React, { useState } from 'react';
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

const RELATIONS = ['부모', '형제자매', '자녀', '배우자', '보호자', '기타'];

export default function FamilyEditScreen({ route, navigation }: any) {
  const { family } = route.params;

  const [name, setName] = useState(family.name);
  const [relation, setRelation] = useState(family.relation);
  const [note, setNote] = useState(family.note || '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('입력 오류', '이름을 입력해주세요.');
      return;
    }
    if (!relation) {
      Alert.alert('입력 오류', '관계를 선택해주세요.');
      return;
    }

    navigation.navigate('FamilyDetail', {
      family: { ...family, name, relation, note },
    });

    Alert.alert('저장 완료', '가족 정보가 수정되었습니다.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>가족 정보 수정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>이름 (변경)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
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
          value={note}
          onChangeText={setNote}
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