import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, SafeAreaView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';
import api from './utils/api';
import { ActivityIndicator } from 'react-native-paper';

type FamilyData = {
  familyId: string;
  nickname: string;
  relation: '부모' | '형제자매' | '자녀' | '배우자' | '보호자' | '기타';
  memo?: string;
};


export default function FamilyListScreen({ navigation, route }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;

  const [family, setFamily] = useState<FamilyData[]>([]);

  const [loading, setLoading] = useState(false);


  const fetchFamilyList = async () => {
    if (!userId) return;
    try {
      setLoading(true);

      const res = await api.get(`/api/family/listUserFamilies/${userId}`);

      if (res.data.success) {
        const list: FamilyData[] = res.data.families || [];
        setFamily(list);
      } else {
        Alert.alert('오류', '가족 목록을 불러오는 데 실패했습니다.');
      }

    } catch (err: any) {
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
      fetchFamilyList();
    }, [userId])
  );

  const renderItem = ({ item }: { item: FamilyData }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FamilyDetail', { familyId: item.familyId })}
    >
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Icon name="account" size={24} color={COLORS.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.nickname}</Text>
          <Text style={styles.sub}>{item.relation}{item.memo ? ` · ${item.memo}` : ''}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base }}>가족 목록을 불러오는 중...</Text>
          </View>
        ) : family.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>가족이 비어 있어요</Text>
            <Text style={styles.emptySub}>아래 + 버튼으로 가족을 추가해보세요</Text>
          </View>
        ) : (
          <FlatList
            data={family}
            keyExtractor={i => i.familyId}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: SIZES.padding / 2 }}
          />
        )}

        
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('FamilyAdd')}
        >
          <Icon name="plus" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.lightGray },
  container: { flex: 1 },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base * 2,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SIZES.base },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  name: { ...FONTS.h3, color: COLORS.darkGray },
  sub: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...FONTS.h2, color: COLORS.darkGray },
  emptySub: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base },
  fab: {
    position: 'absolute', right: SIZES.padding, bottom: SIZES.padding * 2,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', elevation: 8,
  },
});