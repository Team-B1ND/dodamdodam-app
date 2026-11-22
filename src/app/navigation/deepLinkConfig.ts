import type { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import type { RootStackParamList } from "./navigationTypes";

export const deepLinkPrefixes = [Linking.createURL("/"), "dodamdodam://"];
export const aidTabPath = "aid";
export const aidServicePath = "apps";

const aidServiceScreen = Platform.OS === "android" ? "AidEntry" : "InAppLaunch";

export const deepLinkConfig = {
  screens: {
    Main: {
      path: "",
      screens: {
        Home: "home",
        OutSleeping: "out-sleeping",
        NightStudy: "night-study",
        Aid: aidTabPath,
        More: "more",
      },
    },

    Meal: "meal",
    Notification: "notifications",
    OutSleepingApply: "out-sleeping/apply",
    [aidServiceScreen]: `${aidServicePath}/:appId`,

    NightStudyApply: {
      path: "night-study/apply",
      parse: {
        tab: (value: string) => value === "project" ? "project" : "personal",
      },
    },
  },
} satisfies NonNullable<LinkingOptions<RootStackParamList>["config"]>;
