// BoardDetailScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useBoardStore } from "./store/boardStore";

export default function BoardDetailScreen({ route, navigation }: any) {
  const { posts, deletePost, deleteAnswer } = useBoardStore();
  const { id } = route.params; 
  const post = posts.find((p) => p.id === id);

  // 로그인 사용자/의료인 여부 (나중에 로그인 정보로 교체)
  const isDoctor = false; 
  const userId = "user1";

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.emptyText}>게시글을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  const handleDeletePost = async () => {
    Alert.alert("삭제", "정말 이 글을 삭제하시겠습니까?", [
      { text: "취소" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          // DB 연동 시 axios.delete(`/api/posts/${id}`)로 교체
          await deletePost(id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleDeleteAnswer = async (answerId: string) => {
    Alert.alert("삭제", "이 답변을 삭제하시겠습니까?", [
      { text: "취소" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          // DB 연동 시 axios.delete(`/api/posts/${id}/answers/${answerId}`)로 교체
          await deleteAnswer(id, answerId);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.category}>{post.category}</Text>
        <Text style={styles.meta}>
          작성자: {post.authorName} | 작성일: {new Date(post.createdAt).toLocaleString()}
          {post.updatedAt &&
            ` (수정됨: ${new Date(post.updatedAt).toLocaleString()})`}
        </Text>

        <Text style={styles.content}>{post.content}</Text>

        {/* 사용자가 작성한 글이면 수정/삭제 버튼 */}
        {post.authorId === userId && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate("BoardEditScreen", { id })}
            >
              <Text style={styles.btnText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeletePost}
            >
              <Text style={styles.btnText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 의료인일 경우 답변 작성 버튼 */}
        {isDoctor && (
          <TouchableOpacity
            style={styles.answerWriteBtn}
            onPress={() =>
              navigation.navigate("BoardAnswerWriteScreen", { postId: id })
            }
          >
            <Text style={styles.btnText}>답변 작성</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.answerHeader}>답변</Text>
        {post.answers.length === 0 ? (
          <Text style={styles.emptyText}>아직 답변이 없습니다.</Text>
        ) : (
          post.answers.map((a) => (
            <View key={a.id} style={styles.answerCard}>
              <Text style={styles.answerContent}>{a.content}</Text>
              <Text style={styles.answerMeta}>
                {a.authorName} ({a.authorType}, {a.hospital}) |{" "}
                {new Date(a.createdAt).toLocaleString()}
                {a.updatedAt &&
                  ` (수정됨: ${new Date(a.updatedAt).toLocaleString()})`}
              </Text>

              {/* 의료인이 자기 답변 작성한 경우 수정/삭제 버튼 */}
              {isDoctor && a.authorName === "의료인로그인명" && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      navigation.navigate("BoardAnswerEditScreen", {
                        postId: id,
                        answerId: a.id,
                      })
                    }
                  >
                    <Text style={styles.btnText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteAnswer(a.id)}
                  >
                    <Text style={styles.btnText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  category: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: 8,
  },
  meta: {
    ...FONTS.p,
    color: COLORS.gray,
    marginBottom: 12,
  },
  content: {
    ...FONTS.p,
    color: COLORS.darkGray,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  editBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    padding: 10,
    borderRadius: 6,
  },
  btnText: {
    ...FONTS.h4,
    color: COLORS.white,
  },
  answerWriteBtn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    alignItems: "center",
  },
  answerHeader: {
    ...FONTS.h3,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  answerCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 12,
  },
  answerContent: {
    ...FONTS.p,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  answerMeta: {
    ...FONTS.p,
    color: COLORS.gray,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: COLORS.gray,
    ...FONTS.h4,
  },
});
