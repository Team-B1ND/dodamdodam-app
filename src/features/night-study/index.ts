import { NightStudyPersonalList as _NightStudyPersonalList } from "./list/NightStudyPersonalList";
import { NightStudyProjectList as _NightStudyProjectList } from "./list/NightStudyProjectList";
import { NightStudyCardSkeleton } from "./card/NightStudyCardSkeleton";

export const NightStudyPersonalList = Object.assign(_NightStudyPersonalList, {
  Skeleton: NightStudyCardSkeleton,
});

export const NightStudyProjectList = Object.assign(_NightStudyProjectList, {
  Skeleton: NightStudyCardSkeleton,
});

export { NightStudyCard } from "./card/NightStudyCard";
export { PersonalForm } from "./form/PersonalForm";
export { StudentAddSheet } from "./student/StudentAddSheet";
export { TeamAddSheet } from "./team/TeamAddSheet";
export { ProjectForm } from "./form/ProjectForm";
export { TimeSlotPicker } from "./form/TimeSlotPicker";
export { WishRoomPicker } from "./form/WishRoomPicker";
export { useNightStudyRooms } from "./hooks/useNightStudyRooms";
export { useNightStudyForm } from "./hooks/useNightStudyForm";
export { useNightStudyPersonalApply, useNightStudyProjectApply } from "./hooks/useNightStudyApply";
export { useNightStudyPersonalSuspense, useNightStudyProjectSuspense } from "./hooks/useNightStudySuspense";
export type { TimeSlot } from "./form/TimeSlotPicker";
export type { StudentMember } from "./hooks/useNightStudyForm";
