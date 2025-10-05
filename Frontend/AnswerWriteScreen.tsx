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
import { useBoardStore } from "./store/boardStore";
import { COLORS, FONTS, SIZES } from "./styles/theme";

export default function AnswerWriteScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const { addAnswer } = useBoardStore();

  // 로그인한 의료인 정보 (DB 연동 시 교체)
  const [authorName] = useState("홍길동");
  const [authorType] = useState<"의사" | "약사">("의사");
  const [hospital] = useState("메디톡병원");

  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("오류", "답변 내용을 입력해주세요.");
      return;
    }

    // DB 연동 시 axios.post(`/api/posts/${postId}/answers`, {...}) 로 교체
    await addAnswer(postId, {
      postId,
      authorName,
      authorType,
      hospital,
      content,
    });

    Alert.alert("등록 완료", "답변이 등록되었습니다.");
    navigation.goBack();
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
