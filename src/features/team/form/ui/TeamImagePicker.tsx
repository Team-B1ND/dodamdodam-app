import { useCallback } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import { MonoIcons } from "@shared/icons";
import { useTheme } from "@shared/theme";
import { useImagePick } from "../model/useImagePick";
import type { TeamImagePickerProps } from "../model/types";

export const TeamImagePicker = ({
  value,
  onChange,
}: TeamImagePickerProps) => {
  const { colors } = useTheme();
  const handlePicked = useCallback(
    (asset: ImagePickerAsset) => onChange({ type: "local", asset }),
    [onChange],
  );
  const pickImage = useImagePick(handlePicked);
  const imageUri =
    value?.type === "remote"
      ? value.url
      : value?.type === "local"
        ? value.asset.uri
        : null;

  return (
    <Pressable
      onPress={pickImage}
      style={[
        styles.container,
        {
          backgroundColor: colors.fill.primary,
          borderColor: colors.border.normal,
        },
      ]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <MonoIcons.Photo size={32} color={colors.text.tertiary} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 92,
    height: 92,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
