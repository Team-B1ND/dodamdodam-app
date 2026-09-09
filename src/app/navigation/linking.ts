import type { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import type { RootStackParamList } from "./navigationTypes";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    Linking.createURL("/"),
    "dodamdodam://",
  ],
  config: {
    screens: {
      Main: {
        path: "",
        screens: {
          Home: "home",
          Meal: "meal",
          OutSleeping: "out-sleeping",
          NightStudy: "night-study",
          More: "more",
        },
      },

      Notification: "notifications",
      TeamList: "teams",

      TeamDetail: {
        path: "teams/:teamId",
        parse: {
          teamId: value => value,
        },
      },

      OutSleepingApply: "out-sleeping/apply",

      NightStudyApply: {
        path: "night-study/apply",
        parse: {
          tab: value =>
            value === "project" || value === "personal"
              ? value
              : undefined,
        },
      },
    },
  },
};