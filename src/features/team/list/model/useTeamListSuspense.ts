import { useSuspenseQuery } from "@tanstack/react-query";
import { teamApi, teamQueryKeys, type Team } from "@entities/team";

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
