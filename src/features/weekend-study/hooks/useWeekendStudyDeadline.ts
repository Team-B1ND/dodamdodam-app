import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { weekendStudyApi } from "@entities/weekend-study/api";
import { weekendStudyQueryKeys } from "@entities/weekend-study/api/queryKeys";
import type { WeekendStudyDeadline } from "@entities/weekend-study/types";
import {
  getMsUntilNextDeadlineTransition,
  isWithinDeadline,
} from "../lib/deadline";
import { shouldRetryWeekendStudyQuery } from "../lib/error";

const fetchDeadline = async (): Promise<WeekendStudyDeadline | null> => {
  const { data } = await weekendStudyApi.getDeadline();
  return data?.data ?? null;
};

export const useWeekendStudyDeadline = () => {
  const query = useQuery({
    queryKey: weekendStudyQueryKeys.deadline,
    queryFn: fetchDeadline,
    retry: shouldRetryWeekendStudyQuery,
  });
  const [now, setNow] = useState(() => new Date());

  const deadline = query.data ?? null;

  // 신청 시작·마감 경계를 지날 때 열림 상태를 다시 계산한다.
  useEffect(() => {
    if (!deadline) return;

    const delay = getMsUntilNextDeadlineTransition(deadline, new Date());
    if (!Number.isFinite(delay) || delay <= 0) return;

    const timer = setTimeout(() => {
      setNow(new Date());
    }, delay);

    return () => clearTimeout(timer);
  }, [deadline, now]);

  // 백그라운드 복귀 시 경과한 시각을 반영한다.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setNow(new Date());
      }
    });

    return () => subscription.remove();
  }, []);

  const referenceNow =
    query.dataUpdatedAt > now.getTime() ? new Date(query.dataUpdatedAt) : now;

  // 마감 조회 성공 전(로딩·오류)에는 신청·취소 액션을 열지 않는다.
  const isResolved = query.isSuccess;
  const isOpen = isResolved ? isWithinDeadline(deadline, referenceNow) : false;
  const isClosed = isResolved && !isOpen;

  return {
    ...query,
    deadline,
    isOpen,
    isClosed,
  };
};
