import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { COLORS, SIZES, FONTS } from "./styles/theme";
import api from "./utils/api";


type DiscardInfoData = {
  medicationType: string;
  discardMethod: string;
};

export default function DisposalGuideScreen({ route }: any) {
  const { medicationDiscardId, medicationName } = route.params || {};
  // const { state } = useAppStore();

  const [info, setInfo] = useState<DiscardInfoData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInfo = useCallback(async () => {
    try {
      const res = await api.get(`/api/discardInfo/getMedicationDiscardInfo/${medicationDiscardId}`);
      const data: DiscardInfoData | null = res?.data?.info ?? null;
      setInfo(data);
    } catch (err : any) {
      console.error("❌ load discard medications error:", err);
      setInfo(null);

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
  }, [medicationDiscardId]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <Text style={[styles.value, { marginTop: 8 }]}>
          폐기 정보 불러오는 중...
        </Text>
      </View>
    );
  }

  if (!medicationDiscardId) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>유효하지 않은 접근입니다.</Text>
      </View>
    );
  }

  if (!info) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>폐기 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 약 이름 */}
      <Text style={styles.title}>{medicationName ?? "의약품"}</Text>

      {/* 약 종류 */}
      <Text style={styles.subTitle}>종류: {info?.medicationType ?? "정보 없음"}</Text>

      {/* 폐기 방법 */}
      <View style={styles.section}>
        <Text style={styles.label}>폐기 방법</Text>
        <Text style={styles.value}>{info?.discardMethod ?? "정보 없음"}</Text>
      </View>

      {/* 폐기 장소 */}
      <View style={styles.section}>
        <Text style={styles.label}>폐기 장소</Text>
        <Text style={styles.value}>
          거주하는 지역의 약국이나 보건소, 행정복지센터에 비치된 폐의약품 수거함에 폐기
        </Text>
      </View>

      {/* 주의사항 */}
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
    marginBottom: 10,
  },
  subTitle: {
    ...FONTS.h3,
    color: COLORS.darkGray,
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
