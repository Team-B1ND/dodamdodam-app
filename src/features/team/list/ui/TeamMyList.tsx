import React from "react";
import { useTeamDetailNavigation } from "../../detail";
import { useMyTeamsSuspense } from "../model/useTeamListSuspense";
import { TeamList } from "./team-list";

export const TeamMyList = () => {
  const query = useMyTeamsSuspense();
  const handlePress = useTeamDetailNavigation();

  return (
    <TeamList
      {...query}
      emptyMessage="아직 소속된 팀이 없어요."
      onTeamPress={handlePress}
    />
  );
};
