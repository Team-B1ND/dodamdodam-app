import type { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import type { RootStackParamList } from "./navigationTypes";

export const deepLinkPrefixes = [Linking.createURL("/"), "dodamdodam://"];

export const deepLinkConfig: NonNullable<
  LinkingOptions<RootStackParamList>["config"]
> = {
  screens: {
    Main: {
      path: "",
      screens: {
        Home: "home",
        OutSleeping: "out-sleeping",
        NightStudy: "night-study",
        More: "more",
      },
    },

    Meal: "meal",
    Notification: "notifications",
    OutSleepingApply: "out-sleeping/apply",

    NightStudyApply: {
      path: "night-study/apply",
      parse: {
        tab: value =>
          value === "project" || value === "personal" ? value : undefined,
      },
    },
  },
};
