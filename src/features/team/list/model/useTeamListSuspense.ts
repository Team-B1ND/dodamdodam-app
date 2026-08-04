import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { teamApi, teamQueryKeys, type Team } from "@entities/team";

const PAGE_SIZE = 20;

export const useAllTeamsSuspense = () => {
  const query = useSuspenseInfiniteQuery({
    queryKey: teamQueryKeys.all,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      (await teamApi.getAll(pageParam, PAGE_SIZE)).data.data ?? {
        content: [] as Team[],
        hasNext: false,
      },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
  });

  return {
    items: query.data.pages.flatMap((page) => page.content),
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefetching: query.isRefetching,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
};

export const useMyTeamsSuspense = () => {
  const query = useSuspenseInfiniteQuery({
    queryKey: teamQueryKeys.my,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      (await teamApi.getMy(pageParam, PAGE_SIZE)).data.data ?? {
        content: [] as Team[],
        hasNext: false,
      },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
  });

  return {
    items: query.data.pages.flatMap((page) => page.content),
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefetching: query.isRefetching,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
};

export const useInviteTeamsSuspense = () => {
  const query = useSuspenseInfiniteQuery({
    queryKey: teamQueryKeys.invite,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      (await teamApi.getMyInvitations(pageParam, PAGE_SIZE)).data.data ?? {
        content: [] as Team[],
        hasNext: false,
      },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
  });

  return {
    items: query.data.pages.flatMap((page) => page.content),
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefetching: query.isRefetching,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
};
