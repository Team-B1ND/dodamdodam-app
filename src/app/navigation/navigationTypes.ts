import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Meal: undefined;
  OutSleeping: undefined;
  NightStudy: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  LoginForm: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
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
};