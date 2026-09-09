import { type NavigationContainerRef, CommonActions } from "@react-navigation/native";
import messaging, { type FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { tokenStorage } from "@entities/api/common";
import { notificationApi } from "@entities/notification/api";

const STACK_ROUTES: Record<string, string> = {
  "/meal": "Meal",
};

const TAB_ROUTES: Record<string, string> = {
  "/outing": "Outing",
  "/nightstudy": "NightStudy",
  "/home": "Home",
  "/more": "More",
};

async function handleNotificationNavigation(
  navigationRef: React.RefObject<NavigationContainerRef<any> | null>,
  data: Record<string, string> | undefined,
) {
  if (!data?.appUrl || !navigationRef.current) return;

  const token = await tokenStorage.getAccessToken();
  if (!token) return;

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
    const path = appUrl.toLowerCase();
    const stackRoute = STACK_ROUTES[path];
    if (stackRoute) {
      navigation.dispatch(CommonActions.navigate(stackRoute));
      return;
    }

    const tabRoute = TAB_ROUTES[path];
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
        handleNotificationNavigation(navigationRef, remoteMessage.data as Record<string, string>);
      }
    });
}