import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImagePickerAsset } from "expo-image-picker";
import { teamApi } from "@entities/team";
import { fileApi } from "@entities/file/api";
import { toast } from "@shared/ui";
import type { StudentMember } from "@features/night-study";

export interface CreateTeamForm {
  name: string;
  description: string;
  members: StudentMember[];
}

const findCreatedTeamId = async (name: string): Promise<string | undefined> => {
  const { data } = await teamApi.getMy();
  return data.data?.content.find((team) => team.name === name)?.publicId;
};

export const useCreateTeam = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (asset: ImagePickerAsset) => {
      const { data } = await fileApi.upload(
        asset.uri,
        asset.fileName ?? "team.jpg",
        asset.mimeType ?? "image/jpeg",
      );
      return data.data;
    },
    onSuccess: (result) => setUploadedImageUrl(result.url),
    onError: () => toast.error("이미지 업로드에 실패했어요", { position: "top" }),
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, description, members }: CreateTeamForm) => {
      const { data } = await teamApi.create({
        name,
        description,
        imageUrl: uploadedImageUrl,
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

  const uploadImage = useCallback(
    (asset: ImagePickerAsset) => uploadMutation.mutate(asset),
    [uploadMutation],
  );

  const submit = useCallback(
    (form: CreateTeamForm) => createMutation.mutate(form),
    [createMutation],
  );

  return {
    uploadedImageUrl,
    uploadImage,
    submit,
    isSubmitting: uploadMutation.isPending || createMutation.isPending,
  };
};