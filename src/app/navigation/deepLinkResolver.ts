import type { NavigationState, PartialState } from "@react-navigation/native";
import * as Linking from "expo-linking";
import type { MainTabParamList, RootStackParamList } from "./navigationTypes";

type ResetState = PartialState<NavigationState>;
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
  const normalizedPath = rawPath.replace(/\/+$/, "");
  const path = normalizedPath.toLowerCase();

  // iOS와 같은 apps 경로를 사용하고, 기존 Android 위젯의 aid 링크도 받는다.
  if (path.startsWith("apps/") || path.startsWith("aid/")) {
    const encodedAppId = normalizedPath.slice(normalizedPath.indexOf("/") + 1);
    try {
      const appId = decodeURIComponent(encodedAppId);
      if (!appId || appId.length > 200 || /[\s/\\?#\u0000-\u001f\u007f]/.test(appId)) {
        return null;
      }

      return createRootStack("More", "AidEntry", { appId });
    } catch {
      return null;
    }
  }
  const tab = Object.prototype.hasOwnProperty.call(MAIN_TAB_PATHS, path)
    ? MAIN_TAB_PATHS[path]
    : undefined;

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
    let requestedTab: string | null;
    try {
      requestedTab = new URLSearchParams(rawQuery).get("tab");
    } catch {
      return null;
    }
    const selectedTab = requestedTab === "project" ? "project" : "personal";

    return createRootStack("NightStudy", "NightStudyApply", {
      tab: selectedTab,
    });
  }

  return null;
}
