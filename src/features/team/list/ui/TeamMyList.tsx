import React from "react";
import { useTeamDetailNavigation } from "../../detail";
import { useRegisterTeamLoadMore } from "../model/useTeamListLoadMore";
import { useMyTeamsSuspense } from "../model/useTeamListSuspense";
import { TeamList } from "./team-list";

export const TeamMyList = () => {
  const query = useMyTeamsSuspense();
  const handlePress = useTeamDetailNavigation();

  useRegisterTeamLoadMore(query);

  return (
    <TeamList
      items={query.items}
      isFetchingNextPage={query.isFetchingNextPage}
      emptyMessage="아직 소속된 팀이 없어요."
      onTeamPress={handlePress}
    />
  );
};
