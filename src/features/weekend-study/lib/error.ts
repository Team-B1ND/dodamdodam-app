import axios from "axios";

export const WEEKEND_STUDY_SERVER_ERROR_MESSAGE =
  "주말 자습 서버에 연결할 수 없어요.";

interface ServerErrorBody {
  message?: unknown;
  code?: unknown;
}

/**
 * basicApiHandler 응답 인터셉터가 이미 토스트를 띄우거나 세션 만료를 처리한 오류인지 판별한다.
 * - ECONNABORTED / "Network Error": 인터셉터가 네트워크 경고 토스트 표시
 * - 5xx: 인터셉터가 오류 토스트 표시
 * - 401: 인터셉터가 토큰 갱신 또는 세션 만료 로그아웃 처리
 */
export const isHandledByCommonInterceptor = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;

  if (error.code === "ECONNABORTED" || error.message === "Network Error") {
    return true;
  }

  const status = error.response?.status;
  return status === 401 || (status !== undefined && status >= 500);
};

/**
 * 주말 자습 API 실패 시 사용자에게 보여줄 메시지를 반환한다.
 * 공통 인터셉터가 이미 처리한 오류면 null을 반환해 중복 토스트를 막는다.
 */
export const getWeekendStudyErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string | null => {
  if (isHandledByCommonInterceptor(error)) {
    return null;
  }

  if (!axios.isAxiosError(error)) {
    return WEEKEND_STUDY_SERVER_ERROR_MESSAGE;
  }

  const status = error.response?.status;
  if (!status) {
    return WEEKEND_STUDY_SERVER_ERROR_MESSAGE;
  }

  const data = error.response?.data as ServerErrorBody | undefined;
  const serverCode =
    typeof data?.code === "string" && data.code.trim().length > 0
      ? data.code
      : undefined;
  const serverMessage =
    typeof data?.message === "string" && data.message.trim().length > 0
      ? data.message
      : undefined;

  // 게이트웨이·미배포 404("No static resource ...")는 도메인 code가 없으므로 공통 안내 문구로 치환한다.
  if (status === 404 && !serverCode) {
    return WEEKEND_STUDY_SERVER_ERROR_MESSAGE;
  }

  return serverMessage ?? fallbackMessage;
};

/** 4xx 클라이언트 오류는 재시도해도 결과가 같으므로 즉시 실패 처리한다. */
export const shouldRetryWeekendStudyQuery = (
  failureCount: number,
  error: unknown,
): boolean => {
  if (failureCount >= 1) return false;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status !== undefined && status >= 400 && status < 500) {
      return false;
    }
  }
  return true;
};
