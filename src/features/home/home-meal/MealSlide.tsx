import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@shared/theme";
import { styles } from "./style";
import { COLUMNS } from "./utils/constants";
import type { MealData } from "./HomeMealWidget";

interface MealSlideProps {
  item: MealData;
  width: number;
  height: number;
}

export const MealSlide = React.memo(({ item, width, height }: MealSlideProps) => {
  const { colors } = useTheme();
  const splitAt = Math.ceil(item.menus.length / COLUMNS);

  const renderMenuColumn = (menus: string[]) =>
    menus.map((menu, i) => (
      <Text
        key={i}
        style={[styles.menuItem, { color: colors.text.secondary }]}
        numberOfLines={1}
      >
        {menu}
      </Text>
    ));

  if (item.menus.length === 0) {
    return (
      <View style={[styles.mealPage, styles.emptyMealPage, { width, height }]}>
        <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
          등록된 급식이 없습니다
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.mealPage, { width, height }]}>
      <View style={styles.menuColumns}>
        <View style={styles.menuColumn}>
          {renderMenuColumn(item.menus.slice(0, splitAt))}
        </View>
        <View style={styles.menuColumn}>
          {renderMenuColumn(item.menus.slice(splitAt))}
        </View>
      </View>
    </View>
  );
});
