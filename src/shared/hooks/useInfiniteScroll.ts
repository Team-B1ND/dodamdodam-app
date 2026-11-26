import { useCallback, useRef } from "react";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

const DEFAULT_THRESHOLD = 100;

export const useInfiniteScroll = (threshold = DEFAULT_THRESHOLD) => {
  const onEndReachedRef = useRef<(() => boolean | void) | null>(null);
  const layoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const offsetYRef = useRef(0);
  const endReachedRef = useRef(false);

  const evaluateEndReached = useCallback(() => {
    const layoutHeight = layoutHeightRef.current;
    const contentHeight = contentHeightRef.current;
    if (layoutHeight === 0 || contentHeight === 0) return;

    const distanceFromEnd = contentHeight - layoutHeight - offsetYRef.current;
    if (distanceFromEnd >= threshold) {
      endReachedRef.current = false;
      return;
    }

    if (!endReachedRef.current) {
      const triggered = onEndReachedRef.current?.();
      if (triggered !== false) {
        endReachedRef.current = true;
      }
    }
  }, [threshold]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      if (
        layoutHeightRef.current !== layoutMeasurement.height ||
        contentHeightRef.current !== contentSize.height
      ) {
        endReachedRef.current = false;
      }
      layoutHeightRef.current = layoutMeasurement.height;
      contentHeightRef.current = contentSize.height;
      offsetYRef.current = contentOffset.y;
      evaluateEndReached();
    },
    [evaluateEndReached],
  );

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      if (layoutHeightRef.current !== height) {
        layoutHeightRef.current = height;
        endReachedRef.current = false;
      }
      evaluateEndReached();
    },
    [evaluateEndReached],
  );

  // 콘텐츠가 화면보다 짧아 onScroll이 불리지 않는 경우에도 끝 도달을 판정한다.
  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      if (contentHeightRef.current !== height) {
        contentHeightRef.current = height;
        endReachedRef.current = false;
      }
      evaluateEndReached();
    },
    [evaluateEndReached],
  );

  return {
    onScroll,
    onLayout,
    onContentSizeChange,
    checkEndReached: evaluateEndReached,
    onEndReachedRef,
  };
};
