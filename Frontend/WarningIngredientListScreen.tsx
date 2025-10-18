// WarningIngredientListScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SIZES } from './styles/theme';

export default function WarningIngredientListScreen({ navigation }: any) {
  const [ingredients, setIngredients] = useState<
    { id: number; name: string; englishName?: string }[]
  >([]);

  // 더미 데이터 (API 연동 전)
  useEffect(() => {
    const dummy = [
      { id: 1, name: '이부프로펜', englishName: 'ibuprofen' },
      { id: 2, name: '아세트아미노펜', englishName: 'acetaminophen' },
      { id: 3, name: '카페인', englishName: 'caffeine' },
    ];
    setIngredients(dummy);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const params = navigation.getState()?.routes?.find(
        (r: any) => r.name === 'WarningIngredientList'
      )?.params as any;

      const added = params?.added;
      if (added && !ingredients.some((i) => i.id === added.id)) {
        setIngredients((prev) => [...prev, added]);
      }
    }, [navigation, ingredients])
  );

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      '주의 성분 삭제',
      `${name} 성분을 목록에서 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            // TODO: 실제 API 삭제 연결 예정
            setIngredients((prev) => prev.filter((x) => x.id !== id));
            Alert.alert('삭제 완료', `${name}이(가) 목록에서 제거되었습니다.`);
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 목록 렌더러
  const renderItem = ({ item }: { item: { id: number; name: string; englishName?: string } }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        {item.englishName ? <Text style={styles.eng}>{item.englishName}</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id, item.name)}
      >
        <Icon name="delete-outline" size={22} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주의 성분 목록</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 목록 */}
      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>등록된 주의 성분이 없습니다.</Text>
          </View>
        }
        contentContainerStyle={{ padding: SIZES.padding }}
      />

      {/* 추가 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('WarningIngredientAdd', { existing: ingredients })}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    elevation: 2,
  },
  name: { ...FONTS.h3, color: COLORS.darkGray },
  eng: { ...FONTS.p, color: COLORS.gray, marginTop: 2 },
  deleteBtn: { padding: 6 },
  fab: {
    position: 'absolute',
    bottom: SIZES.padding * 2,
    right: SIZES.padding * 2,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  empty: { alignItems: 'center', marginTop: '50%' },
  emptyText: { ...FONTS.h2, color: COLORS.gray },
});
