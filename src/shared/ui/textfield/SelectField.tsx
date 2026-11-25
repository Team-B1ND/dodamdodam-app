import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { ChevronDown } from "@shared/icons/mono";
import { useTextField } from "./useTextField";

interface SelectFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  active?: boolean;
  onPress: () => void;
  disabled?: boolean;
  customStyle?: ViewStyle;
}

export const SelectField = ({
  label,
  value = "",
  placeholder,
  active = false,
  onPress,
  disabled = false,
  customStyle,
}: SelectFieldProps) => {
  const { colors } = useTheme();
  const { setIsFocused, labelAnimatedStyle, getBorderColor, getLabelColor } = useTextField({
    value,
    isError: false,
    disabled,
    colors,
  });

  useEffect(() => {
    setIsFocused(active);
  }, [active, setIsFocused]);

  const shownText = value || (active ? placeholder ?? "" : "");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={{ text: value || placeholder }}
      accessibilityState={{ disabled, expanded: active }}
      onPress={disabled ? undefined : onPress}
      style={[styles.container, customStyle]}
    >
      <View style={styles.inputRow}>
        <View style={[styles.input, { borderBottomColor: getBorderColor() }]}>
          <Text
            numberOfLines={1}
            style={[
              styles.value,
              { color: value ? colors.text.primary : colors.text.placeholder },
            ]}
          >
            {shownText}
          </Text>
        </View>
        <Animated.Text
          style={[styles.label, { color: getLabelColor() }, labelAnimatedStyle]}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>
        <View style={styles.iconWrapper} pointerEvents="none">
          <ChevronDown size={24} color={colors.text.tertiary} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputRow: {
    position: "relative",
    height: 51,
    paddingVertical: 4,
    justifyContent: "flex-end",
  },
  input: {
    width: "100%",
    height: 45,
    borderBottomWidth: 1.5,
    paddingRight: 32,
    justifyContent: "center",
  },
  value: {
    ...typo("Headline", "Medium"),
    lineHeight: undefined,
  },
  label: {
    position: "absolute",
    left: 0,
    bottom: 16,
    ...typo("Headline", "Medium"),
  },
  iconWrapper: {
    position: "absolute",
    right: 0,
    bottom: 14,
  },
});

export type { SelectFieldProps };
