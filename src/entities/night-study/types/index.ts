export type NightStudyStatus = "ALLOWED" | "PENDING" | "REJECTED";

export interface NightStudyPersonal {
  id: string;
  description: string;
  period: number;
  startAt: string;
  endAt: string;
  needPhone: boolean;
  needPhoneReason: string;
  rejectionReason: string;
  status: NightStudyStatus;
}

export interface NightStudyRoom {
  id: number;
  name: string;
}

export interface NightStudyProject {
  id: string;
  name: string;
  description: string;
  period: number;
  startAt: string;
  endAt: string;
  rejectionReason: string;
  isLeader: boolean;
  status: NightStudyStatus;
  room: NightStudyRoom | null;
}

export interface NightStudyPersonalRequest {
  description: string;
  period: number;
  startAt: string;
  endAt: string;
  needPhone: boolean;
  needPhoneReason: string;
}

export interface NightStudyProjectRequest {
  name: string;
  description: string;
  period: number;
  startAt: string;
  endAt: string;
  members: string[];
}
