import React from "react";
import { Image, Pressable } from "react-native";
import type { BannerItem } from "./HomeBanner";

interface BannerImageProps {
  item: BannerItem;
  width: number;
  height: number;
  onPress?: () => void;
}

export const BannerImage = React.memo(({ item, width, height, onPress }: BannerImageProps) => (
  <Pressable onPress={onPress}>
    <Image
      source={{ uri: item.imageUrl }}
      style={{ width, height }}
      resizeMode="cover"
    />
  </Pressable>
));
