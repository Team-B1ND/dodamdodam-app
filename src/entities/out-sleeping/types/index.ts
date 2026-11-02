export type OutSleepingStatus = "PENDING" | "ALLOWED" | "DENIED";

export type OutSleepingStatusType = "NORMAL" | "LATE";

export type OutSleepingReasonType =
  | "PERSONAL"
  | "TRAINING"
  | "INTERNSHIP"
  | "SILICON_VALLEY"
  | "SICK_LEAVE"
  | "ETC";

export const OUT_SLEEPING_REASON_TYPES: OutSleepingReasonType[] = [
  "PERSONAL",
  "TRAINING",
  "INTERNSHIP",
  "SILICON_VALLEY",
  "SICK_LEAVE",
  "ETC",
];

export const OUT_SLEEPING_REASON_LABEL: Record<OutSleepingReasonType, string> = {
  PERSONAL: "일반 외박",
  TRAINING: "연수",
  INTERNSHIP: "현장실습",
  SILICON_VALLEY: "실리콘 밸리",
  SICK_LEAVE: "병가",
  ETC: "기타",
};

export interface OutSleeping {
  publicId: string;
  reasonType: OutSleepingReasonType;
  reason: string | null;
  status: OutSleepingStatus;
  statusType: OutSleepingStatusType;
  startAt: string;
  endAt: string;
}

export type OutSleepingResponse = OutSleeping[];

export interface OutSleepingRequest {
  reasonType: OutSleepingReasonType;
  reason?: string;
  startAt: string;
  endAt: string;
}
