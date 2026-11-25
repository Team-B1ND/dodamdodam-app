import { useCallback } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  weekendStudyApi,
  weekendStudyQueryKeys,
  type WeekendStudyPersonalRequest,
} from "@entities/weekend-study";
import { toast } from "@shared/ui";

const notifyApplyError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return;

  // 네트워크 오류·5xx는 인터셉터가, 401은 세션 만료 처리가 담당한다.
  const status = error.response?.status;
  if (!status || status === 401 || status >= 500) return;

  const message =
    error.response?.data?.message || "주말 자습 신청에 실패했어요.";
  toast.warning(message, { position: "top" });
};

export const useWeekendStudyPersonalApply = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: WeekendStudyPersonalRequest) =>
      weekendStudyApi.createPersonal(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: weekendStudyQueryKeys.myPersonal }),
        queryClient.invalidateQueries({ queryKey: weekendStudyQueryKeys.myProject }),
      ]);
    },
    onError: async (error) => {
      notifyApplyError(error);

      if (!axios.isAxiosError(error)) return;

      const status = error.response?.status;
      const code = error.response?.data?.code;

      if (code === "PERIOD_OVERLAPPED" || (status === 409 && !code)) {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: weekendStudyQueryKeys.myPersonal }),
          queryClient.refetchQueries({ queryKey: weekendStudyQueryKeys.myProject }),
        ]);
      } else if (code === "NOT_APPLICATION_TIME") {
        await queryClient.refetchQueries({ queryKey: weekendStudyQueryKeys.deadline });
      }
    },
  });

  const apply = useCallback(
    async (request: WeekendStudyPersonalRequest): Promise<boolean> => {
      if (mutation.isPending) return false;

      try {
        await mutation.mutateAsync(request);
        return true;
      } catch {
        return false;
      }
    },
    [mutation],
  );

  return {
    apply,
    isLoading: mutation.isPending,
  };
};
