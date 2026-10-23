import { Easing, type WithTimingConfig } from "react-native-reanimated";

export const INDICATOR_SIZE = 40;
export const ICON_SIZE = 24;
export const BAR_THICKNESS = 64;
export const BORDER_RADIUS = 18;
export const MARGIN_HORIZONTAL = 16;
export const MARGIN_BOTTOM = 12;
export const OVERLAP_THRESHOLD = 0.8;
export const PAN_ACTIVE_OFFSET = 8;

export const VERTICAL_TAB_SIZE = 56;
export const CAMERA_BOTTOM_CLEARANCE = 80;

export const TIMING_CONFIG: WithTimingConfig = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
};
