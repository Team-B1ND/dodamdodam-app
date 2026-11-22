import { getStateFromPath } from "@react-navigation/native";
import { aidServicePath, aidTabPath, deepLinkConfig, deepLinkPrefixes } from "./deepLinkConfig";
import type { MainTabParamList, RootStackParamList } from "./navigationTypes";

type DeepLinkState = NonNullable<ReturnType<typeof getStateFromPath>>;

// 스택 화면에서 뒤로 가면 연결된 탭을 연다.
const PARENT_TABS: Partial<Record<keyof RootStackParamList, keyof MainTabParamList>> = {
  Meal: "Home",
  Notification: "Home",
  OutSleepingApply: "OutSleeping",
  NightStudyApply: "NightStudy",
  AidEntry: "Aid",
  InAppLaunch: "Aid",
};

const withParentTab = (state: DeepLinkState): DeepLinkState => {
  if (state.routes.length !== 1) return state;

  const [route] = state.routes;
  const parentTab = PARENT_TABS[route.name as keyof RootStackParamList];
  if (!parentTab) return state;

  return {
    index: 1,
    routes: [{ name: "Main", state: { routes: [{ name: parentTab }] } }, route],
  };
};

export function getDeepLinkStateFromPath(path: string) {
  const [rawPath, query] = path.split("?", 2);
  const trimmedPath = rawPath.replace(/^\/+|\/+$/g, "");
  const [firstSegment] = trimmedPath.split("/", 1);
  const root = firstSegment.toLowerCase();
  let routePath = trimmedPath.toLowerCase();
  if (!routePath) return undefined;

  try {
    if (root === aidServicePath || routePath.startsWith(`${aidTabPath}/`)) {
      if (trimmedPath === firstSegment) return undefined;
      const appId = decodeURIComponent(trimmedPath.slice(firstSegment.length + 1));
      if (!appId || appId.length > 200 || /[\s/\\?#\u0000-\u001f\u007f]/.test(appId)) {
        return undefined;
      }

      // AID 서비스는 경로 ID만으로 조회하고 쿼리 파라미터는 무시한다.
      routePath = `${aidServicePath}/${encodeURIComponent(appId)}`;
    } else if (routePath === deepLinkConfig.screens.NightStudyApply.path) {
      const tab = new URLSearchParams(query).get("tab") ?? "";
      routePath += `?tab=${encodeURIComponent(tab)}`;
    }

    const state = getStateFromPath(routePath, deepLinkConfig);
    return state ? withParentTab(state) : undefined;
  } catch {
    return undefined;
  }
}

export function resolveDeepLink(url: string) {
  const prefix = deepLinkPrefixes.find(candidate => url.startsWith(candidate));
  return prefix ? getDeepLinkStateFromPath(url.slice(prefix.length)) ?? null : null;
}
