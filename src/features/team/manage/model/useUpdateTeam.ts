import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi, teamQueryKeys, type Team } from "@entities/team";
import { fileApi } from "@entities/file/api";
import type { StudentMember } from "@features/night-study";
import type { TeamFormImage } from "@features/team/form";
import { toast } from "@shared/ui";

export interface UpdateTeamForm {
  team: Team;
  name: string;
  description: string;
  image: TeamFormImage;
  members: StudentMember[];
}

interface UseUpdateTeamOptions {
  onSuccess?: (team: Team) => void;
}

const uploadImage = async (image: TeamFormImage): Promise<string | null> => {
  if (!image) return null;
  if (image.type === "remote") return image.url;

  const { asset } = image;
  const { data } = await fileApi.upload(
    asset.uri,
    asset.fileName ?? "team.jpg",
    asset.mimeType ?? "image/jpeg",
  );
  return data.data.url;
};

export const useUpdateTeam = ({ onSuccess }: UseUpdateTeamOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ team, name, description, image, members }: UpdateTeamForm) => {
      const imageUrl = await uploadImage(image);

      await teamApi.updateTeam({
        publicId: team.publicId,
        name,
        description,
        imageUrl,
      });

      let invited = true;
      if (members.length > 0) {
        invited = await teamApi
          .inviteTeam(team.publicId, members.map((member) => member.id))
          .then(() => true)
          .catch(() => false);
      }

      return {
        team: {
          publicId: team.publicId,
          name,
          description,
          imageUrl,
        },
        invited,
      };
    },

    onSuccess: async ({ team, invited }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.my }),
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(team.publicId) }),
      ]);

      if (invited) {
        toast.success("팀 정보가 수정되었어요", { position: "top" });
      } else {
        toast.warning("팀은 수정됐지만 멤버 초대에 실패했어요", { position: "top" });
      }
      onSuccess?.(team);
    },
    onError: () => {
      toast.error("팀 정보 수정에 실패했어요", { position: "top" });
    },
  });
};
