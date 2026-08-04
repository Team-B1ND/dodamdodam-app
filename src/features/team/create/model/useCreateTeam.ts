import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "@entities/team";
import { toast } from "@shared/ui";
import type { StudentMember } from "@features/night-study";
import { uploadTeamImage, type TeamFormImage } from "@features/team/form";

export interface CreateTeamForm {
  name: string;
  description: string;
  image: TeamFormImage;
  members: StudentMember[];
}

const findCreatedTeamId = async (name: string): Promise<string | undefined> => {
  const { data } = await teamApi.getMy();
  return data.data?.content.find((team) => team.name === name)?.publicId;
};

export const useCreateTeam = (onSuccess: () => void) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ name, description, image, members }: CreateTeamForm) => {
      const imageUrl = await uploadTeamImage(image);
      const { data } = await teamApi.create({
        name,
        description,
        imageUrl,
      });

      if (members.length === 0) return { invited: true };

      const publicId = data.data?.publicId ?? (await findCreatedTeamId(name));
      if (!publicId) return { invited: false };

      const invited = await teamApi
        .inviteTeam(publicId, members.map((member) => member.id))
        .then(() => true)
        .catch(() => false);
      return { invited };
    },
    onSuccess: ({ invited }) => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      if (invited) {
        toast.success("팀이 생성되었어요", { position: "top" });
      } else {
        toast.warning("팀은 생성됐지만 멤버 초대에 실패했어요", { position: "top" });
      }
      onSuccess();
    },
    onError: () => toast.error("팀 생성에 실패했어요", { position: "top" }),
  });

  const submit = useCallback(
    (form: CreateTeamForm) => createMutation.mutate(form),
    [createMutation],
  );

  return {
    submit,
    isSubmitting: createMutation.isPending,
  };
};
