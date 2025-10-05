// IntakeListScreen.tsx
import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useAppStore } from "./store/appStore";
// import axios from "axios"; // DB 연동 시 주석 해제

export default function IntakeListScreen({ navigation }: any) {
  const { state } = useAppStore();
  const supplements = state.intakes;

  // DB 연동 시: 초기 렌더링 시 서버에서 영양소 리스트 불러오기
  useEffect(() => {
    // axios.get("https://your-server.com/api/supplements")
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("IntakeCalc");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("IntakeDetailScreen", { id: item.id })}
    >
      <View style={styles.row}>
        <Icon
          name="pill"
          size={28}
          color={COLORS.primary}
          style={{ marginRight: 10 }}
        />
        <Text style={styles.title}>{item.name}</Text>
        <Icon
          name="chevron-right"
          size={26}
          color={COLORS.darkGray}
          style={{ marginLeft: "auto" }}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* 상단 커스텀 뒤로가기 버튼 제거됨 */}
        <Text style={styles.header}>영양소 목록</Text>

        {supplements.length === 0 ? (
          <Text style={styles.emptyText}>등록된 영양소가 없습니다.</Text>
        ) : (
          <FlatList
            data={supplements}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}

        {/* 리스트 추가 버튼 → IntakeAddScreen으로 이동 */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("IntakeAddScreen")}
        >
          <Icon name="plus" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    ...FONTS.h2,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    ...FONTS.h3,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 50,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    ...FONTS.h3,
    color: COLORS.darkGray,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});
