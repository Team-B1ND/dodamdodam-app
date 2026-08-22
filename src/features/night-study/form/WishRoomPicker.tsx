import React, { useRef, useCallback } from "react";
import { View, Text, Pressable, Keyboard, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { usePressAnimation } from "@shared/hooks";
import { Checkmark, ChevronUp, ChevronDown } from "@shared/icons/mono";
import { useNightStudyRooms } from "../hooks/useNightStudyRooms";
import type { NightStudyRoom } from "@entities/night-study/types";

interface WishRoomPickerProps {
  value: NightStudyRoom | null;
  onChange: (room: NightStudyRoom | null) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const RoomOption = ({
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

export const WishRoomPicker = ({ value, onChange }: WishRoomPickerProps) => {
  const { colors } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { rooms, loading } = useNightStudyRooms();

  const handleOpen = useCallback(() => {
    Keyboard.dismiss();
    sheetRef.current?.present();
  }, []);

  const handleSelect = useCallback(
    (room: NightStudyRoom | null) => {
      onChange(room);
      sheetRef.current?.dismiss();
    },
    [onChange],
  );

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

  const displayLabel = value ? value.name : loading ? "불러오는 중" : "선택 안 함";

  return (
    <>
      <Pressable style={styles.row} onPress={handleOpen}>
        <Text style={[styles.label, { color: colors.text.tertiary }]}>
          희망 랩실
        </Text>
        <View style={styles.value}>
          <Text
            style={[
              styles.valueText,
              { color: value ? colors.brand.primary : colors.text.placeholder },
            ]}
          >
            {displayLabel}
          </Text>
          <View style={styles.chevrons}>
            <ChevronUp size={10} color={colors.brand.primary} />
            <ChevronDown size={10} color={colors.brand.primary} />
          </View>
        </View>
      </Pressable>

      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.fill.secondary }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>
            희망 랩실
          </Text>
          <View style={styles.options}>
            <RoomOption
              label="선택 안 함"
              selected={value === null}
              onPress={() => handleSelect(null)}
            />
            {rooms.map((room) => (
              <RoomOption
                key={room.id}
                label={room.name}
                selected={value?.id === room.id}
                onPress={() => handleSelect(room)}
              />
            ))}
          </View>
          {!loading && rooms.length === 0 && (
            <Text style={[styles.empty, { color: colors.text.tertiary }]}>
              선택할 수 있는 랩실이 없어요.
            </Text>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    ...typo("Headline", "Medium"),
  },
  value: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  valueText: {
    ...typo("Headline", "Regular"),
  },
  chevrons: {
    flexDirection: "column",
    alignItems: "center",
    gap: -4,
  },
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
  empty: {
    ...typo("Body2", "Regular"),
    padding: 8,
  },
});
