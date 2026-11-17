import React, { useCallback } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { SquircleView } from "react-native-figma-squircle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { UNFOLDED_MIN_SIDE, VERTICAL_COLUMN_WIDTH } from "@shared/config";
import type { TabBarPosition } from "@shared/hooks";
import {
  INDICATOR_SIZE,
  BAR_THICKNESS,
  BORDER_RADIUS,
  MARGIN_HORIZONTAL,
  MARGIN_BOTTOM,
  VERTICAL_TAB_SIZE,
  CAMERA_BOTTOM_CLEARANCE,
} from "./constants";
import { useBottomTabBar } from "./useBottomTabBar";
import { TabItem } from "./TabItem";

interface Props extends BottomTabBarProps {
  position?: TabBarPosition;
}

export const BottomTabBar = ({
  state,
  descriptors,
  navigation,
  position = "bottom",
}: Props) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const vertical = position === "right";
  const cameraAtBottom = vertical && width > height && Math.min(width, height) < UNFOLDED_MIN_SIDE;

  const onTabChange = useCallback(
    (index: number) => {
      const route = state.routes[index];
      if (route) {
        navigation.navigate(route.name, route.params);
      }
    },
    [state.routes, navigation],
  );

  const { onBarLayout, indicatorStyle, panGesture, translate, barLength } =
    useBottomTabBar({
      tabCount: state.routes.length,
      activeIndex: state.index,
      vertical,
      onTabChange,
    });

  const bottomPadding = cameraAtBottom
    ? CAMERA_BOTTOM_CLEARANCE
    : Math.max(insets.bottom, MARGIN_BOTTOM);

  return (
    <View
      style={
        vertical
          ? [
              styles.outerVertical,
              {
                width: Math.max(insets.right, VERTICAL_COLUMN_WIDTH),
                paddingBottom: bottomPadding,
                backgroundColor: colors.background.default,
              },
            ]
          : [styles.outer, { paddingBottom: bottomPadding }]
      }
    >
      <GestureDetector gesture={panGesture}>
        <View
          style={[
            vertical
              ? { width: BAR_THICKNESS, height: state.routes.length * VERTICAL_TAB_SIZE }
              : styles.bar,
            { backgroundColor: colors.background.surface, borderRadius: BORDER_RADIUS },
          ]}
          onLayout={onBarLayout}
        >
          <Animated.View
            style={[
              vertical ? styles.indicatorVertical : styles.indicator,
              indicatorStyle,
            ]}
          >
            <SquircleView
              style={styles.indicatorShape}
              squircleParams={{
                cornerRadius: 12,
                cornerSmoothing: 0.8,
                fillColor: colors.brand.primary,
              }}
            />
          </Animated.View>

          {state.routes.map((route, index) => (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              tabCount={state.routes.length}
              descriptors={descriptors}
              navigation={navigation}
              isFocused={state.index === index}
              vertical={vertical}
              translate={translate}
              barLength={barLength}
            />
          ))}
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  outerVertical: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: BAR_THICKNESS,
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: (BAR_THICKNESS - INDICATOR_SIZE) / 2,
  },
  indicatorVertical: {
    position: "absolute",
    top: 0,
    left: (BAR_THICKNESS - INDICATOR_SIZE) / 2,
  },
  indicatorShape: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
  },
});
