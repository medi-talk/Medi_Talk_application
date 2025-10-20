// FamilyDetailScreen.tsx
import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useAppStore } from "./store/appStore";
import api from "./utils/api";

type FamilyData = {
  familyId: string;
  nickname: string;
  relation: '부모' | '형제자매' | '자녀' | '배우자' | '보호자' | '기타';
  memo?: string;
};


export default function FamilyDetailScreen({ route, navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;
  const familyId = route.params?.familyId;

  const [family,  setFamily] = useState<FamilyData | null>(null);

  const [loading, setLoading] = useState(false);

  const fetchFamilyDetail = async () => {
    if (!familyId) return;
    try {
      setLoading(true);

      const res = await api.get(`/api/family/getUserFamilyDetail/${userId}/${familyId}`);

      if (res.data.success) {
        const detail: FamilyData = res.data.family;
        setFamily(detail);
      } else {
        Alert.alert('오류', '가족 상세 정보를 불러오는 데 실패했습니다.');
      }
    } catch (err : any) {
      console.error('❌ fetch family list error:', err);
      
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }

    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFamilyDetail();
    }, [familyId])
  );


  const handleDelete = () => {
    Alert.alert(
      "가족 삭제",
      `${family?.nickname}님을 가족 목록에서 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.delete(`/api/family/deleteFamilyLink/${userId}/${familyId}`);
              
              if (res.data.success) {
                Alert.alert("삭제 완료", "가족이 삭제되었습니다.", [
                  { text: "확인", onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('오류', '가족 삭제에 실패했습니다.');
              }

            } catch (err: any) {
              console.error("❌ delete family link error:", err);

              const status = err.response?.status;
              const message = err.response?.data?.message;

              if (status == 500) {
                Alert.alert('서버 오류', message);
              } else {
                Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
              }
            }
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
          <Text style={styles.name}>{family?.nickname}</Text>
          <Text style={styles.label}>관계</Text>
          <Text style={styles.value}>{family?.relation}</Text>

          <Text style={styles.label}>복약 메모</Text>
          <Text style={styles.value}>
            {family?.memo || "등록된 메모가 없습니다."}
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttons}>
          {/* 복용약 확인 버튼 */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#4CAF50" }]}
            onPress={() =>
              navigation.navigate("FamilyMedicationList", {
                familyId: family?.familyId,
                familyName: family?.nickname,
              })
            }
          >
            <Text style={styles.actionText}>복용약 확인</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => navigation.navigate("FamilyEdit", { familyId: family?.familyId })}
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