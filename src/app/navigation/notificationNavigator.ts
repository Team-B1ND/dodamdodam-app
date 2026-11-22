import {
  type NavigationContainerRef,
  CommonActions,
  getActionFromState,
} from "@react-navigation/native";
import messaging, { type FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { notificationApi } from "@entities/notification/api";
import { validateSession } from "@features/auth/session";
import { LANDING_ROUTE } from "@shared/config";
import { DEEP_LINK_PREFIX, deepLinkConfig } from "./deepLinkConfig";
import { resolveDeepLink } from "./deepLinkResolver";
import { pendingDeepLink } from "./pendingDeepLink";

type NavigationRef = React.RefObject<NavigationContainerRef<any> | null>;
type NotificationData = Record<string, string>;

// 서버가 보내는 기존 알림 경로를 deepLinkConfig 경로로 옮긴다.
const LEGACY_PATHS: Record<string, string> = {
  outing: "out-sleeping",
  nightstudy: "night-study",
};

const SPLASH_POLL_MS = 100;
const SPLASH_TIMEOUT_MS = 6000;

async function waitUntilSplashCleared(navigationRef: NavigationRef) {
  const deadline = Date.now() + SPLASH_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const route = navigationRef.current?.getCurrentRoute();
    if (route && route.name !== LANDING_ROUTE) return true;
    await new Promise((resolve) => setTimeout(resolve, SPLASH_POLL_MS));
  }

  return false;
}

const isWebUrl = (url: string) => url.startsWith("https://") || url.startsWith("http://");

// "/outing", "/meal?x=1" 같은 알림 경로를 dodamdodam:// 딥링크로 바꾼다.
const toDeepLinkUrl = (appUrl: string) => {
  const [rawPath, query] = appUrl.split("?", 2);
  const path = rawPath.replace(/^\/+|\/+$/g, "").toLowerCase();
  const mappedPath = LEGACY_PATHS[path] ?? path;

  return `${DEEP_LINK_PREFIX}${query === undefined ? mappedPath : `${mappedPath}?${query}`}`;
};

const toWebViewUrl = (data: NotificationData) =>
  data.path ? `${data.appUrl.replace(/\/$/, "")}${data.path}` : data.appUrl;

// react-navigation이 딥링크를 열 때와 같은 방식으로 이동한다.
// (스택 화면은 부모 탭을 깔고 reset, 탭은 navigate)
function openDeepLinkState(
  navigation: NavigationContainerRef<any>,
  state: NonNullable<ReturnType<typeof resolveDeepLink>>,
) {
  const action = getActionFromState(state, deepLinkConfig);

  if (action) {
    navigation.dispatch(action);
  } else {
    navigation.resetRoot(state);
  }
}

async function handleNotificationNavigation(
  navigationRef: NavigationRef,
  data: NotificationData | undefined,
) {
  const appUrl = data?.appUrl;
  if (!appUrl) return;

  const webView = isWebUrl(appUrl);
  const deepLinkUrl = webView ? null : toDeepLinkUrl(appUrl);
  const deepLinkState = deepLinkUrl ? resolveDeepLink(deepLinkUrl) : undefined;
  if (!webView && !deepLinkState) return;

  // 콜드 스타트에서는 Landing이 인증을 확인하고 화면을 정할 때까지 기다린다.
  if (!(await waitUntilSplashCleared(navigationRef))) return;

  const authenticated = await validateSession();
  const navigation = navigationRef.current;
  if (!navigation) return;

  if (!authenticated) {
    // 딥링크와 같이 로그인 후 이어서 열도록 보류한다.
    if (deepLinkUrl) pendingDeepLink.save(deepLinkUrl);
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }));
    return;
  }

  if (data.id) {
    notificationApi.markAsRead(data.id).catch(() => {});
  }

  if (deepLinkState) {
    openDeepLinkState(navigation, deepLinkState);
    return;
  }

  navigation.dispatch(
    CommonActions.navigate("AppWebView", {
      appUrl: toWebViewUrl(data),
      name: data.appName ?? "",
    }),
  );
}

export function setupNotificationNavigation(navigationRef: NavigationRef) {
  messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    handleNotificationNavigation(navigationRef, remoteMessage.data as NotificationData);
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        handleNotificationNavigation(navigationRef, remoteMessage.data as NotificationData);
      }
    });
}
