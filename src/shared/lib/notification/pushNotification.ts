import { PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { basicApiHandler } from "@entities/api/common";
import { tokenStorage } from "@entities/api/common/tokenStorage";

function getPlatform(): string {
  if (Platform.OS === "ios") return "IOS";
  if (Platform.OS === "android") return "ANDROID";
  return "WEB";
}

async function requestPermission(): Promise<boolean> {
  // RNFB의 requestPermission은 안드로이드에서 항상 AUTHORIZED를 반환하는 no-op이라,
  // POST_NOTIFICATIONS를 직접 요청하지 않으면 거부된 채로 남아 알림이 조용히 버려진다.
  if (Platform.OS === "android") {
    if (Number(Platform.Version) < 33) return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

async function waitForApnsToken(maxRetries = 5): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    const apnsToken = await messaging().getAPNSToken();
    if (apnsToken) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export async function registerPushToken(): Promise<void> {
  try {
    const granted = await requestPermission();
    if (!granted) return;

    if (Platform.OS === "ios") {
      await messaging().registerDeviceForRemoteMessages();
      await waitForApnsToken();
    }

    const fcmToken = await messaging().getToken();
    if (!fcmToken) return;

    await basicApiHandler.post("/notification/device-tokens", {
      fcmToken,
      platform: getPlatform(),
    });
  } catch (err) {
    console.error("Failed to register push token:", err);
  }
}

/**
 * 백그라운드로 온 data 메시지는 이 핸들러가 없으면 버려진다. 표시는 FCM이 담당하므로
 * 하는 일은 없지만 등록은 되어 있어야 한다. 컴포넌트 밖에서 한 번만 호출한다.
 */
export function setupBackgroundMessageHandler(): void {
  messaging().setBackgroundMessageHandler(async () => {});
}

/** 토큰이 바뀌었는데 다시 보내지 않으면 서버에 낡은 값이 남아 알림이 끊긴다. 구독 해제 함수를 반환한다. */
export function setupTokenRefresh(): () => void {
  return messaging().onTokenRefresh(async (fcmToken: string) => {
    try {
      // 로그아웃 상태에서 보내면 401로 이어져 세션 만료 처리가 불필요하게 돈다.
      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) return;

      await basicApiHandler.post("/notification/device-tokens", {
        fcmToken,
        platform: getPlatform(),
      });
    } catch (err) {
      console.error("Failed to refresh push token:", err);
    }
  });
}

export async function unregisterPushToken(): Promise<void> {
  try {
    const fcmToken = await messaging().getToken();
    if (!fcmToken) return;

    await basicApiHandler.delete("/notification/device-tokens", {
      data: { fcmToken },
    });
  } catch (err) {
    console.error("Failed to unregister push token:", err);
  }
}
