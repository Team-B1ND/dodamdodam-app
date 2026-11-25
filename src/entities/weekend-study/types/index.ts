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

export interface WeekendStudyDeadline {
  startDayOfWeek: DayOfWeek;
  startTime: string;
  endDayOfWeek: DayOfWeek;
  endTime: string;
}
