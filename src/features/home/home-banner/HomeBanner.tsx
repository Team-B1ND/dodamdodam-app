import React, { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { useTheme } from "@shared/theme";
import { Indicator } from "@shared/ui";
import { CORNER_RADIUS, HORIZONTAL_PADDING } from "./constants/constants";
import { useHomeBanner } from "./hooks/useHomeBanner";
import { BannerImage } from "./BannerImage";

export interface BannerItem {
  id: string;
  imageUrl: string;
  linkUrl: string;
}

interface HomeBannerProps {
  items: BannerItem[];
  onPressItem?: (item: BannerItem) => void;
}

export const HomeBanner = React.memo(({ items, onPressItem }: HomeBannerProps) => {
  const { colors } = useTheme();
  const {
    activeIndex,
    contentWidth,
    bannerHeight,
    flatListRef,
    keyExtractor,
    handleScrollBeginDrag,
    handleScrollEndDrag,
    handleMomentumScrollEnd,
    getItemLayout,
  } = useHomeBanner(items);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<BannerItem>) => (
      <BannerImage item={item} width={contentWidth} height={bannerHeight} onPress={() => onPressItem?.(item)} />
    ),
    [contentWidth, bannerHeight, onPressItem],
  );

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.banner, { height: bannerHeight, backgroundColor: colors.background.surface }]}>
        <FlatList
          ref={flatListRef}
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          snapToInterval={contentWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={{ width: contentWidth }}
          getItemLayout={getItemLayout}
        />
        <Indicator
          current={activeIndex}
          total={items.length}
          activeColor={colors.static.white}
          inactiveColor={colors.static.white + "4D"}
          style={styles.indicator}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
  },
  banner: {
    borderRadius: CORNER_RADIUS,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  indicator: {
    position: "absolute",
    right: 16,
    bottom: 10,
  },
});