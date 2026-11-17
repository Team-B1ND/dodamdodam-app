import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@shared/config";
import { tokenStorage } from "./tokenStorage";
import { unregisterPushToken } from "@shared/lib/notification";
import { toast } from "@shared/ui/toast/toastManager";

const BASE_URL = env.API_BASE_URL;

let onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

export const basicApiHandler = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

basicApiHandler.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
// 세션 만료 처리가 시작되면 이후 401은 갱신을 시도하지 않고 즉시 거부한다.
// 만료 처리 중 나가는 요청(푸시 토큰 해제 등)이 대기열에 갇히는 것을 막는다.
let isSessionExpired = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(undefined);
  });
  failedQueue = [];
};

const handleSessionExpired = async () => {
  if (isSessionExpired) return;
  isSessionExpired = true;

  // 토큰 정리와 화면 전환을 먼저 끝낸다. 푸시 토큰 해제가 실패하거나 지연되어도
  // 로그아웃은 보장되어야 한다.
  await tokenStorage.clear();
  onSessionExpired?.();

  // 이미 만료된 토큰으로 나가는 정리 요청이라 실패해도 무방하다. 기다리지 않는다.
  void unregisterPushToken();
};

export const resetSessionExpiredState = () => {
  isSessionExpired = false;
};

basicApiHandler.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      toast.warning("네트워크 연결이 원활하지 않아요.", { position: "top" });
      return Promise.reject(error);
    }

    if (status && status >= 500) {
      toast.error("서비스 요청에 실패했어요.", { position: "top" });
      return Promise.reject(error);
    }

    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    // 만료 처리가 시작된 뒤의 401은 갱신 대상이 아니다.
    if (isSessionExpired) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => basicApiHandler(originalRequest));
    }

    if ((originalRequest as any)._retry) {
      await handleSessionExpired();
      return Promise.reject(error);
    }
    (originalRequest as any)._retry = true;

    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        await handleSessionExpired();
        return Promise.reject(error);
      }

      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
        { timeout: 10000 },
      );

      await tokenStorage.setTokens(
        data.data.access,
        data.data.refresh,
      );

      processQueue(null);
      return basicApiHandler(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      // 네트워크·서버 장애에는 기존 토큰을 유지한다. refresh 토큰이 명시적으로
      // 거절된 경우에만 세션을 종료해야 일시적 장애로 강제 로그아웃되지 않는다.
      const refreshStatus = axios.isAxiosError(refreshError)
        ? refreshError.response?.status
        : undefined;
      if (refreshStatus === 400 || refreshStatus === 401 || refreshStatus === 403) {
        await handleSessionExpired();
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
