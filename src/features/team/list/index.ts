import { TeamCardSkeleton } from "@entities/team";
import { TeamAllList as TeamAllListComponent } from "./ui/TeamAllList";
import { TeamInviteList as TeamInviteListComponent } from "./ui/TeamInviteList";
import { TeamMyList as TeamMyListComponent } from "./ui/TeamMyList";

export const TeamAllList = Object.assign(TeamAllListComponent, {
  Skeleton: TeamCardSkeleton,
});

export const TeamMyList = Object.assign(TeamMyListComponent, {
  Skeleton: TeamCardSkeleton,
});

export const TeamInviteList = Object.assign(TeamInviteListComponent, {
  Skeleton: TeamCardSkeleton,
});
