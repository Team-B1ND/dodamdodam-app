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
        if (axios.isAxiosError(error)) {
          const code = error.response?.data?.code;
          if (code === "PERIOD_OVERLAPPED") {
            toast.warning("이미 해당 기간에 신청한 심야 자습이 있어요.", { position: "top" });
          } else if (code === "NOT_APPLICATION_TIME") {
            toast.error("지금은 심자 신청 기간이 아니에요.", { position: "top" });
          }
        }
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
        if (axios.isAxiosError(error)) {
          const code = error.response?.data?.code;
          if (code === "PERIOD_OVERLAPPED") {
            toast.warning("이미 해당 기간에 신청한 심야 자습이 있어요.", { position: "top" });
          } else if (code === "NOT_APPLICATION_TIME") {
            toast.error("지금은 심자 신청 기간이 아니에요.", { position: "top" });
          }
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [queryClient],
  );

  return { apply, loading };
};