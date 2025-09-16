import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';

export default function MedicationDetailScreen({ route, navigation }: any) {
  const { medication } = route.params ?? {};
  const { removeLinked } = useAppStore();

  if (!medication) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <Text style={styles.value}>약 정보가 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('삭제 확인', '정말 이 약을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          removeLinked(medication.id); // 약 + 타이머 + 폐기 알림 같이 제거
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>{medication.name}</Text>

        <Text style={styles.label}>복용 기간</Text>
        <Text style={styles.value}>
          {medication.startDate} ~ {medication.endDate}
        </Text>

        <Text style={styles.label}>복용 시간</Text>
        <FlatList
          data={medication.times}
          keyExtractor={(t, i) => i.toString()}
          renderItem={({ item }) => <Text style={styles.value}>- {item}</Text>}
        />

        <Text style={styles.label}>유통기한</Text>
        <Text style={styles.value}>{medication.expiry}</Text>

        <Text style={styles.label}>알림</Text>
        <Text style={styles.value}>{medication.alarmFlag ? 'ON' : 'OFF'}</Text>

        <Text style={styles.label}>가족 공개</Text>
        <Text style={styles.value}>{medication.familyShare ? '예' : '아니오'}</Text>

        {/* 수정하기 + 삭제하기 버튼을 한 줄에 배치 */}
        <View style={styles.rowButtons}>
          <TouchableOpacity
            style={[styles.editBtn, { flex: 1, marginRight: 6 }]}
            onPress={() => navigation.navigate('MedicationEdit', { medication })}
          >
            <Text style={styles.editBtnText}>수정하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteBtn, { flex: 1, marginLeft: 6 }]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteBtnText}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: SIZES.padding },
  title: { ...FONTS.h1, color: COLORS.primary, marginBottom: 20 },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginTop: 16 },
  value: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  rowButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  editBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  editBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    padding: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  deleteBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});
