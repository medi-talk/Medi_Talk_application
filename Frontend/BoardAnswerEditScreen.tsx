// BoardAnswerEditScreen.tsx
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

export default function BoardAnswerEditScreen({ route, navigation }: any) {
  const { updateAnswer } = useBoardStore();

  const postId = route.params?.postId;
  const answerId = route.params?.answerId;
  const prevContent = route.params?.content ?? "";

  const [content, setContent] = useState(prevContent);

  const handleUpdate = async () => {
    if (!content.trim()) {
      Alert.alert("알림", "수정할 내용을 입력하세요.");
      return;
    }

    // DB 연동 시 axios.put(`/api/posts/${postId}/answers/${answerId}`, {...}) 로 교체
    await updateAnswer(postId, answerId, {
      content: content.trim(),
    });

    Alert.alert("완료", "답변이 수정되었습니다.", [
      { text: "확인", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>답변 수정</Text>

      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="답변 내용을 입력하세요."
        placeholderTextColor={COLORS.gray}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
        <Text style={styles.saveText}>저장</Text>
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
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});