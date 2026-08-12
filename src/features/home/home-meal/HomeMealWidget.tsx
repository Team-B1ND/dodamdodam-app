import React, { useCallback } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  type ListRenderItemInfo,
} from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "@shared/theme";
import { Indicator } from "@shared/ui";
import { ForkAndKnife, ChevronRight } from "@shared/icons/mono";
import { styles } from "./style";
import { ICON_SIZE, MEAL_TITLES } from "./utils/constants";
import { useHomeMeal } from "./hooks/useHomeMeal";
import { MealSlide } from "./MealSlide";

export interface MealData {
  id: string;
  label: string;
  menus: string[];
}

interface HomeMealWidgetProps {
  meals: MealData[];
  onPress?: () => void;
}

export const HomeMealWidget = React.memo(({ meals, onPress }: HomeMealWidgetProps) => {
  const { colors } = useTheme();
  const {
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
  } = useHomeMeal(meals);

  const renderMealPage = useCallback(
    ({ item }: ListRenderItemInfo<MealData>) => (
      <MealSlide item={item} width={contentWidth} height={maxHeight} />
    ),
    [contentWidth, maxHeight],
  );

  const activeTitle = MEAL_TITLES[meals[activeIndex]?.id ?? ""] ?? "오늘의 급식";

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.card, { backgroundColor: colors.background.surface }, pressStyle]}
      >
        <Pressable
          style={styles.header}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View
            style={[styles.iconContainer, { backgroundColor: colors.brand.primary }]}
          >
            <ForkAndKnife size={ICON_SIZE} color={colors.static.white} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {activeTitle}
          </Text>
          <ChevronRight size={14} color={colors.text.tertiary} />
        </Pressable>

        <Animated.View style={[styles.listWrapper, listWrapperStyle]}>
          <FlatList
            data={meals}
            renderItem={renderMealPage}
            keyExtractor={keyExtractor}
            horizontal
            pagingEnabled
            initialScrollIndex={initialIndex}
            bounces={false}
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            style={{ width: contentWidth, alignSelf: "center" }}
            getItemLayout={getItemLayout}
            viewabilityConfigCallbackPairs={
              viewabilityConfigCallbackPairs.current
            }
          />
        </Animated.View>

        <Indicator
          current={activeIndex}
          total={meals.length}
          style={styles.indicator}
        />
      </Animated.View>
    </View>
  );
});
