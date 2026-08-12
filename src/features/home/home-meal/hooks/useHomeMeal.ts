import { useCallback, useMemo, useRef, useState } from "react";
import { useWindowDimensions, type ViewToken } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { usePressAnimation } from "@shared/hooks";
import {
  CARD_PADDING,
  EMPTY_STATE_HEIGHT,
  HORIZONTAL_PADDING,
  viewabilityConfig,
} from "../utils/constants";
import { calcContentHeight } from "../utils/calcContentHeight";
import { getInitialMealIndex } from "../utils/getInitialMealIndex";
import type { MealData } from "../HomeMealWidget";

export const useHomeMeal = (meals: MealData[]) => {
  const { width: screenWidth } = useWindowDimensions();

  const initialIndex = useMemo(() => {
    const idx = getInitialMealIndex();
    return Math.max(0, Math.min(idx, meals.length - 1));
  }, [meals.length]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const { animatedStyle: pressStyle, handlePressIn, handlePressOut } =
    usePressAnimation({ scale: 0.98 });

  const cardWidth = screenWidth - HORIZONTAL_PADDING * 2;
  const contentWidth = cardWidth - CARD_PADDING * 2;

  const pageHeights = useMemo(
    () => meals.map((m) => calcContentHeight(m.menus.length)),
    [meals],
  );
  // 스프레드만 쓰면 meals가 비었을 때 -Infinity가 된다.
  const maxHeight = Math.max(EMPTY_STATE_HEIGHT, ...pageHeights);
  const animatedHeight = useSharedValue(pageHeights[initialIndex] ?? 0);

  const listWrapperStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const idx = viewableItems[0].index;
        setActiveIndex(idx);
        animatedHeight.value = withTiming(pageHeights[idx], { duration: 250 });
      }
    },
    [pageHeights, animatedHeight],
  );

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const keyExtractor = useCallback((item: MealData) => item.id, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: contentWidth,
      offset: contentWidth * index,
      index,
    }),
    [contentWidth],
  );

  return {
    activeIndex,
    initialIndex,
    contentWidth,
    maxHeight,
    pressStyle,
    handlePressIn,
    handlePressOut,
    listWrapperStyle,
    viewabilityConfigCallbackPairs,
    keyExtractor,
    getItemLayout,
  };
};
