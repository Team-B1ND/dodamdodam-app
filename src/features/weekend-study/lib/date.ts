const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const pad = (n: number) => String(n).padStart(2, "0");

export const toYmd = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseYmd = (ymd: string): Date => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** 이번 주 일요일(오늘이 일요일이면 오늘)을 yyyy-MM-dd 형식으로 반환한다. */
export const getUpcomingSunday = (base = new Date()): string => {
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7));
  return toYmd(date);
};

/** "2026-11-22" → "11월 22일 (일)" */
export const formatDate = (ymd: string): string => {
  const date = parseYmd(ymd);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
};
