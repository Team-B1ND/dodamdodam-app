import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { BottomTabNavigator } from "./BottomTabNavigator";
import { iosSlideTransition } from "./iosSlideTransition";
import { LandingPage } from "@pages/landing";
import { LoginPage } from "@pages/login";
import { LoginFormPage } from "@pages/login-form";
import { AppInInfoPage } from "@pages/appIn";
import { SettingsPage } from "@pages/settings";
import { EditProfilePage } from "@pages/edit-profile";
import { NotificationPage } from "@pages/notification";
import { SelectRolePage } from "@pages/select-role";
import { EnterNamePage } from "@pages/enter-name";
import { CreateAccountPage } from "@pages/create-account";
import { AppWebViewPage } from "@pages/app-webview";
import { OutSleepingApplyPage } from "@pages/out-sleeping";
import { NightStudyApplyPage } from "@pages/night-study";
import { TeamListPage, TeamDetailPage } from "@pages/team";
import { ChangePasswordPage } from "@pages/change-password";
import { ResetPasswordPage } from "@pages/reset-password";

const Stack = createStackNavigator();

export const RootStackNavigator = () => (
  <Stack.Navigator
    initialRouteName="Landing"
    screenOptions={{
      ...iosSlideTransition,
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Landing"
      component={LandingPage}
      options={{ gestureEnabled: false, cardStyleInterpolator: () => ({}) }}
    />
    <Stack.Screen
      name="Login"
      component={LoginPage}
      options={{ gestureEnabled: false, cardStyleInterpolator: () => ({}) }}
    />
    <Stack.Screen name="LoginForm" component={LoginFormPage} />
    <Stack.Screen name="Main" component={BottomTabNavigator} />
    <Stack.Screen name="AppIn" component={AppInInfoPage} />
    <Stack.Screen name="Settings" component={SettingsPage} />
    <Stack.Screen name="EditProfile" component={EditProfilePage} />
    <Stack.Screen name="Notification" component={NotificationPage} />
    <Stack.Screen name="SelectRole" component={SelectRolePage} />
    <Stack.Screen name="EnterName" component={EnterNamePage} />
    <Stack.Screen name="CreateAccount" component={CreateAccountPage} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordPage} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />
    <Stack.Screen name="OutSleepingApply" component={OutSleepingApplyPage} />
    <Stack.Screen name="NightStudyApply" component={NightStudyApplyPage} />
    <Stack.Screen name="TeamList" component={TeamListPage} />
    <Stack.Screen name="TeamDetail" component={TeamDetailPage} />
    <Stack.Screen
      name="AppWebView"
      component={AppWebViewPage}
      options={{ gestureEnabled: false }}
    />
  </Stack.Navigator>
);