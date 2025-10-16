// AnswerWriteScreen.tsx
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useAppStore } from "./store/appStore";
import api from "./utils/api";

export default function AnswerWriteScreen({ route, navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;

  const { consultationPostId } = route.params;
  
  const [content, setContent] = useState("");


  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("오류", "답변 내용을 입력해주세요.");
      return;
    }

    const replyPayload = {
      userId,
      content: content.trim(),
    }

    try {
      const res = await api.post(`/api/board/createBoardPostReply/${consultationPostId}`, { replyPayload });

      if (!res.data.success) {
        Alert.alert("오류", res.data?.message || "답변 등록에 실패했습니다.");
        return;
      }

      Alert.alert("등록 완료", "답변이 등록되었습니다.");
      navigation.goBack();

    } catch (err: any) {
      console.error("❌ submit answer error:", err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>답변 작성</Text>

        {/* 답변 입력창 */}
        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          multiline
          placeholder="답변 내용을 입력하세요."
          placeholderTextColor={COLORS.gray}
          textAlignVertical="top"
        />

        {/* 등록 버튼 */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>등록</Text>
        </TouchableOpacity>

        {/* 취소 버튼 */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: SIZES.padding },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: SIZES.radius,
    padding: 12,
    minHeight: 180,
    fontSize: 16,
    color: COLORS.black,          
    backgroundColor: COLORS.white, 
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 24,
  },
  submitText: { color: COLORS.white, ...FONTS.h3 },
  cancelBtn: {
    backgroundColor: COLORS.gray,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  cancelText: { color: COLORS.white, ...FONTS.h3 },
});
