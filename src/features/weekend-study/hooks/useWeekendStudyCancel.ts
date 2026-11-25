import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { weekendStudyApi, weekendStudyQueryKeys } from "@entities/weekend-study";
import { toast } from "@shared/ui";

const notifyCancelError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    toast.error("주말 자습 신청 취소에 실패했어요.", { position: "top" });
    return;
  }

  // 네트워크 오류, 5xx, 401은 공통 인터셉터에서 처리하므로 중복 토스트를 띄우지 않는다.
  const status = error.response?.status;
  if (!status || status === 401 || status >= 500) return;

  const message =
    error.response?.data?.message || "주말 자습 신청 취소에 실패했어요.";
  toast.error(message, { position: "top" });
};

export const useWeekendStudyCancel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => weekendStudyApi.cancel(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: weekendStudyQueryKeys.myPersonal,
        }),
        queryClient.invalidateQueries({
          queryKey: weekendStudyQueryKeys.myProject,
        }),
      ]);
      toast.success("주말 자습 신청을 취소했어요.", { position: "top" });
    },
    onError: (error) => {
      notifyCancelError(error);

      if (
        axios.isAxiosError(error) &&
        error.response?.data?.code === "NOT_APPLICATION_TIME"
      ) {
        void queryClient.invalidateQueries({
          queryKey: weekendStudyQueryKeys.deadline,
        });
      }
    },
  });
};
