export interface Team {
  publicId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

export interface StudentInfo {
  grade: number;
  room: number;
  number: number;
}

export interface TeamMember {
  userId: string;
  name: string;
  profileImage: string | null;
  isOwner: boolean;
  isAccept: boolean;
  student: StudentInfo | null;
}
