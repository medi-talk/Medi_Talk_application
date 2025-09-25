import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAppStore } from "./store/appStore";
import { COLORS, SIZES, FONTS } from "./styles/theme";

export default function DisposalGuideScreen({ route }: any) {
  const { id } = route.params;
  const { state } = useAppStore();

  const item = state.disposals.find((d) => d.id === id);

  // ⚠️ 현재는 더미 데이터 (DB 연동 전)
  // ⚠️ DB 연동 후 삭제
  const disposalMethods: Record<string, string> = {
    알약: "포장재 제거 후 내용물만 한 곳에 모아 밀봉하여 처리",
    시럽: "뚜껑을 닫고 종량제 봉투에 밀봉하여 배출",
    주사제: "뚜껑을 닫은 후 전용 수거함에 배출",
  }; // ⚠️ DB 연동 후 삭제

  const method =
    disposalMethods[item?.name || ""] || "이 약품에 대한 폐기 방법 정보가 없습니다."; 
  // ⚠️ DB 연동 후 삭제 → DB에서 가져온 item.method 같은 값으로 대체

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>약품 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 약 이름 */}
      <Text style={styles.title}>{item.name}</Text>

      {/* 폐기 방법 */}
      <View style={styles.section}>
        <Text style={styles.label}>폐기 방법</Text>
        <Text style={styles.value}>
          {method /* ⚠️ DB 연동 후 삭제 → {item.method} 로 교체 */}
        </Text>
      </View>

      {/* 폐기 장소 (고정) */}
      <View style={styles.section}>
        <Text style={styles.label}>폐기 장소</Text>
        <Text style={styles.value}>
          거주하는 지역의 약국이나 보건소, 행정복지센터에 비치된 폐의약품 수거함에 폐기
        </Text>
      </View>

      {/* 주의사항 (고정) */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeTitle}>주의</Text>
        <Text style={styles.noticeText}>
          다만 지역별로 분리배출 방법이 다를 수 있으니{"\n"}
          약국이나 보건소, 행정복지센터에 유선으로 확인하신 후 처리하시기 바랍니다!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    ...FONTS.h3,
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  value: {
    ...FONTS.p,
    color: COLORS.gray,
    lineHeight: 20,
  },
  noticeBox: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: SIZES.radius,
    marginTop: 10,
  },
  noticeTitle: {
    ...FONTS.h4,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  noticeText: {
    ...FONTS.p,
    color: COLORS.gray,
    lineHeight: 18,
  },
  error: {
    ...FONTS.h3,
    color: COLORS.danger,
    textAlign: "center",
    marginTop: 40,
  },
});
