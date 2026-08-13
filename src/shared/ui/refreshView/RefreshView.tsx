import React, { useCallback, useRef, useState, type ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useTheme } from "@shared/theme";

const MIN_REFRESH_MS = 600;
const DEFAULT_END_REACHED_THRESHOLD = 0.3;

interface RefreshViewProps extends Omit<ScrollViewProps, "refreshControl"> {
  queryKeys?: readonly (readonly unknown[])[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  children: ReactNode;
}

export const RefreshView = ({
  queryKeys,
  onEndReached,
  onEndReachedThreshold = DEFAULT_END_REACHED_THRESHOLD,
  onScroll,
  children,
  ...scrollProps
}: RefreshViewProps) => {
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const endReachedRef = useRef(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.selectionAsync();

    const delay = new Promise((r) => setTimeout(r, MIN_REFRESH_MS));

    if (queryKeys && queryKeys.length > 0) {
      await Promise.all([
        delay,
        ...queryKeys.map((key) =>
          queryClient.resetQueries({ queryKey: key }),
        ),
      ]);
    } else {
      await Promise.all([delay, queryClient.resetQueries()]);
    }

    setRefreshing(false);
  }, [queryClient, queryKeys]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll?.(event);

      if (!onEndReached) return;

      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceToEnd =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      const isNearEnd =
        distanceToEnd <= layoutMeasurement.height * onEndReachedThreshold;

      if (isNearEnd) {
        if (!endReachedRef.current) {
          endReachedRef.current = true;
          onEndReached();
        }
      } else {
        endReachedRef.current = false;
      }
    },
    [onEndReached, onEndReachedThreshold, onScroll],
  );

  return (
    <ScrollView
      {...scrollProps}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.text.tertiary}
          colors={[colors.brand.primary]}
        />
      }
    >
      {children}
    </ScrollView>
  );
};