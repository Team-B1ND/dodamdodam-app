import { useSuspenseQuery } from "@tanstack/react-query";
import { teamApi } from "@entities/team/api";
import { teamQueryKeys } from "@entities/team/api/queryKeys";
import type { TeamDetail } from "@entities/team/types";

export const useTeamDetailSuspense = (teamId: string): TeamDetail | null => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.detail(teamId),
    queryFn: async () => (await teamApi.getDetail(teamId)).data.data ?? null,
  });
  return data;
};
