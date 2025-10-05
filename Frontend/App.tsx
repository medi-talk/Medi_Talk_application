// App.tsx
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createNavigationContainerRef } from "@react-navigation/native";
import { AppStoreProvider } from "./store/appStore";

import StartScreen from "./StartScreen";
import LoginScreen from "./LoginScreen";
import SignUpScreen from "./SignUpScreen";
import MainScreen from "./MainScreen";
import CustomSettingScreen from "./CustomSettingScreen";
import DisposalScreen from "./DisposalScreen";
import DrugInfoScreen from "./DrugInfoScreen";
import FamilyEditScreen from "./FamilyEditScreen";
import FamilyListScreen from "./FamilyListScreen";
import IntakeCalcScreen from "./IntakeCalcScreen";
import IntakeListScreen from "./IntakeListScreen";
import IntakeAddScreen from "./IntakeAddScreen";
import IntakeDetailScreen from "./IntakeDetailScreen";
import IntakeEditScreen from "./IntakeEditScreen";

import InteractionScreen from "./InteractionScreen";
import MedicationAddScreen from "./MedicationAddScreen";
import MedicationListScreen from "./MedicationListScreen";
import MedicationDetailScreen from "./MedicationDetailScreen";
import MedicationEditScreen from "./MedicationEditScreen";
import PasswordChangeScreen from "./PasswordChangeScreen";
import ProfileEditScreen from "./ProfileEditScreen";
import TimerScreen from "./TimerScreen";
import DisposalGuideScreen from "./DisposalGuideScreen";
import BoardListScreen from "./BoardListScreen";
import BoardDetailScreen from "./BoardDetailScreen";
import BoardWriteScreen from "./BoardWriteScreen";
import BoardEditScreen from "./BoardEditScreen";
import AnswerWriteScreen from "./AnswerWriteScreen";
import AnswerEditScreen from "./AnswerEditScreen";

import notifee, { AndroidImportance, EventType } from "@notifee/react-native";

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef<any>();

export default function App() {
  useEffect(() => {
    async function setupNotification() {
      try {
        await notifee.requestPermission();

        const channelId = await notifee.createChannel({
          id: "timer-channel",
          name: "타이머 알림",
          importance: AndroidImportance.HIGH,
          vibration: true,
        });
        console.log("Notification channel created:", channelId);
      } catch (e) {
        console.error("Failed to setup notifications", e);
      }
    }

    setupNotification();

    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.pressAction?.id === "open-timer") {
        if (navigationRef.isReady()) navigationRef.navigate("Timer");
      }
    });

    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS && detail.pressAction?.id === "open-timer") {
        if (navigationRef.isReady()) navigationRef.navigate("Timer");
      }
    });

    return () => {
      unsubscribeForeground();
    };
  }, []);

  return (
    <AppStoreProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Start">
          {/* 메인 화면 */}
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="CustomSetting" component={CustomSettingScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} />

          {/* 약물 / 타이머 관련 */}
          <Stack.Screen name="MedicationAdd" component={MedicationAddScreen} />
          <Stack.Screen name="MedicationList" component={MedicationListScreen} />
          <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} />
          <Stack.Screen name="MedicationEdit" component={MedicationEditScreen} />
          <Stack.Screen name="Timer" component={TimerScreen} />

          {/* 영양소 관련 */}
          <Stack.Screen name="IntakeCalc" component={IntakeCalcScreen} />
          <Stack.Screen name="IntakeListScreen" component={IntakeListScreen} />
          <Stack.Screen name="IntakeAddScreen" component={IntakeAddScreen} />
          <Stack.Screen name="IntakeDetailScreen"component={IntakeDetailScreen}options={{ headerShown: false }}/>
          <Stack.Screen name="IntakeEditScreen"component={IntakeEditScreen}options={{ headerShown: false }}/>

          {/* 기타 기능 */}
          <Stack.Screen name="Interaction" component={InteractionScreen} />
          <Stack.Screen name="Disposal" component={DisposalScreen} />
          <Stack.Screen name="DisposalGuide" component={DisposalGuideScreen} />
          <Stack.Screen name="DrugInfo" component={DrugInfoScreen} />

          {/* 가족 관리 */}
          <Stack.Screen name="FamilyEdit" component={FamilyEditScreen} />
          <Stack.Screen name="FamilyList" component={FamilyListScreen} />

          {/* 게시판 */}
          <Stack.Screen name="BoardListScreen" component={BoardListScreen} />
          <Stack.Screen name="BoardDetailScreen" component={BoardDetailScreen} />
          <Stack.Screen name="BoardWriteScreen" component={BoardWriteScreen} />
          <Stack.Screen name="BoardEditScreen" component={BoardEditScreen} />
          <Stack.Screen name="AnswerWriteScreen" component={AnswerWriteScreen} />
          <Stack.Screen name="AnswerEditScreen" component={AnswerEditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppStoreProvider>
  );
}
