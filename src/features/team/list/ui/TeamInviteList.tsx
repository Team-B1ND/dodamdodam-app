import React from "react";
import { useTeamDetailNavigation } from "../../detail";
import { useRegisterTeamLoadMore } from "../model/useTeamListLoadMore";
import { useInviteTeamsSuspense } from "../model/useTeamListSuspense";
import { TeamList } from "./team-list";

export const TeamInviteList = () => {
  const query = useInviteTeamsSuspense();
  const handlePress = useTeamDetailNavigation();

  useRegisterTeamLoadMore(query);

  return (
    <TeamList
      items={query.items}
      isFetchingNextPage={query.isFetchingNextPage}
      emptyMessage="아직 받은 초대가 없어요."
      onTeamPress={handlePress}
    />
  );
};
