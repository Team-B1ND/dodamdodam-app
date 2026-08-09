import { useSuspenseQuery } from "@tanstack/react-query";
import { teamApi, teamQueryKeys, type TeamMember } from "@entities/team";

export const useTeamMembersSuspense = (publicId: string): TeamMember[] => {
  const { data } = useSuspenseQuery({
    queryKey: teamQueryKeys.detail(publicId),
    queryFn: async () => (await teamApi.getMembers(publicId)).data.data ?? [],
  });
  return data;
};
