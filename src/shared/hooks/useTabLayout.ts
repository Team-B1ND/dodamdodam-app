import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets, type Edge } from "react-native-safe-area-context";
import {
  UNFOLDED_LEFT_PADDING,
  UNFOLDED_MIN_SIDE,
  VERTICAL_COLUMN_WIDTH,
  WIDE_SCREEN_MIN_SIDE,
} from "@shared/config";

export type TabBarPosition = "bottom" | "right";

const getTabBarPosition = (width: number, height: number): TabBarPosition =>
  Math.min(width, height) >= WIDE_SCREEN_MIN_SIDE ? "right" : "bottom";

const getUnfoldedLeftPadding = (width: number, height: number) =>
  Math.min(width, height) >= UNFOLDED_MIN_SIDE ? UNFOLDED_LEFT_PADDING : 0;

export const useTabBarPosition = (): TabBarPosition => {
  const { width, height } = useWindowDimensions();
  return getTabBarPosition(width, height);
};

export const useUnfoldedLeftPadding = () => {
  const { width, height } = useWindowDimensions();
  return getUnfoldedLeftPadding(width, height);
};

export const useTabContentWidth = () => {
  const { width, height } = useWindowDimensions();
  const { left, right } = useSafeAreaInsets();
  const sideInsets =
    getTabBarPosition(width, height) === "right" ? left + Math.max(right, VERTICAL_COLUMN_WIDTH) : 0;
  return width - sideInsets - getUnfoldedLeftPadding(width, height);
};

const BOTTOM_TAB_SCROLL_PADDING = 140;
const SIDE_TAB_SCROLL_PADDING = 24;

export const useTabScrollPadding = () => {
  const { bottom } = useSafeAreaInsets();
  return useTabBarPosition() === "bottom"
    ? BOTTOM_TAB_SCROLL_PADDING
    : SIDE_TAB_SCROLL_PADDING + bottom;
};

export const useTabPageEdges = (): Edge[] =>
  useTabBarPosition() === "right" ? ["top", "left"] : ["top"];
