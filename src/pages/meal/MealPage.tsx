import React, { Suspense, useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  clamp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { TopNavBar } from "@shared/ui";
import {
  MealCalendar,
  useCalendar,
  ROW_HEIGHT,
  CALENDAR_NON_GRID_HEIGHT,
} from "@widgets/meal";
import { MealCardList } from "@features/meal";

export const MealPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const calendar = useCalendar();
  const rowCount = Math.ceil(calendar.monthDates.length / 7);
  const collapsibleHeight = (rowCount - 1) * ROW_HEIGHT;
  const monthHeight = rowCount * ROW_HEIGHT;

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const spacerStyle = useAnimatedStyle(() => ({
    height: clamp(scrollY.value, 0, collapsibleHeight),
  }));

  const isAndroid = Platform.OS === "android";
  const androidSpacerHeight = monthHeight + CALENDAR_NON_GRID_HEIGHT;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />}>
        <TopNavBar.Title hasBackButton>{`${calendar.month + 1}월 급식`}</TopNavBar.Title>
      </TopNavBar>

      <View style={styles.content}>
        <Animated.ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentOffset={{ x: 0, y: 0 }}
          bounces
        >
          {isAndroid ? (
            <View style={{ height: androidSpacerHeight }} />
          ) : (
            <>
              <MealCalendar calendar={calendar} scrollY={scrollY} />
              <Animated.View style={spacerStyle} />
            </>
          )}
          <Suspense fallback={<MealCardList.Skeleton />}>
            <MealCardList date={calendar.selectedDateStr} />
          </Suspense>
        </Animated.ScrollView>

        {isAndroid && (
          <View style={styles.calendarOverlay} pointerEvents="box-none">
            <MealCalendar calendar={calendar} scrollY={scrollY} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  calendarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});