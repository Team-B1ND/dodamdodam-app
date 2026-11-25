import type { DayOfWeek, WeekendStudyDeadline } from "@entities/weekend-study/types";

export const DEADLINE_CLOSED_MESSAGE =
  "신청이 마감되었습니다. 변경은 관리자에게 문의하세요.";

const DAY_OF_WEEK_VALUE: Record<DayOfWeek, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

const DAY_OF_WEEK_LABEL: Record<DayOfWeek, string> = {
  MONDAY: "월요일",
  TUESDAY: "화요일",
  WEDNESDAY: "수요일",
  THURSDAY: "목요일",
  FRIDAY: "금요일",
  SATURDAY: "토요일",
  SUNDAY: "당일",
};

const parseTimeToSeconds = (time: string): number => {
  const [hours = 0, minutes = 0, seconds = 0] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const getIsoDayOfWeek = (date: Date): number => {
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

/**
 * 서버 WeekendStudyDeadlineService.isWithinRange와 동일한 신청 기간 판정.
 * 마감 설정이 없으면 제한 없이 신청 가능한 것으로 본다.
 */
export const isWithinDeadline = (
  deadline: WeekendStudyDeadline | null | undefined,
  now = new Date(),
): boolean => {
  if (!deadline) return true;

  const currentDayValue = getIsoDayOfWeek(now);
  const startDayValue = DAY_OF_WEEK_VALUE[deadline.startDayOfWeek];
  const endDayValue = DAY_OF_WEEK_VALUE[deadline.endDayOfWeek];

  const currentSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const startSeconds = parseTimeToSeconds(deadline.startTime);
  const endSeconds = parseTimeToSeconds(deadline.endTime);

  const isBeforeStart =
    currentDayValue < startDayValue ||
    (currentDayValue === startDayValue && currentSeconds < startSeconds);
  const isAfterEnd =
    currentDayValue > endDayValue ||
    (currentDayValue === endDayValue && currentSeconds >= endSeconds);

  if (startDayValue <= endDayValue) {
    if (isBeforeStart) return false;
    if (isAfterEnd) return false;
    return true;
  }

  // 주를 넘어가는 범위(예: 일요일 시작 ~ 금요일 마감)
  if (isAfterEnd && isBeforeStart) return false;
  return true;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/** 다음 신청 기간 시작·마감 경계까지 남은 ms를 반환한다. */
export const getMsUntilNextDeadlineTransition = (
  deadline: WeekendStudyDeadline,
  now = new Date(),
): number => {
  const currentMs =
    (getIsoDayOfWeek(now) - 1) * DAY_MS +
    (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) * 1000 +
    now.getMilliseconds();

  const startMs =
    (DAY_OF_WEEK_VALUE[deadline.startDayOfWeek] - 1) * DAY_MS +
    parseTimeToSeconds(deadline.startTime) * 1000;
  const endMs =
    (DAY_OF_WEEK_VALUE[deadline.endDayOfWeek] - 1) * DAY_MS +
    parseTimeToSeconds(deadline.endTime) * 1000;

  const msUntil = (targetMs: number) => {
    const diff = targetMs - currentMs;
    return diff > 0 ? diff : diff + WEEK_MS;
  };

  return Math.min(msUntil(startMs), msUntil(endMs)) + 50;
};

/** "17:00:00" → "17:00" */
export const formatDeadlineTime = (time: string): string => {
  const [hours = "00", minutes = "00"] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

export const formatDeadlineNotice = (deadline: WeekendStudyDeadline): string => {
  const dayLabel = DAY_OF_WEEK_LABEL[deadline.endDayOfWeek];
  const time = formatDeadlineTime(deadline.endTime);
  return `주의: 신청은 ${dayLabel} ${time}에 마감됩니다.\n${time} 이후 변경은 관리자에게 문의하세요.`;
};
