// AnswerEditScreen.tsx
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

export default function AnswerEditScreen({ route, navigation }: any) {
  const { postId, answerId } = route.params;
  const { posts, updateAnswer } = useBoardStore();

  // 기존 답변 데이터 찾기
  const post = posts.find((p) => p.id === postId);
  const target = post?.answers.find((a) => a.id === answerId);

  const [content, setContent] = useState(target?.content || "");

  const handleUpdate = async () => {
    if (!content.trim()) {
      Alert.alert("오류", "답변 내용을 입력해주세요.");
      return;
    }

    // DB 연동 시 axios.put(`/api/posts/${postId}/answers/${answerId}`, { content }) 로 교체
    await updateAnswer(postId, answerId, { content });

    Alert.alert("수정 완료", "답변이 수정되었습니다.");
    navigation.goBack();
  };

  if (!target) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.emptyText}>답변을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>답변 수정</Text>

        {/* 답변 수정 입력창 */}
        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          multiline
          placeholder="답변 내용을 수정하세요."
          placeholderTextColor={COLORS.gray}
          textAlignVertical="top"
        />

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
          <Text style={styles.submitText}>저장</Text>
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
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    color: COLORS.gray,
    ...FONTS.h3,
  },
});
