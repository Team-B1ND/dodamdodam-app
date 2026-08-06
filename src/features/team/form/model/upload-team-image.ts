import { fileApi } from "@entities/file/api";
import type { TeamFormImage } from "./types";

export const uploadTeamImage = async (
  image: TeamFormImage,
): Promise<string | null> => {
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
