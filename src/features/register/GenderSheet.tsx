import React, { forwardRef, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { usePressAnimation } from "@shared/hooks";
import { Checkmark } from "@shared/icons/mono";
import type { Gender } from "@entities/auth/types";
import { GENDER_OPTIONS } from "./gender";

interface GenderSheetProps {
  value: Gender | null;
  onSelect: (gender: Gender) => void;
  onOpenChange?: (open: boolean) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GenderOption = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  const { colors } = useTheme();
  const { animatedStyle, brightnessOverlayStyle, handlePressIn, handlePressOut } =
    usePressAnimation();

  return (
    <AnimatedPressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={[styles.option, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.optionOverlay, brightnessOverlayStyle]} pointerEvents="none" />
      <Text
        style={[
          styles.optionText,
          { color: selected ? colors.text.primary : colors.text.placeholder },
        ]}
      >
        {label}
      </Text>
      {selected && <Checkmark size={16} color={colors.brand.primary} />}
    </AnimatedPressable>
  );
};

export const GenderSheet = forwardRef<BottomSheetModal, GenderSheetProps>(
  ({ value, onSelect, onOpenChange }, ref) => {
    const { colors } = useTheme();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior="close"
        />
      ),
      [],
    );

    const select = (gender: Gender) => {
      onSelect(gender);
      if (ref && typeof ref !== "function") ref.current?.dismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onChange={(index) => onOpenChange?.(index >= 0)}
        backgroundStyle={{ backgroundColor: colors.background.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.fill.secondary }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>성별</Text>
          <View style={styles.options}>
            {GENDER_OPTIONS.map((option) => (
              <GenderOption
                key={option.value}
                label={option.label}
                selected={value === option.value}
                onPress={() => select(option.value)}
              />
            ))}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 8,
  },
  sheetTitle: {
    ...typo("Heading2", "Bold"),
    padding: 8,
  },
  options: {
    gap: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  optionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    borderRadius: 8,
  },
  optionText: {
    ...typo("Headline", "Medium"),
  },
});
