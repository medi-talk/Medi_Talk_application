import React, { useCallback, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useAppStore } from "./store/appStore";  
import api from "./utils/api";


type PostData = {
  consultationPostId: string;
  categoryName: string;
  title: string;
  content: string;
  postDate: string;
  updateDate: string;
};

type ReplyData = {
  consultationReplyId: string;
  userId: string;
  content: string;
  replyDate: string;
  updateDate: string;
  classification: string;
  medicalInstitution: string;
  userName: string;
};

function getClassificationLabel(c : string) {
  switch (c) {
    case "doctor":
      return "의사";
    case "pharmacist":
      return "약사";
    default:
      return c || "";
  }
};

export default function BoardDetailScreen({ route, navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;
  const userRole = state.user?.role;
  const { consultationPostId } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<PostData | null>(null);
  const [replies, setReplies] = useState<ReplyData[]>([]);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
  };

  const loadDetail = useCallback(async () => {
    if (!consultationPostId) return;
    try {
      setLoading(true);

      const res = await api.get(`/api/board/getBoardPostWithReplies/${consultationPostId}`);

      if (!res.data.success) {
        Alert.alert("오류", res.data?.message || "게시글을 불러오는 데 실패했습니다.");
        return;
      }

      const pr = res.data.postWithReplies;
      if (!pr) {
        setPost(null);
        setReplies([]);
        return;
      }

      setPost(pr as PostData);
      setReplies(pr.replies as ReplyData[]);

    } catch (err: any) {
      console.error("❌ load post detail error:", err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [consultationPostId]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail])
  );

  if (!post)
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.empty}>
          {loading ? "로딩 중..." : "존재하지 않는 게시글입니다."}
        </Text>
      </SafeAreaView>
    );

  const isDoctor = userRole === "hp";

  // 게시글 삭제
  const handleDelete = () => {
    Alert.alert("삭제 확인", "이 글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await api.delete(`/api/board/deleteBoardPost/${consultationPostId}`);

            if (res.data.success) {
              Alert.alert("삭제 완료", "게시글이 삭제되었습니다.");
              navigation.goBack();
            } else {
              Alert.alert("삭제 실패", res.data.message);
            }

          } catch (err: any) {
            console.error("delete post error:", err);

            const status = err?.response?.status;
            const message = err?.response?.data?.message;

            if (status == 500) {
              Alert.alert('서버 오류', message);
            } else {
              Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
            }
          }
        },
      },
    ]);
  };

  // 답변 삭제
  const handleDeleteAnswer = (consultationReplyId: string) => {
    Alert.alert("답변 삭제", "이 답변을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await api.delete(`/api/board/deleteBoardPostReply/${consultationReplyId}`);
            if (res.data.success) {
              Alert.alert("삭제 완료", "답변이 삭제되었습니다.");
              loadDetail();
            } else {
              Alert.alert("삭제 실패", res.data.message);
            }

          } catch (err: any) {
            console.error("delete answer error:", err);

            const status = err?.response?.status;
            const message = err?.response?.data?.message;

            if (status == 500) {
              Alert.alert('서버 오류', message);
            } else {
              Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
            }
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* 게시글 본문 */}
        <View style={styles.postCard}>
          <Text style={styles.category}>{post.categoryName}</Text>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.content}>{post.content}</Text>

          <Text style={styles.date}>작성: {formatDate(post.postDate)}</Text>
          {post.updateDate && post.updateDate !== post.postDate && (
            <Text style={styles.date}>
              (수정됨: {formatDate(post.updateDate)})
            </Text>
          )}

          {/* 사용자 본인 글만 수정/삭제 가능 (의료인은 불가) */}
          {!isDoctor && (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate("BoardEditScreen", { 
                  consultationPostId: post.consultationPostId,
                 })}
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

        {replies.length === 0 ? (
          <Text style={styles.noAnswer}>아직 답변이 없습니다.</Text>
        ) : (
          replies.map((r) => (
            <View key={r.consultationReplyId} style={styles.answerCard}>
              <Text style={styles.answerContent}>{r.content}</Text>
              <Text style={styles.answerInfo}>
                {getClassificationLabel(r.classification)} {r.userName} ({r.medicalInstitution})
              </Text>
              <Text style={styles.answerDate}>작성: {formatDate(r.replyDate)}</Text>
              {r.updateDate && r.updateDate !== r.replyDate && (
                <Text style={styles.answerDate}>
                  (수정됨: {formatDate(r.updateDate)})
                </Text>
              )}
              

              {/* 의료인 본인 답변 수정/삭제 가능 */}
              {isDoctor && r.userId === userId && (
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      navigation.navigate("AnswerEditScreen", {
                        consultationReplyId: r.consultationReplyId
                      })
                    }
                  >
                    <Text style={styles.btnText}>수정</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.delBtn}
                    onPress={() => handleDeleteAnswer(r.consultationReplyId)}
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
              navigation.navigate("AnswerWriteScreen", { consultationPostId: consultationPostId })
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
