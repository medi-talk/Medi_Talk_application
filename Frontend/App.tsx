import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 전역 상태 관리 Provider
import { AppStoreProvider } from './store/appStore';

// 각 화면 import
import StartScreen from './StartScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import MainScreen from './MainScreen';
import CustomSettingScreen from './CustomSettingScreen';
import DisposalScreen from './DisposalScreen';
import DrugInfoScreen from './DrugInfoScreen';
import FamilyEditScreen from './FamilyEditScreen';
import FamilyListScreen from './FamilyListScreen';
import IntakeCalcScreen from './IntakeCalcScreen';
import InteractionScreen from './InteractionScreen';
import MedicationAddScreen from './MedicationAddScreen';
import MedicationListScreen from './MedicationListScreen';
import PasswordChangeScreen from './PasswordChangeScreen';
import ProfileEditScreen from './ProfileEditScreen';
import QuestionDetailScreen from './QuestionDetailScreen';
import QuestionListScreen from './QuestionListScreen';
import QuestionWriteScreen from './QuestionWriteScreen';
import TimerScreen from './TimerScreen';
import MedicationDetailScreen from './MedicationDetailScreen'; // ✅ 새로 import

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppStoreProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Start">
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="CustomSetting" component={CustomSettingScreen} />
          <Stack.Screen name="Disposal" component={DisposalScreen} />
          <Stack.Screen name="DrugInfo" component={DrugInfoScreen} />
          <Stack.Screen name="FamilyEdit" component={FamilyEditScreen} />
          <Stack.Screen name="FamilyList" component={FamilyListScreen} />
          <Stack.Screen name="IntakeCalc" component={IntakeCalcScreen} />
          <Stack.Screen name="Interaction" component={InteractionScreen} />
          <Stack.Screen name="MedicationAdd" component={MedicationAddScreen} />
          <Stack.Screen name="MedicationList" component={MedicationListScreen} />
          <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} /> 
          {/* ✅ 상세 화면 추가 */}
          <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
          <Stack.Screen name="QuestionList" component={QuestionListScreen} />
          <Stack.Screen name="QuestionWrite" component={QuestionWriteScreen} />
          <Stack.Screen name="Timer" component={TimerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppStoreProvider>
  );
}
