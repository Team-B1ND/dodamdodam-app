import { useEffect } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { inappApi } from "@entities/inapp/api";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";
import type { InApp, InAppPageResponse } from "@entities/inapp/types";
import { saveInAppsToWidget } from "@shared/lib/widget/inAppWidget";

const PAGE_SIZE = 10;

const fetchPage = async (page: number): Promise<InAppPageResponse> => {
  const { data } = await inappApi.getActiveApps(page, PAGE_SIZE);
  return data.data;
};

export const useInAppsSuspense = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: inappQueryKeys.activeApps,
      queryFn: ({ pageParam }) => fetchPage(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, _, lastPageParam) =>
        lastPage.hasNext ? lastPageParam + 1 : undefined,
    });

  const apps: InApp[] = data.pages.flatMap((page) => page.content);

  // 미니앱 테스트 위젯은 Debug 빌드에만 있으므로 개발 중에만 넘긴다.
  useEffect(() => {
    if (__DEV__) saveInAppsToWidget(data.pages.flatMap((page) => page.content));
  }, [data]);

  return {
    apps,
    fetchMore: fetchNextPage,
    hasNext: hasNextPage,
    loadingMore: isFetchingNextPage,
  };
};
