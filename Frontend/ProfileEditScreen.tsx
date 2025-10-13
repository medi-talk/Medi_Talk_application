// ProfileEditScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar, Platform, Switch, Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';
import api from './utils/api';
import { useAppStore } from './store/appStore';

export default function ProfileEditScreen({ navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState<'남자' | '여자'>('남자');
  const [nationality, setNationality] = useState<'내국인' | '외국인'>('내국인');
  const [pregnant, setPregnant] = useState(false);
  const [feeding, setFeeding] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 사용자 프로필 불러오기
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const res = await api.get(`/api/users/getUserInfo/${userId}`);
        if (res.data.success) {
          const info = res.data.userInfo;
          setName(info.userName);
          setEmail(userId);
          setPhonenumber(info.phoneNumber);
          setBirth(info.birthday);
          setGender(info.gender);
          setPregnant(!!info.pregnantFlag);
          setFeeding(!!info.feedingFlag);
          setSelectedDate(new Date(info.birthday));
        } else {
          Alert.alert('오류', '프로필을 불러오지 못했습니다.');
        }
      } catch (err: any) {
        console.error('get info error:', err);

        const status = err?.response?.status;
        const message = err?.response?.data?.message;

        if (status === 500) Alert.alert('서버 오류', message);
        else Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }
    })();
  }, [userId]);

  const onChangeBirth = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) {
      setSelectedDate(date);
      setBirth(date.toISOString().split('T')[0]);
    }
  };

  const handleSave = async () => {

    if (!userId) return;
    if (!name.trim() || !phonenumber.trim() || !birth || !gender) {
      Alert.alert('오류', '모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      const payload = {
        userName: name.trim(),
        phoneNumber: phonenumber.trim(),
        birthday: birth,
        gender: gender,
        pregnantFlag: pregnant,
        feedingFlag: feeding,
      };

      const res = await api.put(`/api/users/updateUserInfo/${userId}`, payload);
      if (res.data.success) {
        Alert.alert('저장 완료', '프로필이 업데이트되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      console.error('update info error:', err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 400) Alert.alert('저장 실패', message);
      else if (status === 500) Alert.alert('서버 오류', message);
      else Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert('사진 변경', '프로필 사진 변경 기능은 이후에 연결할 예정입니다.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
          <Text style={{ ...FONTS.h3, color: COLORS.primary }}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* 아바타 */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={56} color={COLORS.white} />
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={handleChangeAvatar}>
            <Icon name="camera-outline" size={18} color={COLORS.white} />
            <Text style={styles.avatarBtnText}>사진 변경</Text>
          </TouchableOpacity>
        </View>

        {/* 기본 정보 */}
        <Text style={styles.sectionTitle}>기본 정보</Text>
        <TextInput
          style={styles.input}
          placeholder="이름"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
        />

        <View style={[styles.input, styles.readonlyRow]}>
          <Text style={[styles.inputText, { color: COLORS.gray }]} numberOfLines={1}>
            {email || '이메일'}
          </Text>
          <Text style={{ ...FONTS.p, color: COLORS.gray }}>(변경 불가)</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="휴대폰 번호"
          placeholderTextColor="#777"
          value={phonenumber}
          onChangeText={setPhonenumber}
          keyboardType="phone-pad"
        />

        {/* 생년월일 */}
        <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
          <Text style={[styles.inputText, { color: birth ? COLORS.black : COLORS.gray }]}>
            {birth || '생년월일 선택'}
          </Text>
          <Icon name="calendar-month-outline" size={20} color={COLORS.gray} />
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeBirth}
            maximumDate={new Date()}
          />
        )}

        {/* 성별 / 국적 */}
        <View style={styles.pickerRow}>
          <View style={[styles.pickerContainer, { marginRight: SIZES.base }]}>
            <Picker
              selectedValue={gender}
              onValueChange={(v) => setGender(v)}
              dropdownIconColor={COLORS.black}
              style={styles.picker}
            >
              <Picker.Item label="남자" value="남자" color={COLORS.black} />
              <Picker.Item label="여자" value="여자" color={COLORS.black} />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={nationality}
              onValueChange={(v) => setNationality(v)}
              dropdownIconColor={COLORS.black}
              style={styles.picker}
            >
              <Picker.Item label="내국인" value="내국인" color={COLORS.black} />
              <Picker.Item label="외국인" value="외국인" color={COLORS.black} />
            </Picker>
          </View>
        </View>

        {/* 여성 건강 정보 */}
        {gender === '여자' && (
          <View style={styles.optionSection}>
            <Text style={styles.sectionTitle}>여성 건강 정보 (선택)</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>임신 여부</Text>
              <Switch
                value={pregnant}
                onValueChange={setPregnant}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>수유 여부</Text>
              <Switch
                value={feeding}
                onValueChange={setFeeding}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        )}

        {/* 저장 버튼 */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding / 2,
    paddingTop: SIZES.base,
    paddingBottom: SIZES.base,
  },
  headerBtn: { padding: SIZES.padding / 2, minWidth: 40, alignItems: 'center' },
  headerTitle: { ...FONTS.h2, color: COLORS.black },
  container: { paddingHorizontal: SIZES.padding, paddingBottom: 60 },

  avatarRow: { alignItems: 'center', marginTop: SIZES.padding, marginBottom: SIZES.padding },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: SIZES.base * 1.5,
  },
  avatarBtnText: { marginLeft: 6, ...FONTS.p, color: COLORS.white },

  sectionTitle: { ...FONTS.h3, color: COLORS.black, marginBottom: SIZES.base },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.75,
    marginBottom: SIZES.base * 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: { ...FONTS.p, color: COLORS.black },
  readonlyRow: { opacity: 0.8 },

  pickerRow: { flexDirection: 'row', marginBottom: SIZES.base * 2 },
  pickerContainer: { flex: 1, backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius },
  picker: { color: COLORS.black },

  optionSection: { marginBottom: SIZES.padding },
  switchRow: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  switchLabel: { ...FONTS.p, color: COLORS.black },

  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 0.9,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.base,
    marginBottom: SIZES.padding,
    elevation: 4,
  },
  saveBtnText: { ...FONTS.h3, color: COLORS.white },
});
