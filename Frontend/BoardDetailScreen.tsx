import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useBoardStore } from "./store/boardStore";
import { COLORS, FONTS, SIZES } from "./styles/theme";

export default function BoardDetailScreen({ route, navigation }: any) {
  const { id, isDoctor } = route.params; 
  const { posts, deletePost, deleteAnswer } = useBoardStore();

  // 로그인 유저 정보 (DB 연동 시 교체 예정)
  const userId = "user1";
  const userName = "홍길동"; // 나중에 로그인 정보로 교체

  const post = posts.find((p) => p.id === id);

  if (!post)
    return (
      <Text style={styles.empty}>
        게시글을 찾을 수 없습니다. (DB 연동 시 실제 fetch 필요)
      </Text>
    );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d
      .getHours()
      .toString()
      .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  // 게시글 삭제
  const handleDelete = () => {
    Alert.alert("삭제 확인", "이 글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onPress: async () => {
          await deletePost(id);
          Alert.alert("삭제 완료", "게시글이 삭제되었습니다.");
          navigation.goBack();
        },
        style: "destructive",
      },
    ]);
  };

  // 답변 삭제
  const handleDeleteAnswer = (answerId: string) => {
    Alert.alert("답변 삭제", "이 답변을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onPress: async () => {
          await deleteAnswer(id, answerId);
          Alert.alert("삭제 완료", "답변이 삭제되었습니다.");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* 게시글 본문 */}
        <View style={styles.postCard}>
          <Text style={styles.category}>{post.category}</Text>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.content}>{post.content}</Text>

          <Text style={styles.date}>
            작성: {formatDate(post.createdAt)}
            {post.updatedAt && post.updatedAt !== post.createdAt
              ? ` (수정됨: ${formatDate(post.updatedAt)})`
              : ""}
          </Text>

          {/* 사용자 본인 글만 수정/삭제 가능 (의료인은 불가) */}
          {!isDoctor && post.authorId === userId && (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate("BoardEditScreen", { id })}
              >
                <Text style={styles.btnText}>수정</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.delBtn} onPress={handleDelete}>
                <Text style={styles.btnText}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 답변 목록 */}
        <Text style={styles.answerHeader}>답변</Text>

        {post.answers.length === 0 ? (
          <Text style={styles.noAnswer}>아직 답변이 없습니다.</Text>
        ) : (
          post.answers.map((a) => (
            <View key={a.id} style={styles.answerCard}>
              <Text style={styles.answerContent}>{a.content}</Text>
              <Text style={styles.answerInfo}>
                {a.authorType} {a.authorName} ({a.hospital})
              </Text>
              <Text style={styles.answerDate}>
                작성: {formatDate(a.createdAt)}
                {a.updatedAt && a.updatedAt !== a.createdAt
                  ? ` (수정됨: ${formatDate(a.updatedAt)})`
                  : ""}
              </Text>

              {/* 의료인 본인 답변 수정/삭제 가능 */}
              {isDoctor && a.authorName === userName && (
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      navigation.navigate("AnswerEditScreen", {
                        postId: id,
                        answerId: a.id,
                        content: a.content,
                      })
                    }
                  >
                    <Text style={styles.btnText}>수정</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.delBtn}
                    onPress={() => handleDeleteAnswer(a.id)}
                  >
                    <Text style={styles.btnText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}

        {/* 의료인 답변 작성 버튼 */}
        {isDoctor && (
          <TouchableOpacity
            style={styles.answerWriteBtn}
            onPress={() =>
              navigation.navigate("AnswerWriteScreen", { postId: id })
            }
          >
            <Icon name="comment-plus" size={22} color={COLORS.white} />
            <Text style={styles.answerWriteText}>답변 작성</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: SIZES.padding },
  postCard: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  category: { ...FONTS.h4, color: COLORS.primary },
  title: { ...FONTS.h2, color: COLORS.darkGray, marginVertical: 6 },
  content: { ...FONTS.p, color: COLORS.darkGray, marginBottom: 10 },
  date: { ...FONTS.p, color: COLORS.gray, textAlign: "right" },
  btnRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  editBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  delBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnText: { ...FONTS.h4, color: COLORS.white },
  answerHeader: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginBottom: 8,
  },
  answerCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 10,
  },
  answerContent: { ...FONTS.p, color: COLORS.darkGray, marginBottom: 6 },
  answerInfo: { ...FONTS.h4, color: COLORS.primary },
  answerDate: { ...FONTS.p, color: COLORS.gray, textAlign: "right" },
  noAnswer: {
    textAlign: "center",
    color: COLORS.gray,
    marginVertical: 20,
    ...FONTS.p,
  },
  answerWriteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    marginTop: 20,
  },
  answerWriteText: {
    color: COLORS.white,
    marginLeft: 6,
    ...FONTS.h3,
  },
  empty: {
    textAlign: "center",
    marginTop: 100,
    ...FONTS.h3,
    color: COLORS.gray,
  },
});
