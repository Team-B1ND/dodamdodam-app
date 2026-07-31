import { Image, Pressable, StyleSheet } from "react-native";
import { MonoIcons } from "@shared/icons";
import { useTheme } from "@shared/theme";
import { useImagePick } from "../hooks/useImagePick";
import type { TeamImagePickerProps } from "../types";

export const TeamImagePicker = ({
  value,
  onChange,
}: TeamImagePickerProps) => {
  const { colors } = useTheme();
  const pickImage = useImagePick(onChange);

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
      {value ? (
        <Image source={{ uri: value.uri }} style={styles.image} />
      ) : (
        <MonoIcons.Photo
          size={32}
          color={colors.text.tertiary}
        />
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