import React from "react";
import { useTeamDetailNavigation } from "../../detail";
import { useAllTeamsSuspense } from "../model/useTeamListSuspense";
import { TeamList } from "./team-list";

export const TeamAllList = () => {
  const query = useAllTeamsSuspense();
  const handlePress = useTeamDetailNavigation();

  return (
    <TeamList
      {...query}
      emptyMessage="아직 등록된 팀이 없어요."
      onTeamPress={handlePress}
    />
  );
};
