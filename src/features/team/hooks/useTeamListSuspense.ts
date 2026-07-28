import { useSuspenseQuery } from "@tanstack/react-query";
import { teamApi } from "@entities/team/api";
import { teamQueryKeys } from "@entities/team/api/queryKeys";
import type { Team } from "@entities/team/types";

export const useAllTeamsSuspense = (): Team[] => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.all,
    queryFn: async () => (await teamApi.getAll()).data.data ?? [],
  });
  return data;
};

export const useMyTeamsSuspense = (): Team[] => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.my,
    queryFn: async () => (await teamApi.getMy()).data.data ?? [],
  });
  return data;
};
