// WarningIngredientAddScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SIZES } from './styles/theme';
import { useAppStore } from './store/appStore';
import api from './utils/api';

type IngredientData = {
  ingredientId: number;
  ingredientName: string;
  ingredientEnglishName: string;
};

export default function WarningIngredientAddScreen({ navigation, route }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;

  const [keyword, setKeyword] = useState('');
  const [ingredients, setIngredients] = useState<IngredientData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      Alert.alert('입력 오류', '검색어를 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      
      const res = await api.get(`/api/ingredient/listIngredients`, {
        params: { keyword }
      });

      if (res.data.success) {
        const list: IngredientData[] = res.data.ingredients || [];
        setIngredients(list);
      } else {
        Alert.alert('오류', res?.data.message || '성분 검색에 실패했습니다.');
      }

    } catch (err: any) {
      console.error('❌ search ingredients error:', err);

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

  const handleAdd = (ingredient: IngredientData) => {
    Alert.alert('등록 확인', `${ingredient.ingredientName}을(를) 주의 성분 목록에 추가하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '추가',
        onPress: async () => {
          try {
            setLoading(true);

            const res = await api.post(`/api/ingredient/createUserIngredient/${userId}`, {
              ingredientId: ingredient.ingredientId
            });

            if (res.data.success) {
              Alert.alert('등록 완료', `${ingredient.ingredientName}이(가) 추가되었습니다.`, [
                { text: '확인', onPress: () => navigation.goBack() },
              ]);
            } else {
              Alert.alert('오류', res.data?.message || '주의 성분 등록에 실패했습니다.');
            }

          } catch (err: any) {
            console.error('❌ createUserIngredient error:', err);

            const status = err.response?.status;
            const message = err.response?.data?.message;

            if (status == 409) {
              Alert.alert('중복 등록', message);
            } else if (status == 500) {
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

  const renderItem = ({ item }: { item: IngredientData }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleAdd(item)}>
      <View>
        <Text style={styles.name}>{item.ingredientName}</Text>
        {item.ingredientEnglishName ? <Text style={styles.eng}>{item.ingredientEnglishName}</Text> : null}
      </View>
      <Icon name="plus-circle-outline" size={22} color={COLORS.primary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주의 성분 등록</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="성분명 또는 영문명 검색"
          placeholderTextColor={COLORS.gray}
          value={keyword}
          onChangeText={setKeyword}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Icon name="magnify" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ ...FONTS.p, color: COLORS.gray, marginTop: 8 }}>
            검색 중...
          </Text>
        </View>
        ) : (
        <FlatList
          data={ingredients}
          keyExtractor={(item) => item.ingredientId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            </View>
          }
          contentContainerStyle={{ padding: SIZES.padding }}
        />
      )}
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
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    fontSize: 16,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 10,
  },
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
  empty: { alignItems: 'center', marginTop: '40%' },
  emptyText: { ...FONTS.h2, color: COLORS.gray },
});