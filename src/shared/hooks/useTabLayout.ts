import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  UNFOLDED_LEFT_PADDING,
  UNFOLDED_MIN_SIDE,
  VERTICAL_COLUMN_WIDTH,
  WIDE_SCREEN_MIN_SIDE,
} from "@shared/config";

export type TabBarPosition = "bottom" | "right";

export const useTabBarPosition = (): TabBarPosition => {
  const { width, height } = useWindowDimensions();
  return Math.min(width, height) >= WIDE_SCREEN_MIN_SIDE ? "right" : "bottom";
};

export const useTabContentWidth = () => {
  const { width } = useWindowDimensions();
  const { right } = useSafeAreaInsets();
  const position = useTabBarPosition();
  const leftPadding = useUnfoldedLeftPadding();
  const sideColumn = position === "right" ? Math.max(right, VERTICAL_COLUMN_WIDTH) : 0;
  return width - sideColumn - leftPadding;
};

const BOTTOM_TAB_SCROLL_PADDING = 140;
const SIDE_TAB_SCROLL_PADDING = 24;

export const useTabScrollPadding = () =>
  useTabBarPosition() === "bottom" ? BOTTOM_TAB_SCROLL_PADDING : SIDE_TAB_SCROLL_PADDING;

export const useUnfoldedLeftPadding = () => {
  const { width, height } = useWindowDimensions();
  return Math.min(width, height) >= UNFOLDED_MIN_SIDE ? UNFOLDED_LEFT_PADDING : 0;
};
