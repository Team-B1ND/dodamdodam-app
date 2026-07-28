import { useSuspenseQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "@entities/team/api/queryKeys";
import { MOCK_TEAM_DETAILS } from "@entities/team/api/mock";
import type { TeamDetail } from "@entities/team/types";

// TODO: 서버 API 준비되면 teamApi.getDetail(teamId) 호출로 교체
const fetchTeamDetail = async (teamId: string): Promise<TeamDetail | null> =>
  MOCK_TEAM_DETAILS[teamId] ?? null;

export const useTeamDetailSuspense = (teamId: string): TeamDetail | null => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.detail(teamId),
    queryFn: () => fetchTeamDetail(teamId),
  });
  return data;
};
