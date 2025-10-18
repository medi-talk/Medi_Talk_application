// WarningIngredientAddScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SIZES } from './styles/theme';

export default function WarningIngredientAddScreen({ navigation, route }: any) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<
    { id: number; name: string; englishName?: string }[]
  >([]);

  const existing: { id: number; name: string }[] = route.params?.existing || [];

  const handleSearch = () => {
    const dummyAll = [
      { id: 1, name: '이부프로펜', englishName: 'ibuprofen' },
      { id: 2, name: '아세트아미노펜', englishName: 'acetaminophen' },
      { id: 3, name: '카페인', englishName: 'caffeine' },
      { id: 4, name: '니코틴', englishName: 'nicotine' },
      { id: 5, name: '아스피린', englishName: 'aspirin' },
    ];

    const filtered = dummyAll.filter(
      (item) =>
        item.name.includes(keyword) ||
        (item.englishName &&
          item.englishName.toLowerCase().includes(keyword.toLowerCase()))
    );

    setResults(filtered);
  };

  const handleAdd = (item: { id: number; name: string }) => {
    if (existing.some((i) => i.id === item.id)) {
      Alert.alert('중복 등록', `${item.name}은(는) 이미 등록된 성분입니다.`);
      return;
    }

    Alert.alert('등록 확인', `${item.name}을(를) 주의 성분 목록에 추가하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '추가',
        onPress: () => {
          // TODO: POST /api/
          Alert.alert('등록 완료', `${item.name}이(가) 추가되었습니다.`);
          navigation.navigate('WarningIngredientList', { added: item });
        },
      },
    ]);
  };

  const renderItem = ({
    item,
  }: {
    item: { id: number; name: string; englishName?: string };
  }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleAdd(item)}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        {item.englishName ? <Text style={styles.eng}>{item.englishName}</Text> : null}
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

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
          </View>
        }
        contentContainerStyle={{ padding: SIZES.padding }}
      />
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