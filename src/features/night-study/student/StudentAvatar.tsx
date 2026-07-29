import React from "react";
import { Image, StyleSheet } from "react-native";
import { Avatar } from "@shared/ui";

interface StudentAvatarProps {
  size?: number;
  profileImage?: string | null;
}

export const StudentAvatar = ({
  size = 38,
  profileImage,
}: StudentAvatarProps) => {
  if (!profileImage) return <Avatar size={size} />;

  return (
    <Image
      source={{ uri: profileImage }}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
  },
});
