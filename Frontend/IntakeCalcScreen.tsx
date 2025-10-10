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
  Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "./styles/theme";
import * as Progress from "react-native-progress";
import api from "./utils/api";
import { useAppStore } from './store/appStore';

type UserProfileData = {
  ageYears: number;
  ageMonths: number;
  gender: '남자' | '여자';
  pregnantFlag : boolean;
  feedingFlag : boolean;
};

type NutrientStatusData = {
  id: string;
  name: string;
  unit: string;
  status: 0|1|2|3|4|5|6;
  myAmount: number;
  ear: number;
  rni: number;
  ai: number;
  ul: number;
  risk: string | null;
};

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
  const { state } = useAppStore();
  const userId = state.user?.id;

  const [profile, setProfile] = useState<UserProfileData | null>(null);

  const [selected, setSelected] = useState<NutrientStatusData | null>(null);
  const [nutrients, setNutrients] = useState<NutrientStatusData[]>([]);

  const [loading, setLoading] = useState(false);


  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get(`/api/intakeCalc/getUserProfileBasic/${userId}`);

      if (res.data.success) {
        const profile: UserProfileData = res.data.profile;
        setProfile(profile);
      } else {
        Alert.alert('오류', '프로필을 불러오지 못했습니다.');
      }

    } catch (err : any) {
        console.error('get profile error:', err);

        const status = err?.response?.status;
        const message = err?.response?.data?.message;
        
        if (status == 500) {
          Alert.alert('서버 오류', message);
        } else {
          Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
        }
    }
  }, [userId]);

  const fetchNutrientStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/intakeCalc/listUserNutrientStatus/${userId}`);

      if (res.data.success) {
        const list = (res.data.list || []).map((n : any): NutrientStatusData => ({
          id: String(n.nutrientId),
          name: n.nutrientName ?? "",
          unit: n.unit ?? "",
          status: Number(n.status) as NutrientStatusData['status'],
          myAmount: Number(n.intake ?? 0),
          ear: Number(n.averageNeed ?? 0),
          rni: Number(n.recommendIntake ?? 0),
          ai: Number(n.adequateIntake ?? 0),
          ul: Number(n.limitIntake ?? 0),
          risk: n.risk || null,
        }));
        setNutrients(list);
      } else {
        Alert.alert('오류', '영양소 섭취 상태를 불러오지 못했습니다.');
      }

    } catch (err : any) {
        console.error('list nutrient status error:', err);

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
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchNutrientStatus();

      const onBackPress = () => {
        navigation.navigate("Main");
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [navigation, fetchProfile, fetchNutrientStatus])
  );

  const renderItem = ({ item }: { item: NutrientStatusData }) => (
    <TouchableOpacity style={styles.row} onPress={() => setSelected(item)}>
      <Text style={styles.nutrient}>{item.name}</Text>
      <Text style={[styles.status, { color: statusLabels[item.status].color }]}>
        {statusLabels[item.status].text}
      </Text>
    </TouchableOpacity>
  );

  const calcProgress = (nutrient?: NutrientStatusData | null) => {
    if (!nutrient || nutrient.status === 0) return 0;
    if (nutrient.status === 1 || nutrient.status === 3) return Math.min(nutrient.myAmount / nutrient.rni, 1);
    if (nutrient.status === 2 || nutrient.status === 4) return Math.min(nutrient.myAmount / nutrient.ai, 1);
    if (nutrient.status === 5) return Math.min(nutrient.myAmount / nutrient.ul, 1);
    if (nutrient.status === 6) return Math.min(nutrient.myAmount / nutrient.ear, 1);
    return 0;
  };

  const unit = selected?.unit || "";
  const status = selected?.status || 0;
  const myAmount = Number(selected?.myAmount ?? 0);
  const ear = Number(selected?.ear ?? 0);
  const rni = Number(selected?.rni ?? 0);
  const ai = Number(selected?.ai ?? 0);
  const ul = Number(selected?.ul ?? 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.profileBox}
          onPress={() => navigation.navigate("ProfileEdit")}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.info}>
              나이: {
                profile
                  ? profile.ageYears >= 1
                    ? `만 ${profile.ageYears}세`
                    : `${profile.ageMonths}개월`
                  : "-"
              }
            </Text>
            <Text style={styles.info}>
              성별: {
                profile ? profile.gender : "-"
              }
            </Text>
            <Text style={styles.info}>
              임신 여부: {
                profile ? (profile.pregnantFlag ? "O" : "X") : "-"
              }
            </Text>
            <Text style={styles.info}>
              수유 여부: {
                profile ? (profile.feedingFlag ? "O" : "X") : "-"
              }
            </Text>
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
              {selected?.name} ({unit})
            </Text>
            <Text
              style={{
                color: statusLabels[status].color,
                ...FONTS.h3,
                marginBottom: 10,
              }}
            >
              {statusLabels[status].text}
            </Text>

            <View style={styles.detailRow}>
              <Text>나의 섭취량</Text>
              <Text>
                {myAmount.toFixed(1)} {unit}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text>평균 필요량 (EAR)</Text>
              <Text>
                {ear > 0 ? ear.toFixed(1) : "-"}{" "}
                {unit}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text>권장 섭취량 (RNI)</Text>
              <Text>
                {rni > 0 ? rni.toFixed(1) : "-"}{" "}
                {unit}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text>충분 섭취량 (AI)</Text>
              <Text>
                {ai > 0 ? ai.toFixed(1) : "-"}{" "}
                {unit}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text>상한 섭취량 (UL)</Text>
              <Text>
                {ul > 0 ? ul.toFixed(1) : "-"}{" "}
                {unit}
              </Text>
            </View>

            <Progress.Bar
              progress={calcProgress(selected)}
              color={statusLabels[status].color}
              borderWidth={0}
              unfilledColor={COLORS.lightGray}
              width={null}
              height={8}
              borderRadius={4}
              style={{ marginTop: 16 }}
            />

            {/* risk / 주의 문구 표시 */}
            {(() => {
              const deficiency = (status === 3 || status === 4 || status === 6);
              const excess = (status === 5);
              const tint = excess ? COLORS.danger : (deficiency ? '#FF9F43' : COLORS.gray);
              
              const riskText = selected?.risk || "";

              return (
                <View style={[styles.riskBox, { borderColor: tint }]} >
                  <Text style={[styles.riskText, { color: tint }]}>주의</Text>
                  <Text style={[styles.riskDesc, { color: tint }]}>{riskText}</Text>
                </View>
              );
            })()}

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
  riskBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  riskText: {
    ...FONTS.h4,
    marginBottom: 4,
  },
  riskDesc: {
    ...FONTS.p,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
});
