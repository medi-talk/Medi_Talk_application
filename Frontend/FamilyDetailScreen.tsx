// FamilyDetailScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";

export default function FamilyDetailScreen({ route, navigation }: any) {
  const { family } = route.params || {
    family: { id: 1, name: "김아버지", relation: "부", note: "혈압약 복용 중" },
  };

  const handleDelete = () => {
    Alert.alert(
      "가족 삭제",
      `${family.name}님을 가족 목록에서 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            navigation.navigate("FamilyList", { removedId: family.id });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가족 상세</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 내용 */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.name}>{family.name}</Text>
          <Text style={styles.label}>관계</Text>
          <Text style={styles.value}>{family.relation}</Text>

          <Text style={styles.label}>복약 메모</Text>
          <Text style={styles.value}>
            {family.note || "등록된 메모가 없습니다."}
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttons}>
          {/* 복용약 확인 버튼 */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#4CAF50" }]}
            onPress={() =>
              navigation.navigate("FamilyMedicationList", {
                familyId: family.id,
                familyName: family.name,
              })
            }
          >
            <Text style={styles.actionText}>복용약 확인</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => navigation.navigate("FamilyEdit", { family })}
            >
              <Text style={styles.actionText}>수정하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: COLORS.danger }]}
              onPress={handleDelete}
            >
              <Text style={styles.actionText}>삭제하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: { ...FONTS.h2, color: COLORS.darkGray },
  scrollContent: { padding: SIZES.padding, paddingBottom: SIZES.padding * 2 },
  content: { marginBottom: 24 },
  name: { ...FONTS.h1, color: COLORS.darkGray, marginBottom: 20 },
  label: { ...FONTS.h3, color: COLORS.gray, marginTop: 10 },
  value: { ...FONTS.p, color: COLORS.darkGray, marginTop: 4 },
  buttons: { marginTop: 20 },
  actionBtn: {
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.base,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.base,
  },
  smallBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  actionText: { ...FONTS.h3, color: COLORS.white },
});