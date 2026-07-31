import { useSuspenseQuery } from "@tanstack/react-query";
import { teamApi, teamQueryKeys, type TeamDetail } from "@entities/team";

export const useTeamDetailSuspense = (teamId: string): TeamDetail | null => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.detail(teamId),
    queryFn: async () => (await teamApi.getDetail(teamId)).data.data ?? null,
  });
  return data;
};
