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
import FamilyListScreen from "./FamilyListScreen";
import FamilyAddScreen from "./FamilyAddScreen";
import FamilyDetailScreen from "./FamilyDetailScreen";
import FamilyEditScreen from "./FamilyEditScreen";
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
import MedicationIntakeScreen from "./MedicationIntakeScreen";
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
import WarningIngredientListScreen from "./WarningIngredientListScreen";
import WarningIngredientAddScreen from "./WarningIngredientAddScreen";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";

// 가족 복용약 관련 추가 화면
import FamilyMedicationListScreen from "./FamilyMedicationListScreen";
import FamilyMedicationIntakeScreen from "./FamilyMedicationIntakeScreen";

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef<any>();

export default function App() {
  useEffect(() => {
    async function setupNotification() {
      try {
        await notifee.requestPermission();
        await notifee.createChannel({
          id: "timer-channel",
          name: "타이머 알림",
          importance: AndroidImportance.HIGH,
          vibration: true,
        });
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
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="CustomSetting" component={CustomSettingScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} />

          <Stack.Screen name="MedicationAdd" component={MedicationAddScreen} />
          <Stack.Screen name="MedicationList" component={MedicationListScreen} />
          <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} />
          <Stack.Screen name="MedicationEdit" component={MedicationEditScreen} />
          <Stack.Screen name="MedicationIntake" component={MedicationIntakeScreen} />
          <Stack.Screen name="Timer" component={TimerScreen} />

          <Stack.Screen name="IntakeCalc" component={IntakeCalcScreen} />
          <Stack.Screen name="IntakeListScreen" component={IntakeListScreen} />
          <Stack.Screen name="IntakeAddScreen" component={IntakeAddScreen} />
          <Stack.Screen
            name="IntakeDetailScreen"
            component={IntakeDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="IntakeEditScreen"
            component={IntakeEditScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen name="Interaction" component={InteractionScreen} />
          <Stack.Screen name="Disposal" component={DisposalScreen} />
          <Stack.Screen name="DisposalGuide" component={DisposalGuideScreen} />
          <Stack.Screen name="DrugInfo" component={DrugInfoScreen} />

          <Stack.Screen name="FamilyList" component={FamilyListScreen} />
          <Stack.Screen name="FamilyAdd" component={FamilyAddScreen} />
          <Stack.Screen name="FamilyDetail" component={FamilyDetailScreen} />
          <Stack.Screen name="FamilyEdit" component={FamilyEditScreen} />
          <Stack.Screen name="FamilyMedicationList" component={FamilyMedicationListScreen} />
          <Stack.Screen name="FamilyMedicationIntake" component={FamilyMedicationIntakeScreen} />

          <Stack.Screen name="BoardListScreen" component={BoardListScreen} />
          <Stack.Screen name="BoardDetailScreen" component={BoardDetailScreen} />
          <Stack.Screen name="BoardWriteScreen" component={BoardWriteScreen} />
          <Stack.Screen name="BoardEditScreen" component={BoardEditScreen} />
          <Stack.Screen name="AnswerWriteScreen" component={AnswerWriteScreen} />
          <Stack.Screen name="AnswerEditScreen" component={AnswerEditScreen} />

          <Stack.Screen name="WarningIngredientList" component={WarningIngredientListScreen} />
          <Stack.Screen name="WarningIngredientAdd" component={WarningIngredientAddScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppStoreProvider>
  );
}