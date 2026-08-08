import React from "react";
import { Image } from "react-native";
import { Avatar } from "@shared/ui";

interface TeamAvatarProps {
  imageUrl: string | null;
  size?: number;
}

export const TeamAvatar = ({ imageUrl, size = 24 }: TeamAvatarProps) => {
  if (!imageUrl) {
    return <Avatar size={size} />;
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
};
