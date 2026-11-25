import React from "react";
import { Pressable, View, StyleSheet, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "@shared/theme";
import { usePressAnimation } from "@shared/hooks";

interface RadioProps {
  selected: boolean;
  onPress?: () => void;
  disabled?: boolean;
  radioCustomStyle?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Radio = ({ selected, onPress, disabled = false, radioCustomStyle = {} }: RadioProps) => {
  const { colors } = useTheme();
  const { animatedStyle, handlePressIn, handlePressOut } = usePressAnimation({
    scale: 0.9,
    disabled,
  });

  return (
    <AnimatedPressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, { opacity: disabled ? 0.4 : 1 }, animatedStyle, radioCustomStyle]}
    >
      <View
        style={[
          styles.ring,
          { borderColor: selected ? colors.brand.primary : colors.border.normal },
        ]}
      >
        {selected && <View style={[styles.dot, { backgroundColor: colors.brand.primary }]} />}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export type { RadioProps };
