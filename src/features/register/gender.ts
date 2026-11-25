import type { Gender } from "@entities/auth/types";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

export const getGenderLabel = (gender: Gender | null) =>
  GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? "";
