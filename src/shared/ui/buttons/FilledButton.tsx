import React, { useCallback } from "react";
import { Pressable, Text, StyleSheet, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "@shared/theme";
import { typo, shapes } from "@shared/tokens";
import { usePressAnimation, useHaptic } from "@shared/hooks";
import type { HapticType } from "@shared/hooks";
import type { ColorTokens } from "@shared/tokens";

type ButtonSize = "large" | "medium" | "small";
type FilledButtonRole = "primary" | "negative" | "assistive";
type ButtonDisplay = "inline" | "fill";

interface FilledButtonProps {
  role?: FilledButtonRole;
  size?: ButtonSize;
  display?: ButtonDisplay;
  disabled?: boolean;
  isLoading?: boolean;
  haptic?: HapticType | false;
  onPress?: () => void;
  buttonCustomStyle?: ViewStyle;
  children?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case "large":
      return { paddingHorizontal: 28, height: 48, borderRadius: shapes.medium, typoStyle: typo("Body1", "Medium") };
    case "medium":
      return { paddingHorizontal: 20, height: 40, borderRadius: shapes.small, typoStyle: typo("Body2", "Medium") };
    case "small":
      return { paddingHorizontal: 12, height: 32, borderRadius: shapes.extraSmall, typoStyle: typo("Caption2", "Bold") };
  }
};

const getRoleStyles = (role: FilledButtonRole, colors: ColorTokens) => {
  switch (role) {
    case "primary":
      return { bg: colors.brand.primary, color: colors.static.white };
    case "negative":
      return { bg: colors.status.error, color: colors.static.white };
    case "assistive":
      return { bg: colors.fill.primary, color: colors.text.tertiary };
  }
};

export const FilledButton = ({
  role = "primary",
  size = "medium",
  display = "inline",
  disabled = false,
  isLoading = false,
  haptic = "light",
  onPress,
  buttonCustomStyle = {},
  children,
}: FilledButtonProps) => {
  const { colors } = useTheme();
  const isDisabled = disabled || isLoading;
  const { animatedStyle, brightnessOverlayStyle, handlePressIn, handlePressOut } =
    usePressAnimation({ disabled: isDisabled });
  const triggerHaptic = useHaptic(haptic || "light");
  const sizeStyle = getSizeStyles(size);
  const roleStyle = getRoleStyles(role, colors);

  const handlePress = useCallback(() => {
    if (haptic !== false) triggerHaptic();
    onPress?.();
  }, [haptic, triggerHaptic, onPress]);

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.container,
        {
          paddingHorizontal: sizeStyle.paddingHorizontal,
          height: sizeStyle.height,
          borderRadius: sizeStyle.borderRadius,
          backgroundColor: roleStyle.bg,
          opacity: isDisabled ? 0.5 : 1,
        },
        display === "fill" ? styles.fill : undefined,
        animatedStyle,
        buttonCustomStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.brightnessOverlay,
          { borderRadius: sizeStyle.borderRadius },
          brightnessOverlayStyle,
        ]}
        pointerEvents="none"
      />
      <Text style={[sizeStyle.typoStyle, { color: roleStyle.color }]}>
        {isLoading ? "···" : children}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fill: {
    alignSelf: "stretch",
  },
  brightnessOverlay: {
    backgroundColor: "#000",
  },
});

export type { FilledButtonProps, ButtonSize, FilledButtonRole, ButtonDisplay };
