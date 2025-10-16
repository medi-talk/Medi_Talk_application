// AnswerEditScreen.tsx
import React, { useState, useEffect } from "react";
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
import api from "./utils/api";


export default function AnswerEditScreen({ route, navigation }: any) {
  const consultationReplyId = route.params?.consultationReplyId;

  // 입력 상태
  const [content, setContent] = useState("");

  // 기존 답변 정보 API 호출
  useEffect(() => {
    if (!consultationReplyId) return;
    (async () => {
      try {
        const res = await api.get(`/api/board/getBoardPostReplyForEdit/${consultationReplyId}`);

        if (!res.data.success) {
          Alert.alert("오류", res.data?.message || "답변 정보를 불러오는 데 실패했습니다.");
          return;
        }

        const reply = res.data.reply;
        setContent(reply.content);

      } catch (err: any) {
        console.error("❌ load answer error:", err);

        const status = err?.response?.status;
        const message = err?.response?.data?.message;

        if (status == 500) {
          Alert.alert('서버 오류', message);
        } else {
          Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
        }
      }
    })();
  }, []);

  const handleUpdate = async () => {
    if (!content.trim()) {
      Alert.alert("오류", "답변 내용을 입력해주세요.");
      return;
    }

    try {
      const res = await api.put(`/api/board/updateBoardPostReply/${consultationReplyId}`, { content: content.trim() });

      if (!res.data.success) {
        Alert.alert("오류", res.data?.message || "답변 수정에 실패했습니다.");
        return;
      }

      Alert.alert("수정 완료", "답변이 수정되었습니다.");
      navigation.goBack();

    } catch (err: any) {
      console.error("❌ update answer error:", err);

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
