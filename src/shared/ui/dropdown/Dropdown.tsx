import React, { useCallback, memo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "@shared/theme";
import { useDropdownAnimation } from "@shared/hooks";
import { typo, shapes } from "@shared/tokens";
import { ChevronDown } from "@shared/icons/mono";

interface DropdownProps {
  items: string[];
  value: string;
  placeholder?: string;
  onSelectedItemChange: (item: string) => void;
  customStyle?: ViewStyle;
}

export const Dropdown = memo(({
  items,
  value,
  placeholder,
  onSelectedItemChange,
  customStyle,
}: DropdownProps) => {
  const { colors } = useTheme();
  const {
    isOpen,
    openDirection,
    triggerRef,
    handleToggle,
    closeDropdown,
    iconAnimatedStyle,
    optionAnimatedStyle,
  } = useDropdownAnimation();

  const handleItemPress = useCallback(
    (item: string) => {
      onSelectedItemChange(item);
      closeDropdown();
    },
    [onSelectedItemChange, closeDropdown]
  );

  return (
    <View style={[styles.wrapper, customStyle]}>
      <Pressable
        ref={triggerRef}
        onPress={handleToggle}
        style={[
          styles.container,
          {
            backgroundColor: colors.fill.primary,
            borderRadius: shapes.medium,
          },
        ]}
      >
        <Text
          style={[
            styles.valueText,
            { color: value ? colors.text.primary : colors.text.placeholder },
          ]}
        >
          {value || placeholder}
        </Text>
        <Animated.View style={iconAnimatedStyle}>
          <ChevronDown size={16} color={colors.text.primary} />
        </Animated.View>
      </Pressable>

      {isOpen && (
        <>
        <Pressable
          style={styles.backdrop}
          onPress={closeDropdown}
        />
        <Animated.View
          style={[
            styles.optionWrap,
            openDirection === "up" ? styles.optionUp : styles.optionDown,
            {
              backgroundColor: colors.fill.primary,
              borderRadius: shapes.medium,
            },
            optionAnimatedStyle,
          ]}
        >
          <ScrollView
            style={styles.optionScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <Pressable
                key={item}
                onPress={() => handleItemPress(item)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    borderRadius: shapes.small,
                    backgroundColor: pressed
                      ? colors.fill.secondary
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={[styles.optionText, { color: colors.text.secondary }]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
        </>
      )}
    </View>
  );
});

Dropdown.displayName = "Dropdown";

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignSelf: "flex-start",
    zIndex: 1000,
  },
  backdrop: {
    position: "absolute",
    top: -9999,
    bottom: -9999,
    left: -9999,
    right: -9999,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  valueText: {
    ...typo("Headline", "Medium"),
  },
  optionWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    padding: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    zIndex: 1000,
  },
  optionDown: {
    top: "100%",
    marginTop: 4,
  },
  optionUp: {
    bottom: "100%",
    marginBottom: 4,
  },
  optionScroll: {
    maxHeight: 200,
  },
  option: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  optionText: {
    ...typo("Headline", "Medium"),
  },
});

export type { DropdownProps };
