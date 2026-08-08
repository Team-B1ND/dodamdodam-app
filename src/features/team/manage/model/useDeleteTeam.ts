import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi, teamQueryKeys } from "@entities/team";
import { toast } from "@shared/ui";

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicId: string) => {
      await teamApi.deleteTeam(publicId);
      return publicId;
    },

    onSuccess: async (publicId) => {
      queryClient.removeQueries({
        queryKey: teamQueryKeys.detail(publicId),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueryKeys.my,
        }),
      ]);

      toast.success("팀이 삭제되었어요", {
        position: "top",
      });
    },

    onError: () => {
      toast.error("팀 삭제에 실패했어요", {
        position: "top",
      });
    },
  });
};