import { TeamAllList as _TeamAllList } from "./list/TeamAllList";
import { TeamMyList as _TeamMyList } from "./list/TeamMyList";
import { TeamCardSkeleton } from "./card/TeamCardSkeleton";

export const TeamAllList = Object.assign(_TeamAllList, {
  Skeleton: TeamCardSkeleton,
});

export const TeamMyList = Object.assign(_TeamMyList, {
  Skeleton: TeamCardSkeleton,
});

export { TeamCard } from "./card/TeamCard";
