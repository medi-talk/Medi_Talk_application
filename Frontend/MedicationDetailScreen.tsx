// MedicationDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { COLORS, SIZES, FONTS } from './styles/theme';

export default function MedicationDetailScreen({ route }: any) {
  const { medication } = route.params ?? {};

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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>{medication.name}</Text>
        
        <Text style={styles.label}>복용 기간</Text>
        <Text style={styles.value}>
          {medication.startDate} ~ {medication.endDate}
        </Text>

        <Text style={styles.label}>복용 간격</Text>
        <Text style={styles.value}>{medication.intervalMin} 분</Text>

        <Text style={styles.label}>유통기한</Text>
        <Text style={styles.value}>{medication.expiry}</Text>

        <Text style={styles.label}>알림</Text>
        <Text style={styles.value}>{medication.alarmFlag ? 'ON' : 'OFF'}</Text>
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
});
