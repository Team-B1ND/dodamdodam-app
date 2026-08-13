import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  RefreshControl,
  ScrollView,
  type LayoutChangeEvent,
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
  /** 값이 바뀌면 스크롤을 맨 위로 되돌리고 onEndReached 발화 상태를 초기화한다. */
  resetKey?: unknown;
  children: ReactNode;
}

export const RefreshView = ({
  queryKeys,
  onEndReached,
  onEndReachedThreshold = DEFAULT_END_REACHED_THRESHOLD,
  resetKey,
  onScroll,
  onLayout,
  onContentSizeChange,
  scrollEventThrottle,
  children,
  ...scrollProps
}: RefreshViewProps) => {
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const endReachedRef = useRef(false);
  const layoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const offsetYRef = useRef(0);

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

  const evaluateEndReached = useCallback(() => {
    if (!onEndReached) return;

    const layoutHeight = layoutHeightRef.current;
    if (layoutHeight === 0) return;

    const distanceToEnd =
      contentHeightRef.current - layoutHeight - offsetYRef.current;
    const isNearEnd = distanceToEnd <= layoutHeight * onEndReachedThreshold;

    if (!isNearEnd) {
      endReachedRef.current = false;
      return;
    }

    if (!endReachedRef.current) {
      endReachedRef.current = true;
      onEndReached();
    }
  }, [onEndReached, onEndReachedThreshold]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll?.(event);

      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      layoutHeightRef.current = layoutMeasurement.height;
      contentHeightRef.current = contentSize.height;
      offsetYRef.current = contentOffset.y;

      evaluateEndReached();
    },
    [evaluateEndReached, onScroll],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event);
      layoutHeightRef.current = event.nativeEvent.layout.height;
      evaluateEndReached();
    },
    [evaluateEndReached, onLayout],
  );

  // 콘텐츠가 화면보다 짧으면 스크롤 이벤트가 발생하지 않으므로 여기서도 판정한다.
  // 콘텐츠 높이가 바뀌었다는 건 다음 페이지가 붙었다는 뜻이라, FlatList처럼 발화 상태를 풀어준다.
  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      onContentSizeChange?.(width, height);

      if (contentHeightRef.current !== height) {
        contentHeightRef.current = height;
        endReachedRef.current = false;
      }

      evaluateEndReached();
    },
    [evaluateEndReached, onContentSizeChange],
  );

  useEffect(() => {
    endReachedRef.current = false;
    offsetYRef.current = 0;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [resetKey]);

  return (
    <ScrollView
      {...scrollProps}
      ref={scrollRef}
      onScroll={onEndReached || onScroll ? handleScroll : undefined}
      onLayout={onEndReached || onLayout ? handleLayout : undefined}
      onContentSizeChange={
        onEndReached || onContentSizeChange ? handleContentSizeChange : undefined
      }
      scrollEventThrottle={
        onEndReached ? (scrollEventThrottle ?? 16) : scrollEventThrottle
      }
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
