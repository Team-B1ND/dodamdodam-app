export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenData {
  access: string;
  refresh: string;
}

export type Gender = "MALE" | "FEMALE";

export interface RegisterStudentRequest {
  username: string;
  name: string;
  password: string;
  phone: string;
  grade: number;
  room: number;
  number: number;
  gender: Gender;
}

export interface RegisterTeacherRequest {
  username: string;
  name: string;
  password: string;
  phone: string;
  position: string;
  gender: Gender;
}
