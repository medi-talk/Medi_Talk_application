// BoardWriteScreen.tsx
import React, { useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useBoardStore } from "./store/boardStore";

export default function BoardWriteScreen({ navigation }: any) {
  const { addPost } = useBoardStore();

  // 입력 상태
  const [category, setCategory] = useState("일반");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 임시 사용자 정보 (DB 연동 시 로그인 유저 정보로 교체)
  const authorId = "user1";
  const authorName = "김철수";

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category.trim()) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
      return;
    }

    try {
      // DB 연동 시 axios.post("/api/posts", {...}) 로 교체
      await addPost({
        category,
        title,
        content,
        authorId,
        authorName,
      });

      Alert.alert("작성 완료", "게시글이 등록되었습니다.");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "게시글 작성 중 문제가 발생했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>게시글 작성</Text>

        {/* 카테고리 입력 (DB 연동 시 카테고리 목록 불러오기) */}
        <Text style={styles.label}>카테고리</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          placeholder="예: 복용 방법, 부작용 등"
          placeholderTextColor={COLORS.gray}
        />

        {/* 제목 입력 */}
        <Text style={styles.label}>제목</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="제목을 입력하세요"
          placeholderTextColor={COLORS.gray}
        />

        {/* 내용 입력 */}
        <Text style={styles.label}>내용</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          style={[styles.input, styles.textarea]}
          placeholder="내용을 입력하세요"
          placeholderTextColor={COLORS.gray}
          multiline
        />

        {/* 작성 버튼 */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>작성 완료</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    padding: SIZES.padding,
  },
  header: {
    ...FONTS.h2,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    ...FONTS.h4,
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: SIZES.radius,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    ...FONTS.p,
    color: COLORS.darkGray,
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    marginTop: 10,
  },
  submitText: {
    ...FONTS.h3,
    color: COLORS.white,
    textAlign: "center",
  },
});
