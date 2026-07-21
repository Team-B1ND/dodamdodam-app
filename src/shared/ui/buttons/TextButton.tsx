import React, { useCallback } from "react";
import { Pressable, Text, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from "react-native-reanimated";
import { useTheme } from "@shared/theme";
import { typo, shapes } from "@shared/tokens";
import { usePressAnimation, useHaptic } from "@shared/hooks";
import type { HapticType } from "@shared/hooks";

type ButtonSize = "large" | "medium" | "small";
type ButtonDisplay = "inline" | "fill";

interface TextButtonProps {
  size?: ButtonSize;
  display?: ButtonDisplay;
  disabled?: boolean;
  haptic?: HapticType | false;
  onPress?: () => void;
  buttonCustomStyle?: ViewStyle;
  children?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case "large":
      return { paddingHorizontal: 28, minHeight: 48, borderRadius: shapes.medium, typoStyle: typo("Body1", "Medium") };
    case "medium":
      return { paddingHorizontal: 20, minHeight: 40, borderRadius: shapes.small, typoStyle: typo("Body2", "Medium") };
    case "small":
      return { paddingHorizontal: 12, minHeight: 32, borderRadius: shapes.extraSmall, typoStyle: typo("Caption2", "Bold") };
  }
};

export const TextButton = ({
  size = "medium",
  display = "inline",
  disabled = false,
  haptic = "light",
  onPress,
  buttonCustomStyle = {},
  children,
}: TextButtonProps) => {
  const { colors } = useTheme();
  const { animatedStyle, handlePressIn: pressIn, handlePressOut: pressOut } = usePressAnimation({ disabled });
  const triggerHaptic = useHaptic(haptic || "light");
  const sizeStyle = getSizeStyles(size);
  const bgProgress = useSharedValue(0);

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      ["transparent", colors.fill.secondary]
    ),
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      bgProgress.value = withTiming(1, { duration: 100, easing: Easing.linear });
    }
    pressIn();
  }, [disabled, bgProgress, pressIn]);

  const handlePressOut = useCallback(() => {
    bgProgress.value = withTiming(0, { duration: 100, easing: Easing.linear });
    pressOut();
  }, [bgProgress, pressOut]);

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : () => { if (haptic !== false) triggerHaptic(); onPress?.(); }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.container,
        {
          paddingHorizontal: sizeStyle.paddingHorizontal,
          minHeight: sizeStyle.minHeight,
          borderRadius: sizeStyle.borderRadius,
          opacity: disabled ? 0.5 : 1,
        },
        display === "fill" ? styles.fill : undefined,
        bgAnimatedStyle,
        animatedStyle,
        buttonCustomStyle,
      ]}
    >
      <Text style={[sizeStyle.typoStyle, { color: colors.text.secondary }]}>
        {children}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fill: {
    flex: 1,
    minWidth: 0,
  },
});

export type { TextButtonProps, ButtonDisplay };
