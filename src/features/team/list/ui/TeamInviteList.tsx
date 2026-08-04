import React from "react";
import { useTeamDetailNavigation } from "../../detail";
import { useInviteTeamsSuspense } from "../model/useTeamListSuspense";
import { TeamList } from "./team-list";

export const TeamInviteList = () => {
  const query = useInviteTeamsSuspense();
  const handlePress = useTeamDetailNavigation(true);

  return (
    <TeamList
      {...query}
      emptyMessage="아직 받은 초대가 없어요."
      onTeamPress={handlePress}
    />
  );
};
