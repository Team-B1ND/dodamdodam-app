import { useEffect, useRef, type RefObject } from "react";
import type { FlatList } from "react-native";

export const useRealignOnWidthChange = (
  listRef: RefObject<FlatList<any> | null>,
  pageWidth: number,
  pageIndex: number,
) => {
  const indexRef = useRef(pageIndex);
  indexRef.current = pageIndex;

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: pageWidth * indexRef.current, animated: false });
  }, [listRef, pageWidth]);
};
