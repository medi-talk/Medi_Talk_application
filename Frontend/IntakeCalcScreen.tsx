// IntakeCalcScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import * as Progress from "react-native-progress";

const dummyNutrients = [
  {
    id: "1",
    name: "비타민 A",
    unit: "μg RAE",
    status: 1,
    myAmount: 900.0,
    ear: 570.0,
    rni: 800.0,
    ai: 0.0,
    ul: 3000.0,
    risk: null,
  },
  {
    id: "2",
    name: "비타민 D",
    unit: "μg",
    status: 3,
    myAmount: 5.0,
    ear: 10.0,
    rni: 15.0,
    ai: 0.0,
    ul: 100.0,
    risk: "골다공증 위험 증가",
  },
  {
    id: "3",
    name: "비타민 K",
    unit: "μg",
    status: 5,
    myAmount: 600.0,
    ear: 150.0,
    rni: 250.0,
    ai: 0.0,
    ul: 500.0,
    risk: "혈액 응고 이상 가능",
  },
];

const statusLabels: any = {
  0: { text: "섭취 안함", color: COLORS.gray },
  1: { text: "적정 섭취 중", color: "green" },
  2: { text: "적정 섭취 중", color: "green" },
  3: { text: "충분하지 않을 수 있음", color: "#FF9F43" },
  4: { text: "충분 여부 불확실", color: "#FF9F43" },
  5: { text: "과다 섭취 위험", color: COLORS.danger },
  6: { text: "결핍 위험", color: COLORS.danger },
};

export default function IntakeCalcScreen({ navigation }: any) {
  const [selected, setSelected] = useState<any | null>(null);
  const [nutrients] = useState(dummyNutrients);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Main");
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
    <TouchableOpacity style={styles.row} onPress={() => setSelected(item)}>
      <Text style={styles.nutrient}>{item.name}</Text>
      <Text style={[styles.status, { color: statusLabels[item.status].color }]}>
        {statusLabels[item.status].text}
      </Text>
    </TouchableOpacity>
  );

  const calcProgress = (nutrient: any) => {
    if (!nutrient) return 0;
    if (nutrient.rni > 0) return Math.min(nutrient.myAmount / nutrient.rni, 1);
    if (nutrient.ul > 0) return Math.min(nutrient.myAmount / nutrient.ul, 1);
    return 0;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.profileBox}
          onPress={() => navigation.navigate("ProfileEdit")}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.info}>나이: 만 25세</Text>
            <Text style={styles.info}>성별: 남자</Text>
            <Text style={styles.info}>임신 여부: X</Text>
            <Text style={styles.info}>수유 여부: X</Text>
          </View>
          <Text style={styles.arrow}>{">"}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>영양소별 섭취 상태</Text>
        <FlatList
          data={nutrients}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>※ 주의사항 ※</Text>
          <Text style={styles.warningText}>
            음식 영양소까지 합치면 실제 섭취량은 더 높아질 수 있습니다.
          </Text>
          <Text style={styles.warningText}>
            개인 건강 상태에 따라 필요량은 달라질 수 있습니다.
          </Text>
          <Text style={styles.warningText}>
            상한 섭취량 근접 시 장기간 섭취에 주의가 필요합니다.
          </Text>
          <Text style={styles.warningText}>
            상한 섭취량이 없어도 과잉 섭취는 안전하다고 단정할 수 없습니다.
          </Text>
          <Text style={styles.warningText}>
            결과는 참고용이며, 정확한 상담은 의사·영양사와 하세요.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.modalTitle}>
              {selected?.name} ({selected?.unit})
            </Text>
            <Text
              style={{
                color: statusLabels[selected?.status || 0].color,
                ...FONTS.h3,
                marginBottom: 10,
              }}
            >
              {statusLabels[selected?.status || 0].text}
            </Text>

            <View style={styles.detailRow}>
              <Text>나의 섭취량</Text>
              <Text>
                {selected?.myAmount?.toFixed(1)} {selected?.unit}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text>권장 섭취량 (RNI)</Text>
              <Text>
                {selected?.rni > 0 ? selected.rni.toFixed(1) : "-"}{" "}
                {selected?.unit}
              </Text>
            </View>

            <Progress.Bar
              progress={calcProgress(selected)}
              color={statusLabels[selected?.status || 0].color}
              borderWidth={0}
              unfilledColor={COLORS.lightGray}
              width={null}
              height={8}
              borderRadius={4}
              style={{ marginTop: 16 }}
            />

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelected(null)}
            >
              <Text style={{ color: COLORS.white }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("IntakeListScreen")}
      >
        <Icon name="format-list-bulleted" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: SIZES.padding },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
  },
  info: { ...FONTS.p, color: COLORS.darkGray, marginBottom: 4 },
  arrow: { fontSize: 22, color: COLORS.darkGray, marginLeft: 8 },
  sectionTitle: { ...FONTS.h2, marginVertical: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.gray,
  },
  nutrient: { ...FONTS.h3, color: COLORS.darkGray },
  status: { ...FONTS.h4 },
  warningBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  warningTitle: { ...FONTS.h3, color: COLORS.danger, marginBottom: 6 },
  warningText: { ...FONTS.p, color: COLORS.darkGray, marginBottom: 2 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: { ...FONTS.h2, marginBottom: 12 },
  closeBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: SIZES.radius,
    alignItems: "center",
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  dialogBox: {
    width: "90%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
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
