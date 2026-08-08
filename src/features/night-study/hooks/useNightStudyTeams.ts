import { useCallback, useEffect, useRef, useState } from "react";
import { teamApi, type Team } from "@entities/team";

const PAGE_SIZE = 20;

export const useNightStudyTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const fetchPage = useCallback(async (page: number, append: boolean) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    try {
      const { data } = await teamApi.getMy(page, PAGE_SIZE);
      const nextTeams = data.data.content;
      pageRef.current = page;
      setTeams((current) => (append ? [...current, ...nextTeams] : nextTeams));
      setHasNext(data.data.hasNext);
    } catch {
      if (!append) setTeams([]);
      setHasNext(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (hasNext) fetchPage(pageRef.current + 1, true);
  }, [fetchPage, hasNext]);

  const refresh = useCallback(() => fetchPage(0, false), [fetchPage]);

  return { teams, hasNext, loading, loadMore, refresh };
};
