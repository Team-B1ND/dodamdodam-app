import { useCallback } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  weekendStudyApi,
  weekendStudyQueryKeys,
  type WeekendStudyPersonalRequest,
} from "@entities/weekend-study";
import { toast } from "@shared/ui";
import { getWeekendStudyErrorMessage } from "../lib/error";

const notifyApplyError = (error: unknown) => {
  const message = getWeekendStudyErrorMessage(
    error,
    "주말 자습 신청에 실패했어요.",
  );
  if (!message) return;

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
