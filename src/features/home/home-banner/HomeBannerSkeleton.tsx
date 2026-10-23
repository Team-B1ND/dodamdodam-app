import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { useTabBarPosition, useTabContentWidth } from "@shared/hooks";
import { CORNER_RADIUS, HORIZONTAL_PADDING, getBannerHeight } from "./constants/constants";

export const HomeBannerSkeleton = () => {
  const { colors } = useTheme();
  const width = useTabContentWidth();
  const height = getBannerHeight(width - HORIZONTAL_PADDING * 2, useTabBarPosition() === "right");

  return (
    <View style={styles.container}>
      <View style={[styles.banner, { height, backgroundColor: colors.background.surface }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
  },
  banner: {
    borderRadius: CORNER_RADIUS,
    borderCurve: "continuous",
  },
});
