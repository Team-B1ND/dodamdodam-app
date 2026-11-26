import { useCallback } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { inappApi } from "@entities/inapp/api";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";
import type { InApp, InAppPageResponse } from "@entities/inapp/types";

const PAGE_SIZE = 10;

const fetchPage = async (page: number): Promise<InAppPageResponse> => {
  const { data } = await inappApi.getActiveApps(page, PAGE_SIZE);
  return data.data;
};

export const useInAppsSuspense = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isError,
    isFetchNextPageError,
  } = useSuspenseInfiniteQuery({
    queryKey: inappQueryKeys.activeApps,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
  });

  const apps: InApp[] = data.pages.flatMap((page) => page.content);
  const fetchMore = useCallback(
    () => fetchNextPage({ cancelRefetch: false }),
    [fetchNextPage],
  );

  return {
    apps,
    fetchMore,
    hasNext: hasNextPage,
    isFetching,
    loadingMore: isFetchingNextPage,
    loadMoreError: isFetchNextPageError || isError,
  };
};
