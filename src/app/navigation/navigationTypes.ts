import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  OutSleeping: undefined;
  NightStudy: undefined;
  Home: undefined;
  Aid: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  LoginForm: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Meal: undefined;
  AppIn: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Notification: undefined;
  SelectRole: undefined;
  EnterName: {
    role: string;
  };
  CreateAccount: undefined;
  ChangePassword: undefined;
  ResetPassword: undefined;
  OutSleepingApply: undefined;
  NightStudyApply: {
    tab?: "personal" | "project";
  };
  TeamList: undefined;
  TeamDetail: {
    teamId: string;
  };
  TeamCreate: undefined;
  TeamEdit: {
    teamId: string;
  };
  AppWebView: {
    appUrl: string;
    name: string;
  };
  InAppLaunch: {
    appId: string;
  };
};