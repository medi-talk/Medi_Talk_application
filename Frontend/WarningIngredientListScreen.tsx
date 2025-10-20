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
import { useAppStore } from './store/appStore';
import api from './utils/api';

type IngredientData = {
  ingredientId: number;
  ingredientName: string;
  ingredientEnglishName: string;
};

export default function WarningIngredientListScreen({ navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;

  const [ingredients, setIngredients] = useState<IngredientData[]>([]);
  const [loading, setLoading] = useState(false);

  // 사용자 성분 목록 API 호출
  const fetchUserIngredients = async () => {
    if (!userId) return;
    try {
      setLoading(true);

      const res = await api.get(`/api/ingredient/listUserIngredients/${userId}`);

      if (res.data.success) {
        const list: IngredientData[] = res.data.ingredients || [];
        setIngredients(list);
      } else {
        Alert.alert('오류', '주의 성분 목록을 불러오는 데 실패했습니다.');
      }

    } catch (err: any) {
      console.error('❌ fetch user ingredients error:', err);

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
      fetchUserIngredients();
    }, [userId])
  );

  const handleDelete = (ingredient: IngredientData) => {
    Alert.alert('주의 성분 삭제', `${ingredient.ingredientName} 성분을 목록에서 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);

            const res = await api.delete(`/api/ingredient/deleteUserIngredient/${userId}/${ingredient.ingredientId}`);

            if (res.data.success) {
              Alert.alert('삭제 완료', `${ingredient.ingredientName}이(가) 목록에서 제거되었습니다.`, [
                { text: '확인', onPress: () => fetchUserIngredients() },
              ]);
            } else {
              Alert.alert('오류', '주의 성분 삭제에 실패했습니다.');
            }

          } catch (err: any) {
            console.error('❌ deleteUserIngredient error:', err);

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
        }
      },
    ]);
  };

  // 목록 렌더러
  const renderItem = ({ item }: { item: IngredientData }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.ingredientName}</Text>
        {item.ingredientEnglishName ? <Text style={styles.eng}>{item.ingredientEnglishName}</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item)}
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
        keyExtractor={(item) => item.ingredientId.toString()}
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
        onPress={() => navigation.navigate('WarningIngredientAdd')}
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
