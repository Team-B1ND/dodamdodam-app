import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi, teamQueryKeys } from "@entities/team";
import { toast } from "@shared/ui";

export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicId: string) => {
      await teamApi.leaveTeam(publicId);
      return publicId;
    },

    onSuccess: async (publicId) => {
      queryClient.removeQueries({
        queryKey: teamQueryKeys.detail(publicId),
      });

      await queryClient.invalidateQueries({
        queryKey: teamQueryKeys.my,
      });

      toast.success("팀에서 탈퇴했어요", {
        position: "top",
      });
    },

    onError: () => {
      toast.error("팀 탈퇴에 실패했어요", {
        position: "top",
      });
    },
  });
};