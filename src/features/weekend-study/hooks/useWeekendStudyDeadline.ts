import { useQuery } from "@tanstack/react-query";
import { weekendStudyApi } from "@entities/weekend-study/api";
import { weekendStudyQueryKeys } from "@entities/weekend-study/api/queryKeys";
import type { WeekendStudyDeadline } from "@entities/weekend-study/types";
import { isWithinDeadline } from "../lib/deadline";

const fetchDeadline = async (): Promise<WeekendStudyDeadline | null> => {
  const { data } = await weekendStudyApi.getDeadline();
  return data.data ?? null;
};

export const useWeekendStudyDeadline = () => {
  const query = useQuery({
    queryKey: weekendStudyQueryKeys.deadline,
    queryFn: fetchDeadline,
    retry: 1,
  });

  const deadline = query.data ?? null;
  const isOpen = isWithinDeadline(deadline);

  return {
    ...query,
    deadline,
    isOpen,
  };
};
