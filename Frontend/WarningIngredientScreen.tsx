// WarningIngredientScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SIZES } from './styles/theme';

export default function WarningIngredientScreen({ navigation }: any) {
  // 더미 데이터 (DB 연결 전 임시)
  const [ingredients, setIngredients] = useState([
    { id: 1, name: '이부프로펜', englishName: 'ibuprofen' },
    { id: 2, name: '아세트아미노펜', englishName: 'acetaminophen' },
  ]);

  useEffect(() => {
    // TODO: 추후 DB 연결 시 주의 성분 목록 불러오기 API 연결
  }, []);

  const handleDelete = (id: number) => {
    // TODO: 추후 DB 연결 시 삭제 API 연결
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const renderItem = ({ item }: { item: { id: number; name: string; englishName: string } }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.eng}>{item.englishName}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Icon name="trash-can-outline" size={22} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주의 성분 설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>등록된 주의 성분이 없습니다.</Text>
            <Text style={styles.emptySub}>아래 + 버튼을 눌러 추가하세요.</Text>
          </View>
        }
        contentContainerStyle={{ padding: SIZES.padding }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('WarningIngredientAddScreen')}
      >
        <Icon name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  headerTitle: { ...FONTS.h2, color: COLORS.darkGray },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    elevation: 2,
  },
  name: { ...FONTS.h3, color: COLORS.darkGray },
  eng: { ...FONTS.p, color: COLORS.gray, marginTop: 2 },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: SIZES.padding,
    bottom: SIZES.padding * 2,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  empty: { alignItems: 'center', marginTop: '50%' },
  emptyText: { ...FONTS.h2, color: COLORS.darkGray },
  emptySub: { ...FONTS.p, color: COLORS.gray, marginTop: 6 },
});