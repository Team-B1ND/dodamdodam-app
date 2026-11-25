export const WEEKEND_STUDY_PERIODS = [17, 18, 19, 20] as const;

export type WeekendStudyPeriod = (typeof WEEKEND_STUDY_PERIODS)[number];

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface WeekendStudyPersonal {
  id: string;
  date: string;
  periods: number[];
}

export interface WeekendStudyRoom {
  id: number;
  name: string;
}

export interface WeekendStudyProject {
  id: string;
  name: string;
  description: string;
  date: string;
  periods: number[];
  isLeader: boolean;
  room: WeekendStudyRoom | null;
}

export interface WeekendStudyPersonalRequest {
  date: string;
  periods: number[];
}

export type WeekendStudyTime =
  | string
  | {
      hour: number;
      minute: number;
      second?: number;
    };

export interface WeekendStudyDeadline {
  startDayOfWeek: DayOfWeek;
  /** Jackson 직렬화 설정에 따라 "HH:mm:ss" 문자열 또는 객체로 내려올 수 있다. */
  startTime: WeekendStudyTime;
  endDayOfWeek: DayOfWeek;
  endTime: WeekendStudyTime;
}
