import { useState, useCallback } from "react";
import { type AxiosError } from "axios";
import { authApi } from "@entities/auth/api";
import { tokenStorage, resetSessionExpiredState } from "@entities/api/common";
import { registerPushToken } from "@shared/lib/notification";
import type { ApiError } from "@shared/types";

interface UseLoginResult {
  username: string;
  password: string;
  loading: boolean;
  error: string | null;
  setUsername: (text: string) => void;
  setPassword: (text: string) => void;
  handleLogin: () => Promise<string | null>;
}

export const useLogin = (): UseLoginResult => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async (): Promise<string | null> => {
    if (!username.trim() || !password.trim() || loading) return "입력을 확인해주세요";

    setLoading(true);
    setError(null);

    try {
      const { data } = await authApi.login({ username, password });
      await tokenStorage.setTokens(data.data.access, data.data.refresh);
      // 이전 세션에서 만료 처리가 걸려 있었다면 해제한다.
      resetSessionExpiredState();
      registerPushToken();
      return null;
    } catch (e) {
      const axiosError = e as AxiosError;

      const responseData = axiosError.response?.data as ApiError | undefined;
      const message = responseData?.message ?? "잠시 후 다시 시도해주세요";
      setError(message);
      return message;
    } finally {
      setLoading(false);
    }
  }, [username, password, loading]);

  return {
    username,
    password,
    loading,
    error,
    setUsername,
    setPassword,
    handleLogin,
  };
};
