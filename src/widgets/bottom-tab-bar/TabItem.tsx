import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { useTheme } from "@shared/theme";
import { ICON_SIZE, INDICATOR_SIZE, OVERLAP_THRESHOLD } from "./constants";

type TabDescriptors = BottomTabBarProps["descriptors"];
type TabNavigation = BottomTabBarProps["navigation"];
type TabRoute = BottomTabBarProps["state"]["routes"][number];

interface TabItemProps {
  route: TabRoute;
  index: number;
  tabCount: number;
  descriptors: TabDescriptors;
  navigation: TabNavigation;
  isFocused: boolean;
  vertical: boolean;
  translate: SharedValue<number>;
  barLength: SharedValue<number>;
}

export const TabItem = React.memo(({
  route,
  index,
  tabCount,
  descriptors,
  navigation,
  isFocused,
  vertical,
  translate,
  barLength,
}: TabItemProps) => {
  const { colors } = useTheme();
  const { options } = descriptors[route.key];

  const onPress = useCallback(() => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  }, [isFocused, navigation, route]);

  const onLongPress = useCallback(() => {
    navigation.emit({
      type: "tabLongPress",
      target: route.key,
    });
  }, [navigation, route.key]);

  const selectedOverlayStyle = useAnimatedStyle(() => {
    if (barLength.value === 0) return { opacity: isFocused ? 1 : 0 };

    const tabSize = barLength.value / tabCount;
    const tabStart = index * tabSize;
    const tabEnd = tabStart + tabSize;
    const indicatorStart = translate.value;
    const indicatorEnd = indicatorStart + INDICATOR_SIZE;

    const overlapStart = Math.max(indicatorStart, tabStart);
    const overlapEnd = Math.min(indicatorEnd, tabEnd);
    const overlap = Math.max(0, overlapEnd - overlapStart);

    return {
      opacity: overlap >= INDICATOR_SIZE * OVERLAP_THRESHOLD ? 1 : 0,
    };
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      style={vertical ? tabStyles.verticalContainer : tabStyles.container}
    >
      <View>
        {options.tabBarIcon?.({
          focused: false,
          color: colors.text.tertiary,
          size: ICON_SIZE,
        })}
        <Animated.View style={[tabStyles.selectedOverlay, selectedOverlayStyle]}>
          {options.tabBarIcon?.({
            focused: true,
            color: colors.static.white,
            size: ICON_SIZE,
          })}
        </Animated.View>
      </View>
    </Pressable>
  );
});

const tabStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  verticalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
