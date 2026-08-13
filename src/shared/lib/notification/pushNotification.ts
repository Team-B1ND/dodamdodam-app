import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { basicApiHandler } from "@entities/api/common";
import { tokenStorage } from "@entities/api/common/tokenStorage";

function getPlatform(): string {
  if (Platform.OS === "ios") return "IOS";
  if (Platform.OS === "android") return "ANDROID";
  return "WEB";
}

async function requestPermission(): Promise<boolean> {
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
 * FCM 토큰은 재설치·백업 복원 등으로 앱 실행 중에도 바뀐다. 새 토큰을 서버에 다시 보내지 않으면
 * 서버에 낡은 토큰만 남아 알림이 조용히 끊긴다.
 * 반환값은 구독 해제 함수다.
 */
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
