import type { Team } from "@entities/team";

export interface WeekendStudyApplyDoneParams {
  date: string;
  periods: number[];
}

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  LoginForm: undefined;
  Main: { screen?: string } | undefined;
  Meal: undefined;
  AppIn: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Notification: undefined;
  SelectRole: undefined;
  EnterName: undefined;
  CreateAccount: undefined;
  ChangePassword: undefined;
  ResetPassword: undefined;
  OutSleepingApply: undefined;
  NightStudyApply: { tab?: "personal" | "project" } | undefined;
  WeekendStudy: undefined;
  WeekendStudyApply: undefined;
  WeekendStudyApplyDone: WeekendStudyApplyDoneParams;
  TeamList: undefined;
  TeamDetail: { team: Team };
  TeamCreate: undefined;
  TeamEdit: { team: Team };
  AppWebView: { appUrl: string; name?: string };
};
