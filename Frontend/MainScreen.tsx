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
    <TouchableOpacity style={styles.cardRow} onPress={onPress}>
        <View style={styles.iconRow}>
            <Icon name={item.icon} size={26} color={COLORS.primary} />
        </View>
        <Text style={styles.cardRowText}>{item.name}</Text>
    </TouchableOpacity>
);

export default function MainScreen({ navigation }: any) {
    const { state } = useAppStore();
    const userName = state.user ? state.user.name : '사용자';

    const renderSection = ({ item: section }: { 
        item: { title: string; data: { name: string; icon: string; screen: string; }[] }; 
    }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
                data={section.data}
                renderItem={({ item }) => (
                    <FeatureCard
                        item={item}
                        onPress={() => navigation.navigate(item.screen)}
                    />
                )}
                keyExtractor={(item) => item.name}
                numColumns={3} // 화면 너비에 맞게 3개씩 배치
                scrollEnabled={false}
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
        marginBottom: SIZES.padding,
    },
    sectionTitle: {
        ...FONTS.h3,
        color: COLORS.darkGray,
        marginBottom: SIZES.base,
        paddingHorizontal: SIZES.base,
    },
    cardRow: {
        flex: 1, // 화면 크기에 맞게 자동 분할
        minWidth: 100,
        maxWidth: 150,
        margin: 4,
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconRow: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardRowText: {
        ...FONTS.p,
        fontWeight: '500',
        color: COLORS.darkGray,
        textAlign: 'center',
    },
});
