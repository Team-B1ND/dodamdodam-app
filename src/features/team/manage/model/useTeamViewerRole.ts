import { useSuspenseQuery } from "@tanstack/react-query";
import type { TeamMember } from "@entities/team";
import { userApi } from "@entities/user/api";
import { userQueryKeys } from "@entities/user/api/queryKeys";
import type { User } from "@entities/user/types";

export type TeamMemberRole = "leader" | "member" | "invited" | "guest";

export const getTeamViewerRole = (
  currentUserId: string,
  members: TeamMember[],
): TeamMemberRole => {
  const me = members.find((member) => member.userId === currentUserId);

  if (!me) return "guest";
  if (!me.isAccept) return "invited";
  return me.isOwner ? "leader" : "member";
};

const fetchMe = async (): Promise<User> => {
  const { data } = await userApi.getMe();
  return data.data;
};

export const useTeamViewerRole = (members: TeamMember[]): TeamMemberRole => {
  const { data: currentUser } = useSuspenseQuery({
    queryKey: userQueryKeys.me,
    queryFn: fetchMe,
  });

  return getTeamViewerRole(currentUser.publicId, members);
};
