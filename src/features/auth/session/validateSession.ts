import { tokenStorage } from "@entities/api/common";
import { userApi } from "@entities/user/api";

/**
 * 저장된 토큰이 실제 API 요청에서 유효한지 확인한다.
 * 401이면 공통 인터셉터가 refresh를 시도하고, 최종 실패 시 토큰을 제거한다.
 * 네트워크 장애처럼 인증 여부를 확정할 수 없는 경우에는 남아 있는 세션을 보존한다.
 */
export const validateSession = async (): Promise<boolean> => {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) return false;

  try {
    await userApi.getMe();
    return true;
  } catch {
    return Boolean(await tokenStorage.getAccessToken());
  }
};
