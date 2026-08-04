import { useSuspenseQuery } from "@tanstack/react-query";
import { teamApi, teamQueryKeys, type Team } from "@entities/team";

const PAGE_SIZE = 20;

export const useAllTeamsSuspense = (): Team[] => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.all,
    queryFn: async () => (await teamApi.getAll(0, PAGE_SIZE)).data.data?.content ?? [],
  });
  return data;
};

export const useMyTeamsSuspense = (): Team[] => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.my,
    queryFn: async () => (await teamApi.getMy(0, PAGE_SIZE)).data.data?.content ?? [],
  });
  return data;
};
