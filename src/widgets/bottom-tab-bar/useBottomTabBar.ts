import { useCallback, useEffect, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { useHaptic } from "@shared/hooks";
import { INDICATOR_SIZE, PAN_ACTIVE_OFFSET, TIMING_CONFIG } from "./constants";
import { calcTargetOffset } from "./calcTargetOffset";

interface UseBottomTabBarParams {
  tabCount: number;
  activeIndex: number;
  vertical: boolean;
  onTabChange: (index: number) => void;
}

export const useBottomTabBar = ({
  tabCount,
  activeIndex,
  vertical,
  onTabChange,
}: UseBottomTabBarParams) => {
  const translate = useSharedValue(0);
  const barLength = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const isFirstRender = useRef(true);
  const haptic = useHaptic("light");

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    haptic();
    if (barLength.value > 0) {
      translate.value = withTiming(
        calcTargetOffset(activeIndex, barLength.value, tabCount),
        TIMING_CONFIG,
      );
    }
  }, [activeIndex, tabCount]);

  const onBarLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      const length = vertical ? height : width;
      barLength.value = length;
      translate.value = calcTargetOffset(activeIndex, length, tabCount);
    },
    [activeIndex, tabCount, vertical],
  );

  const pan = Gesture.Pan();
  if (vertical) pan.activeOffsetY([-PAN_ACTIVE_OFFSET, PAN_ACTIVE_OFFSET]);
  else pan.activeOffsetX([-PAN_ACTIVE_OFFSET, PAN_ACTIVE_OFFSET]);

  const panGesture = pan
    .onStart(() => {
      dragStart.value = translate.value;
    })
    .onUpdate((e) => {
      const tabSize = barLength.value / tabCount;
      const min = (tabSize - INDICATOR_SIZE) / 2;
      const max = (tabCount - 1) * tabSize + min;
      const moved = vertical ? e.translationY : e.translationX;
      translate.value = Math.max(min, Math.min(max, dragStart.value + moved));
    })
    .onEnd(() => {
      const tabSize = barLength.value / tabCount;
      const center = translate.value + INDICATOR_SIZE / 2;
      const nearestIndex = Math.max(
        0,
        Math.min(tabCount - 1, Math.round(center / tabSize - 0.5)),
      );
      translate.value = withTiming(
        calcTargetOffset(nearestIndex, barLength.value, tabCount),
        TIMING_CONFIG,
      );
      runOnJS(onTabChange)(nearestIndex);
    });

  const indicatorStyle = useAnimatedStyle(() => {
    if (barLength.value === 0) return { opacity: 0 };
    return {
      opacity: 1,
      transform: vertical
        ? [{ translateY: translate.value }]
        : [{ translateX: translate.value }],
    };
  });

  return { onBarLayout, indicatorStyle, panGesture, translate, barLength };
};
