import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useAppStore } from "./store/appStore";
import api from "./utils/api";


type BoardData = {
  consultationPostId: string;
  categoryName: string;
  title: string;
  postDate: string;
};

export default function BoardListScreen({ navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;
  const userRole = state.user?.role; // 'user' or 'hp'

  const [loading, setLoading] = useState(false);
  const [boards, setBoards] = useState<BoardData[]>([]);

  const loadBoards = useCallback(async () => {
    try {
      if (!userId || !userRole) return;
      setLoading(true);

      const url =
        userRole === "hp"
          ? "/api/board/listAllBoards"
          : `/api/board/listUserBoards/${userId}`;
      
      const res = await api.get(url);

      if (!res.data.success) {
        Alert.alert("오류", res.data?.message || "게시글 목록을 불러오는 데 실패했습니다.");
        return;
      }

      const list: BoardData[] = (res.data.boards || []).map((b: any) => ({
        consultationPostId: b.consultationPostId,
        categoryName: b.categoryName,
        title: b.title,
        postDate: b.postDate,
      }));

      setBoards(list);
    } catch (err: any) {
      console.error("❌ load boards error:", err);

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
  }, [userId, userRole]);

  useFocusEffect(
    useCallback(() => {
      loadBoards();
    }, [loadBoards])
  );

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${mm}/${dd} ${hh}:${min}`;
  };

  const renderItem = ({ item }: { item: BoardData }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => 
        navigation.navigate("BoardDetailScreen", {
          consultationPostId: item.consultationPostId
        })
      }
    >
      <Text style={styles.category}>{item.categoryName}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{formatDate(item.postDate)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>게시판</Text>
        <Text style={styles.roleTextBadge}>
          {userRole === "hp" ? "의료인" : "사용자"}
        </Text>
      </View>

      <FlatList
        data={boards}
        keyExtractor={(item) => item.consultationPostId}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "불러오는 중..." : "등록된 게시글이 없습니다."}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* 일반 사용자만 작성 가능 */}
      {userRole === "user" && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("BoardWriteScreen")}
        >
          <Icon name="plus" size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    padding: SIZES.padding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { ...FONTS.h2, color: COLORS.primary },
  roleToggle: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
  },
  roleText: { ...FONTS.p, color: COLORS.darkGray },
  card: {
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SIZES.padding,
    marginVertical: 6,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  category: { ...FONTS.h4, color: COLORS.primary },
  title: { ...FONTS.h3, color: COLORS.darkGray, marginVertical: 4 },
  date: { ...FONTS.p, color: COLORS.gray, textAlign: "right" },
  addButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: COLORS.primary,
    width: 55,
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    color: COLORS.gray,
    ...FONTS.h3,
  },
  roleTextBadge: {
    ...FONTS.h4,
    color: COLORS.darkGray,
    backgroundColor: COLORS.lightGray,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
});
