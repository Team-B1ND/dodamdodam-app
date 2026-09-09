import { type NavigationContainerRef, CommonActions } from "@react-navigation/native";
import messaging, { type FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { tokenStorage } from "@entities/api/common";
import { notificationApi } from "@entities/notification/api";
import { LANDING_ROUTE } from "@shared/config";

const TAB_ROUTES: Record<string, string> = {
  "/meal": "Meal",
  "/outing": "OutSleeping",
  "/nightstudy": "NightStudy",
  "/home": "Home",
  "/more": "More",
};

const SPLASH_POLL_MS = 100;
const SPLASH_TIMEOUT_MS = 6000;

async function waitUntilSplashCleared(
  navigationRef: React.RefObject<NavigationContainerRef<any> | null>,
) {
  const deadline = Date.now() + SPLASH_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const route = navigationRef.current?.getCurrentRoute();
    if (route && route.name !== LANDING_ROUTE) return true;
    await new Promise((resolve) => setTimeout(resolve, SPLASH_POLL_MS));
  }

  return false;
}

async function handleNotificationNavigation(
  navigationRef: React.RefObject<NavigationContainerRef<any> | null>,
  data: Record<string, string> | undefined,
  waitForSplash = false,
) {
  if (!data?.appUrl || !navigationRef.current) return;

  const token = await tokenStorage.getAccessToken();
  if (!token) return;

  if (waitForSplash && !(await waitUntilSplashCleared(navigationRef))) return;
  if (!navigationRef.current) return;

  if (data.id) {
    notificationApi.markAsRead(data.id).catch(() => {});
  }

  navigateTo(navigationRef.current, data);
}

function navigateTo(navigation: NavigationContainerRef<any>, data: Record<string, string>) {
  const appUrl = data.appUrl;

  if (appUrl.startsWith("https://") || appUrl.startsWith("http://")) {
    const fullUrl = data.path ? `${appUrl.replace(/\/$/, "")}${data.path}` : appUrl;
    navigation.dispatch(
      CommonActions.navigate("AppWebView", {
        appUrl: fullUrl,
        name: data.appName ?? "",
      }),
    );
  } else if (appUrl.startsWith("/")) {
    const tabRoute = TAB_ROUTES[appUrl.toLowerCase()];
    if (tabRoute) {
      navigation.dispatch(
        CommonActions.navigate("Main", { screen: tabRoute }),
      );
    }
  }
}

export function setupNotificationNavigation(
  navigationRef: React.RefObject<NavigationContainerRef<any> | null>,
) {
  messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    handleNotificationNavigation(navigationRef, remoteMessage.data as Record<string, string>);
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        handleNotificationNavigation(navigationRef, remoteMessage.data as Record<string, string>, true);
      }
    });
}