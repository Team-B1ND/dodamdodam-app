import { useState, useCallback } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { nightStudyApi } from "@entities/night-study/api";
import { nightStudyQueryKeys } from "@entities/night-study/api/queryKeys";
import { toast } from "@shared/ui";
import { formatDateParam } from "@features/out-sleeping";
import type { TimeSlot } from "../form/TimeSlotPicker";
import type { StudentMember } from "./useNightStudyForm";

const PERIOD_MAP: Record<TimeSlot, number> = {
  NIGHT1: 1,
  NIGHT2: 2,
};

// 서버가 내려주는 심야 자습 신청 실패 코드. 서버 메시지를 그대로 쓰지 않고
// 앱 말투에 맞춰 다시 쓴다.
const APPLY_ERROR_MESSAGE: Record<string, string> = {
  PERIOD_OVERLAPPED: "이미 해당 기간에 신청한 심야 자습이 있어요.",
  NOT_APPLICATION_TIME: "지금은 심자 신청 기간이 아니에요.",
  INVALID_START_AT: "시작 날짜가 오늘보다 과거일 수 없어요.",
  INVALID_NIGHT_STUDY_TYPE: "심야 자습은 1교시 또는 2교시만 신청할 수 있어요.",
  NIGHT_STUDY_BANNED: "심야 자습이 정지된 인원이 있어요.",
};

// 매핑되지 않은 코드까지 조용히 넘어가면 사용자가 실패 사실조차 알 수 없다.
// 서버 응답 메시지, 그마저 없으면 기본 문구까지 단계적으로 폴백한다.
const notifyApplyError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return;

  // 네트워크 오류와 5xx는 인터셉터가 이미 토스트를 띄우고,
  // 401은 세션 만료 처리로 로그인 화면에 넘어가므로 토스트가 불필요하다.
  const status = error.response?.status;
  if (!status || status === 401 || status >= 500) return;

  const code = error.response?.data?.code;
  const message =
    (code && APPLY_ERROR_MESSAGE[code]) ||
    error.response?.data?.message ||
    "심야 자습 신청에 실패했어요.";

  toast.warning(message, { position: "top" });
};

interface PersonalApplyParams {
  reason: string;
  timeSlot: TimeSlot;
  startDate: Date;
  endDate: Date;
  usePhone: boolean;
  phoneReason: string;
}

interface ProjectApplyParams {
  projectName: string;
  projectDescription: string;
  timeSlot: TimeSlot;
  startDate: Date;
  endDate: Date;
  members: StudentMember[];
  wishRoomId?: number;
}

export const useNightStudyPersonalApply = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const apply = useCallback(
    async (params: PersonalApplyParams): Promise<boolean> => {
      if (!params.reason.trim()) {
        toast.error("심야 자습 사유를 입력해주세요.", { position: "top" });
        return false;
      }

      if (params.startDate > params.endDate) {
        toast.warning("시작 날짜가 종료 날짜보다 늦을 수 없어요.", { position: "top" });
        return false;
      }

      setLoading(true);
      try {
        await nightStudyApi.createPersonal({
          description: params.reason,
          period: PERIOD_MAP[params.timeSlot],
          startAt: formatDateParam(params.startDate),
          endAt: formatDateParam(params.endDate),
          needPhone: params.usePhone,
          needPhoneReason: params.usePhone ? params.phoneReason : "",
        });
        await queryClient.invalidateQueries({ queryKey: nightStudyQueryKeys.myPersonal });
        toast.success("심야 자습 신청이 완료되었어요.", { position: "top" });
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

export const useNightStudyProjectApply = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const apply = useCallback(
    async (params: ProjectApplyParams): Promise<boolean> => {
      if (!params.projectName.trim() || !params.projectDescription.trim()) {
        toast.error("프로젝트명과 개요를 모두 입력해주세요.", { position: "top" });
        return false;
      }

      if (params.members.length === 0) {
        toast.error("학생을 1명 이상 추가해주세요.", { position: "top" });
        return false;
      }

      if (params.startDate > params.endDate) {
        toast.warning("시작 날짜가 종료 날짜보다 늦을 수 없어요.", { position: "top" });
        return false;
      }

      setLoading(true);
      try {
        await nightStudyApi.createProject({
          name: params.projectName,
          description: params.projectDescription,
          period: PERIOD_MAP[params.timeSlot],
          startAt: formatDateParam(params.startDate),
          endAt: formatDateParam(params.endDate),
          members: params.members.map((m) => m.id),
          // 희망 랩실은 선택 항목이라, 고르지 않았으면 필드를 보내지 않는다.
          ...(params.wishRoomId !== undefined && { wishRoomId: params.wishRoomId }),
        });
        await queryClient.invalidateQueries({ queryKey: nightStudyQueryKeys.myProject });
        toast.success("프로젝트 심야 자습 신청이 완료되었어요.", { position: "top" });
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