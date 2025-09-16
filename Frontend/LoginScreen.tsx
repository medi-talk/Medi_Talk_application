import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Alert,
} from 'react-native';

import { COLORS, SIZES, FONTS } from './styles/theme'; 
import { useAppStore } from './store/appStore'; // 전역 user 상태 불러오기

export default function LoginScreen({ navigation }: any) {
  const { setUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('로그인 실패', '아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      // === 로그인 API(DB) 붙일 부분 ===
      // 예시: axios 또는 fetch 사용
      // const res = await axios.post('http://서버주소/api/login', {
      //   email,
      //   password,
      // });

      // 서버 응답(DB)에서 id, name 가져오기 
      // setUser({ id: res.data.id, name: res.data.name });

      // 임시 데이터 저장용(테스트용)
      setUser({ id: 'dummyId123', name: '홍길동' }); // 데베 연동시 삭제할 코드 

      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Medi_Talk</Text>
          <Text style={styles.subtitle}>로그인하고 맞춤형 복약 관리를 시작하세요.</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="아이디 (이메일)"
          placeholderTextColor={COLORS.gray}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor={COLORS.gray}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupPrompt}>아직 회원이 아니신가요?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}> 회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    padding: SIZES.padding,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.p,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: SIZES.base * 2,
    ...FONTS.p,
    color: COLORS.darkGray,
    borderWidth: 0,
  },
  loginButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.base,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.padding * 2,
  },
  signupPrompt: {
    ...FONTS.p,
    color: COLORS.gray,
  },
  signupText: {
    ...FONTS.p,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
