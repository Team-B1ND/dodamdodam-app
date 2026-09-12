import { CommonActions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import type { MainTabParamList, RootStackParamList } from "./navigationTypes";

type ResetState = Parameters<typeof CommonActions.reset>[0];
type MainTabName = keyof MainTabParamList;

export const deepLinkPrefixes = [Linking.createURL("/"), "dodamdodam://"];

const MAIN_TAB_PATHS: Record<string, MainTabName> = {
  home: "Home",
  meal: "Meal",
  "out-sleeping": "OutSleeping",
  "night-study": "NightStudy",
  more: "More",
};

const createMainRoute = (screen: MainTabName) => ({
  name: "Main" as const,
  params: { screen },
});

const createRootStack = (
  parentTab: MainTabName,
  destination: keyof RootStackParamList,
  params?: object,
): ResetState => ({
  index: 1,
  routes: [
    createMainRoute(parentTab),
    params ? { name: destination, params } : { name: destination },
  ],
});

const extractRelativeUrl = (url: string) => {
  const prefix = deepLinkPrefixes.find((candidate) => url.startsWith(candidate));
  if (!prefix) return null;

  return url.slice(prefix.length).replace(/^\/+/, "");
};

export function resolveDeepLink(url: string): ResetState | null {
  const relativeUrl = extractRelativeUrl(url);
  if (relativeUrl === null) return null;

  const [rawPath, rawQuery = ""] = relativeUrl.split("?", 2);
  const path = rawPath.replace(/\/+$/, "").toLowerCase();
  const tab = MAIN_TAB_PATHS[path];

  if (tab) {
    return {
      index: 0,
      routes: [createMainRoute(tab)],
    };
  }

  if (path === "notifications") {
    return createRootStack("Home", "Notification");
  }

  if (path === "out-sleeping/apply") {
    return createRootStack("OutSleeping", "OutSleepingApply");
  }

  if (path === "night-study/apply") {
    const requestedTab = new URLSearchParams(rawQuery).get("tab");
    const selectedTab = requestedTab === "project" ? "project" : "personal";

    return createRootStack("NightStudy", "NightStudyApply", {
      tab: selectedTab,
    });
  }

  return null;
}
