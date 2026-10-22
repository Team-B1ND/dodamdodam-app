import { useWindowDimensions } from "react-native";
import { WIDE_SCREEN_MIN_SIDE } from "@shared/config";

export type TabBarPosition = "bottom" | "right";

export const useTabBarPosition = (): TabBarPosition => {
  const { width, height } = useWindowDimensions();
  return Math.min(width, height) >= WIDE_SCREEN_MIN_SIDE ? "right" : "bottom";
};

const BOTTOM_TAB_SCROLL_PADDING = 140;
const SIDE_TAB_SCROLL_PADDING = 24;

export const useTabScrollPadding = () =>
  useTabBarPosition() === "bottom" ? BOTTOM_TAB_SCROLL_PADDING : SIDE_TAB_SCROLL_PADDING;
