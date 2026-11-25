import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { weekendStudyApi, weekendStudyQueryKeys } from "@entities/weekend-study";
import { toast } from "@shared/ui";
import { getWeekendStudyErrorMessage } from "../lib/error";

const notifyCancelError = (error: unknown) => {
  const message = getWeekendStudyErrorMessage(
    error,
    "주말 자습 신청 취소에 실패했어요.",
  );
  if (!message) return;

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
