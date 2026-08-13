import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

interface TeamLoadMoreSource {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}

type TeamLoadMoreRef = React.MutableRefObject<TeamLoadMoreSource | null>;

const TeamLoadMoreContext = createContext<TeamLoadMoreRef | null>(null);

export const TeamLoadMoreProvider = ({ children }: { children: ReactNode }) => {
  const ref = useRef<TeamLoadMoreSource | null>(null);

  return (
    <TeamLoadMoreContext.Provider value={ref}>
      {children}
    </TeamLoadMoreContext.Provider>
  );
};

export const useRegisterTeamLoadMore = (source: TeamLoadMoreSource) => {
  const ref = useContext(TeamLoadMoreContext);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = source;

  const latest = useMemo(
    () => ({ hasNextPage, isFetchingNextPage, fetchNextPage }),
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    if (!ref) return;

    ref.current = latest;

    return () => {
      if (ref.current === latest) {
        ref.current = null;
      }
    };
  }, [latest, ref]);
};

export const useTeamLoadMore = () => {
  const ref = useContext(TeamLoadMoreContext);

  return useCallback(() => {
    const source = ref?.current;
    if (!source || !source.hasNextPage || source.isFetchingNextPage) return;

    void source.fetchNextPage();
  }, [ref]);
};
