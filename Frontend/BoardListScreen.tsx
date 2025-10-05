import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useBoardStore } from "./store/boardStore";

export default function BoardListScreen({ navigation }: any) {
  const { posts, fetchPosts } = useBoardStore();
  const [isDoctor, setIsDoctor] = useState(false); // 로그인 시 교체 예정
  const [userId] = useState("user1"); // 로그인한 사용자 ID

  useEffect(() => {
    fetchPosts(); // DB 연동 시 게시글 목록 불러오기
  }, [fetchPosts]);

  const visiblePosts = isDoctor
    ? posts
    : posts.filter((p) => p.authorId === userId);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d
      .getHours()
      .toString()
      .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("BoardDetailScreen", { id: item.id, isDoctor })}
    >
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>게시판</Text>
        <TouchableOpacity
          onPress={() => setIsDoctor(!isDoctor)}
          style={styles.roleToggle}
        >
          <Text style={styles.roleText}>
            {isDoctor ? "사용자 보기" : "의료인 보기"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>게시글이 없습니다.</Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* 일반 사용자만 작성 가능 */}
      {!isDoctor && (
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
});
