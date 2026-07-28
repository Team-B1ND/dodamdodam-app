import { useSuspenseQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "@entities/team/api/queryKeys";
import { MOCK_ALL_TEAMS, MOCK_MY_TEAMS } from "@entities/team/api/mock";
import type { Team } from "@entities/team/types";

// TODO: 서버 API 준비되면 teamApi.getAll()/getMy() 호출로 교체
const fetchAllTeams = async (): Promise<Team[]> => MOCK_ALL_TEAMS;
const fetchMyTeams = async (): Promise<Team[]> => MOCK_MY_TEAMS;

export const useAllTeamsSuspense = (): Team[] => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.all,
    queryFn: fetchAllTeams,
  });
  return data;
};

export const useMyTeamsSuspense = (): Team[] => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.my,
    queryFn: fetchMyTeams,
  });
  return data;
};
