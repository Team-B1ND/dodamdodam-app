import { useState, useCallback } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { outSleepingApi } from "@entities/out-sleeping/api";
import { outSleepingQueryKeys } from "@entities/out-sleeping/api/queryKeys";
import { toast } from "@shared/ui";
import { formatDateParam } from "./utils/formatDate";
import type { OutSleepingReasonType } from "@entities/out-sleeping/types";

const APPLY_ERROR_MESSAGE: Record<string, string> = {
  OUT_SLEEPING_DEADLINE_EXCEEDED: "외박 신청 기간이 아니에요.",
};

const notifyApplyError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return;

  const status = error.response?.status;
  if (!status || status === 401 || status >= 500) return;

  const code = error.response?.data?.code;
  const message =
    (code && APPLY_ERROR_MESSAGE[code]) ||
    error.response?.data?.message ||
    "외박 신청에 실패했어요.";

  toast.warning(message, { position: "top" });
};

interface ApplyParams {
  reasonType: OutSleepingReasonType | null;
  reason: string;
  startDate: Date;
  endDate: Date;
}

export const useOutSleepingApply = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const apply = useCallback(
    async (params: ApplyParams): Promise<boolean> => {
      if (!params.reasonType) {
        toast.error("외박 사유를 선택해주세요.", { position: "top" });
        return false;
      }

      const isEtc = params.reasonType === "ETC";

      if (isEtc && !params.reason.trim()) {
        toast.error("외박 사유를 입력해주세요.", { position: "top" });
        return false;
      }

      if (params.startDate > params.endDate) {
        toast.warning("외출 날짜가 복귀 날짜보다 늦을 수 없어요.", { position: "top" });
        return false;
      }

      setLoading(true);
      try {
        await outSleepingApi.create({
          reasonType: params.reasonType,
          ...(isEtc && { reason: params.reason.trim() }),
          startAt: formatDateParam(params.startDate),
          endAt: formatDateParam(params.endDate),
        });
        await queryClient.invalidateQueries({ queryKey: outSleepingQueryKeys.me });
        toast.success("외박 신청이 완료되었어요.", { position: "top" });
        return true;
      } catch (error) {
        notifyApplyError(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [queryClient],
  );

  return { apply, loading };
};
