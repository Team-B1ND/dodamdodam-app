import React, { forwardRef, useCallback } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { Radio } from "@shared/ui";
import type { Gender } from "@entities/auth/types";
import { GENDER_OPTIONS } from "./gender";

interface GenderSheetProps {
  value: Gender | null;
  onSelect: (gender: Gender) => void;
  onOpenChange?: (open: boolean) => void;
}

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
        backgroundStyle={[styles.background, { backgroundColor: colors.background.surface }]}
        handleIndicatorStyle={[styles.indicator, { backgroundColor: colors.fill.secondary }]}
      >
        <BottomSheetView style={styles.content}>
          <Text style={[styles.title, { color: colors.text.primary }]}>성별</Text>
          {GENDER_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: value === option.value }}
              style={styles.option}
              onPress={() => select(option.value)}
            >
              <Radio selected={value === option.value} onPress={() => select(option.value)} />
              <Text style={[styles.optionText, { color: colors.text.primary }]}>{option.label}</Text>
            </Pressable>
          ))}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  indicator: {
    width: 64,
    height: 5,
    borderRadius: 2.5,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 48,
  },
  title: {
    ...typo("Headline", "Bold"),
    marginBottom: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  optionText: {
    ...typo("Body1", "Medium"),
  },
});
