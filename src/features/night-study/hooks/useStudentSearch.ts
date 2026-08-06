import { useState, useCallback, useRef } from "react";
import { userApi } from "@entities/user/api";
import type { User } from "@entities/user/types";
import type { StudentMember } from "./useNightStudyForm";

const toStudentMember = (user: User): StudentMember => ({
  id: user.publicId,
  name: user.name,
  grade: user.student?.grade ?? 0,
  room: user.student?.room ?? 0,
  number: user.student?.number ?? 0,
  profileImage: user.profileImage,
});

export const useStudentSearch = () => {
  const [students, setStudents] = useState<StudentMember[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(0);
  const keywordRef = useRef("");
  const myIdRef = useRef<string | null>(null);
  const initedRef = useRef(false);

  const ensureMyId = async () => {
    if (myIdRef.current) return;
    try {
      const { data } = await userApi.getMe();
      myIdRef.current = data.data.publicId;
    } catch {}
  };

  const excludeMe = (users: User[]): User[] =>
    myIdRef.current ? users.filter((u) => u.publicId !== myIdRef.current) : users;

  const search = useCallback(async (keyword: string) => {
    keywordRef.current = keyword;
    pageRef.current = 0;

    setLoading(true);
    try {
      if (!initedRef.current) {
        await ensureMyId();
        initedRef.current = true;
      }
      const trimmed = keyword.trim();
      const { data } = await userApi.search({
        keyword: trimmed || null,
        roles: ["STUDENT"],
        generationOnly: true,
        page: 0,
        size: 10,
      });
      setStudents(excludeMe(data.data.content).map(toStudentMember));
      setHasNext(data.data.hasNext);
    } catch {
      setStudents([]);
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasNext || loading) return;

    const nextPage = pageRef.current + 1;
    setLoading(true);
    try {
      const trimmed = keywordRef.current.trim();
      const { data } = await userApi.search({
        keyword: trimmed || null,
        roles: ["STUDENT"],
        generationOnly: true,
        page: nextPage,
        size: 10,
      });
      pageRef.current = nextPage;
      setStudents((prev) => [...prev, ...excludeMe(data.data.content).map(toStudentMember)]);
      setHasNext(data.data.hasNext);
    } catch {
      // 실패 시 현재 상태 유지
    } finally {
      setLoading(false);
    }
  }, [hasNext, loading]);

  return { students, hasNext, loading, search, loadMore };
};
