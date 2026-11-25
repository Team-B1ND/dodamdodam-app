import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { weekendStudyApi } from "@entities/weekend-study/api";
import { weekendStudyQueryKeys } from "@entities/weekend-study/api/queryKeys";
import type {
  WeekendStudyPersonal,
  WeekendStudyProject,
} from "@entities/weekend-study/types";
import { shouldRetryWeekendStudyQuery } from "../lib/error";

const sortByDateAsc = <T extends { date: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.date.localeCompare(b.date));

const fetchMyPersonal = async (): Promise<WeekendStudyPersonal[]> => {
  const { data } = await weekendStudyApi.getMyPersonal();
  return sortByDateAsc(data?.data ?? []);
};

const fetchMyProject = async (): Promise<WeekendStudyProject[]> => {
  const { data } = await weekendStudyApi.getMyProject();
  return sortByDateAsc(data?.data ?? []);
};

/** 목록 화면용 내 개별 주말 자습 Suspense 쿼리 */
export const useWeekendStudyList = (): WeekendStudyPersonal[] => {
  const { data } = useSuspenseQuery({
    queryKey: weekendStudyQueryKeys.myPersonal,
    queryFn: fetchMyPersonal,
    retry: shouldRetryWeekendStudyQuery,
  });
  return data;
};

/** 신청 화면 등에서 중복 교시 확인에 쓰는 내 개별 주말 자습 쿼리 */
export const useWeekendStudyMyPersonal = () =>
  useQuery({
    queryKey: weekendStudyQueryKeys.myPersonal,
    queryFn: fetchMyPersonal,
    retry: shouldRetryWeekendStudyQuery,
  });

/** 신청 화면 등에서 중복 교시 확인에 쓰는 내 실 대여(프로젝트) 쿼리 */
export const useWeekendStudyMyProject = () =>
  useQuery({
    queryKey: weekendStudyQueryKeys.myProject,
    queryFn: fetchMyProject,
    retry: shouldRetryWeekendStudyQuery,
  });
