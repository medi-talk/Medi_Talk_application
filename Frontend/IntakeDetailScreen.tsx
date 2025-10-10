// IntakeDetailScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import api from "./utils/api";

type IntakeDetail = {
  nutrientId: number;
  nutrientName: string;
  unit: string;
  intake: string;
};

export default function IntakeDetailScreen({ route, navigation }: any) {
  const { id, name } = route.params;

  const [intakes, setIntakes] = useState<IntakeDetail[] | null>(null);
  const [groupTitle, setGroupTitle] = useState<string>(name || "상세 정보");

  const fetchIntakes = useCallback(async () => {
    try {
      const res = await api.get(`/api/intakeCalc/listUserNutrientGroupIntakes/${id}`);

      if (res.data.success && Array.isArray(res.data.intakes)) {
        setIntakes(res.data.intakes);
        if (res.data.groupTitle) setGroupTitle(res.data.groupTitle);
      } else {
        setIntakes([]);
      }

    } catch (err : any) {
      console.error('list intakes error:', err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchIntakes();
      return () => {};
    }, [fetchIntakes])
  );

  const handleDelete = () => {
    Alert.alert("삭제 확인", "이 영양소를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await api.delete(`/api/intakeCalc/deleteUserNutrientGroup/${id}`);

            if (res.data.success) {
              Alert.alert("삭제 완료", "영양소가 삭제되었습니다.");
              navigation.goBack();
            } else {
              Alert.alert("삭제 실패", res.data.message);
            }

          } catch (err : any) {
            console.error('delete intake error:', err);

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

  if (intakes === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.black} />
        </TouchableOpacity>

        <Text style={styles.header}>IntakeDetailScreen</Text>

        <View style={styles.groupBox}>
          <Text style={styles.groupTitle}>{groupTitle}</Text>
        </View>

        <View style={styles.section}>
          { intakes
            .filter((nutrient) => Number(nutrient.intake) > 0)
            .map((nutrient) => (
              <View key={nutrient.nutrientId} style={styles.itemBlock}>
                <Text style={styles.itemLabel}>{nutrient.nutrientName}</Text>
                <Text style={styles.itemValue}>{`${nutrient.intake} ${nutrient.unit}`}</Text>
              </View>
            ))
          }
          {intakes.length === 0 || intakes.every((nutrient) => Number(nutrient.intake) <= 0) ? (
            <Text style={{ ...FONTS.p, color: COLORS.darkGray }}>표시할 섭취량이 없습니다.</Text>
          ) : null}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("IntakeEditScreen", { 
              userNutrientId: id,
              groupTitle: groupTitle,
              intakes: intakes.map((n: any) => ({
                nutrientId: n.nutrientId,
                intake: n.intake,
              }))
             })}
          >
            <Text style={styles.btnText}>수정하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.btnText}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: SIZES.padding, paddingBottom: 40 },
  backBtn: { marginBottom: 10 },
  header: { ...FONTS.h2, marginBottom: 10 },
  groupBox: { alignItems: "center", marginVertical: 20 },
  groupTitle: { ...FONTS.h2, color: COLORS.primary },
  section: { marginBottom: 40 },
  itemBlock: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    paddingBottom: 8,
  },
  itemLabel: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: 6 },
  itemValue: { ...FONTS.h3, color: COLORS.black, textAlign: "left", paddingLeft: 4 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  editBtn: {
    flex: 1,
    backgroundColor: "#4285F4",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { ...FONTS.h3, color: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { ...FONTS.h3, color: COLORS.darkGray },
});