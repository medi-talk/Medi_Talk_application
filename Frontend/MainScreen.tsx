// MainScreen.tsx

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore'; // 전역 상태 불러오기

const groupedFeatures = [
    { title: '약 정보', data: [
        { name: '의약품 정보', icon: 'pill', screen: 'DrugInfo' },
        { name: '약물 상호작용', icon: 'flask-outline', screen: 'Interaction' },
        { name: '섭취량 계산기', icon: 'scale-bathroom', screen: 'IntakeCalc' },
    ]},
    { title: '복약 관리', data: [
        { name: '복약 관리', icon: 'calendar-check', screen: 'MedicationList' },
        { name: '복용 타이머', icon: 'timer-outline', screen: 'Timer' },
        { name: '폐기 알림', icon: 'trash-can-outline', screen: 'Disposal' },
    ]},
    { title: '사용자 설정', data: [
        { name: '맞춤 설정', icon: 'account-cog-outline', screen: 'CustomSetting' },
        { name: '가족 관리', icon: 'account-group-outline', screen: 'FamilyList' },
    ]},
    { title: '기타 정보', data: [
        { name: '근처 약국 찾기', icon: 'map-marker-outline', screen: 'PharmacyList' },
        { name: '질문 게시판', icon: 'comment-question-outline', screen: 'QuestionListScreen'},
    ]},
];

const FeatureCard = ({ item, onPress }: { 
    item: { name: string; icon: string; screen: string; }; 
    onPress: () => void; 
}) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.iconContainer}>
            <Icon name={item.icon} size={30} color={COLORS.primary} />
        </View>
        <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
);

export default function MainScreen({ navigation }: any) {
    const { state } = useAppStore(); // 전역 상태 불러오기
    const userName = state.user ? state.user.name : '사용자';

    const renderSection = ({ item: section }: { 
        item: { title: string; data: { name: string; icon: string; screen: string; }[] }; 
    }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
                data={section.data}
                renderItem={({ item }: { item: { name: string; icon: string; screen: string; } }) => (
                    <FeatureCard
                        item={item}
                        onPress={() => navigation.navigate(item.screen)}
                    />
                )}
                keyExtractor={(item) => item.name}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={groupedFeatures}
                renderItem={renderSection}
                keyExtractor={(item) => item.title}
                style={styles.container}
                contentContainerStyle={{ paddingHorizontal: SIZES.padding, paddingBottom: 40 }}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Medi_Talk</Text>
                        <Text style={styles.subtitle}>
                          {userName}님, 복약을 도와드릴게요 👋
                        </Text>
                    </>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    container: {
        flex: 1,
    },
    title: {
        ...FONTS.h1,
        color: COLORS.darkGray,
        marginTop: SIZES.base,
    },
    subtitle: {
        ...FONTS.p,
        color: COLORS.gray,
        marginBottom: SIZES.padding,
    },
    section: {
        marginBottom: SIZES.base,
    },
    sectionTitle: {
        ...FONTS.h3,
        color: COLORS.darkGray,
        marginBottom: SIZES.base * 2,
        paddingHorizontal: SIZES.base,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 1.5,
        width: '48%',
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.base * 2,
    },
    cardText: {
        ...FONTS.p,
        fontWeight: '600',
        color: COLORS.darkGray,
    },
});
