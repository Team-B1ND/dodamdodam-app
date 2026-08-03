import React from "react";
import { Image } from "react-native";
import { Avatar } from "@shared/ui";

interface TeamAvatarProps {
  profileImage: string | null;
  size?: number;
}

export const TeamAvatar = ({ profileImage, size = 24 }: TeamAvatarProps) => {
  if (!profileImage) {
    return <Avatar size={size} />;
  }

  return (
    <Image
      source={{ uri: profileImage }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
};
