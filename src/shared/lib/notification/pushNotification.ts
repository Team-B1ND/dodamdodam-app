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
  // RNFB의 requestPermission은 안드로이드에서 아무것도 하지 않고 항상 AUTHORIZED를 반환한다.
  // 그래서 POST_NOTIFICATIONS(Android 13+)를 직접 요청하지 않으면 권한이 거부된 채로 남고,
  // 시스템이 알림을 조용히 버린다.
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
 * data-only 메시지가 백그라운드로 오면 RNFB가 이 핸들러를 찾는다. 없으면 경고만 남기고
 * 메시지가 버려진다. 표시는 notification 페이로드를 받은 FCM이 담당하므로 여기서는
 * 별도로 하는 일이 없지만, 핸들러 자체가 등록돼 있어야 전달 경로가 끊기지 않는다.
 * 앱 코드가 아니라 모듈 최상위에서 한 번만 호출해야 한다.
 */
export function setupBackgroundMessageHandler(): void {
  messaging().setBackgroundMessageHandler(async () => {});
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
