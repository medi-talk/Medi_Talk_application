// BoardAnswerWriteScreen.tsx
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useBoardStore } from "./store/boardStore";

export default function BoardAnswerWriteScreen({ route, navigation }: any) {
  const { addAnswer } = useBoardStore();

  const postId = route.params?.postId;
  const [content, setContent] = useState("");

  // 로그인 정보 (나중에 실제 로그인 데이터로 교체)
  const doctorName = "홍길동";
  const doctorType = "의사"; // 또는 "약사"
  const hospital = "서울병원";

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("알림", "답변 내용을 입력하세요.");
      return;
    }

    // DB 연동 시 axios.post(`/api/posts/${postId}/answers`, {...}) 로 교체
    await addAnswer(postId, {
      postId,
      authorName: doctorName,
      authorType: doctorType as "의사" | "약사",
      hospital,
      content: content.trim(),
    });

    Alert.alert("완료", "답변이 등록되었습니다.", [
      { text: "확인", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>답변 작성</Text>

      <TextInput
        style={styles.input}
        placeholder="답변 내용을 입력하세요."
        placeholderTextColor={COLORS.gray}
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>등록</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: 16,
  },
  input: {
    height: 200,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 12,
    ...FONTS.p,
    color: COLORS.darkGray,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});