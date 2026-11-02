import { getStateFromPath } from "@react-navigation/native";
import { deepLinkConfig, deepLinkPrefixes } from "./deepLinkConfig";
import type { MainTabParamList, RootStackParamList } from "./navigationTypes";

type DeepLinkState = NonNullable<ReturnType<typeof getStateFromPath>>;

// 스택 화면으로 바로 진입해도 뒤로가기가 동작하도록 아래에 깔 탭
const PARENT_TABS: Partial<
  Record<keyof RootStackParamList, keyof MainTabParamList>
> = {
  Meal: "Home",
  Notification: "Home",
  OutSleepingApply: "OutSleeping",
  NightStudyApply: "NightStudy",
};

const normalizePath = (path: string) => {
  const [rawPath, query] = path.split("?", 2);
  const normalizedPath = rawPath.replace(/^\/+|\/+$/g, "").toLowerCase();

  return query === undefined ? normalizedPath : `${normalizedPath}?${query}`;
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
  const normalizedPath = normalizePath(path);

  // 빈 경로(dodamdodam://)는 기존과 같이 딥링크로 취급하지 않는다.
  if (normalizedPath.split("?")[0] === "") return undefined;

  const state = getStateFromPath(normalizedPath, deepLinkConfig);
  return state ? withParentTab(state) : undefined;
}

const extractRelativeUrl = (url: string) => {
  const prefix = deepLinkPrefixes.find(candidate => url.startsWith(candidate));
  if (!prefix) return null;

  return url.slice(prefix.length);
};

export function resolveDeepLink(url: string) {
  const path = extractRelativeUrl(url);
  return path === null ? undefined : getDeepLinkStateFromPath(path);
}
