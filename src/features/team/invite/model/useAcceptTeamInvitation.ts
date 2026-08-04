import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi, teamQueryKeys } from "@entities/team";
import { toast } from "@shared/ui";

export const useAcceptTeamInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicId: string) => {
      await teamApi.acceptInvitation(publicId);
      return publicId;
    },

    onSuccess: async (publicId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamQueryKeys.invite,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueryKeys.my,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueryKeys.detail(publicId),
          refetchType: "none",
        }),
      ]);

      toast.success("팀 초대를 수락했어요", {
        position: "top",
      });
    },

    onError: () => {
      toast.error("팀 초대 수락에 실패했어요", {
        position: "top",
      });
    },
  });
};
