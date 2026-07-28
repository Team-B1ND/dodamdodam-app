export interface Team {
  id: string;
  name: string;
  introduction: string;
  profileImage: string | null;
  memberCount: number;
  createdAt: string;
}

export type TeamRole = "LEADER" | "MEMBER";

export interface TeamMember {
  publicId: string;
  name: string;
  profileImage: string | null;
  grade: number;
  room: number;
  number: number;
  role: TeamRole;
}

export interface TeamDetail extends Team {
  members: TeamMember[];
}
