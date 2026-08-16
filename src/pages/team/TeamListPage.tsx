import React, { Suspense, useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { TopNavBar, SegmentedButton, RefreshView } from "@shared/ui";
import type { SegmentedButtonData } from "@shared/ui/buttons/SegmentedButton";
import { Plus } from "@shared/icons/mono";
import {
  TeamAllList,
  TeamInviteList,
  TeamMyList,
  TeamLoadMoreProvider,
  useTeamLoadMore,
} from "@features/team";
import { teamQueryKeys } from "@entities/team";

const INITIAL_SEGMENTS: SegmentedButtonData[] = [
  { text: "전체 팀", value: "all", isActive: true },
  { text: "소속 팀", value: "my", isActive: false },
  { text: "초대 목록", value: "invite", isActive: false },
];

const TAB_QUERY_KEYS = {
  all: teamQueryKeys.all,
  my: teamQueryKeys.my,
  invite: teamQueryKeys.invite,
} as const;

type TeamTab = keyof typeof TAB_QUERY_KEYS;

export const TeamListPage = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <TeamLoadMoreProvider>
        <TeamListContent />
      </TeamLoadMoreProvider>
    </SafeAreaView>
  );
};

const TeamListContent = () => {
  const navigation = useNavigation<any>();
  const [segments, setSegments] = useState(INITIAL_SEGMENTS);
  const activeTab = (segments.find((s) => s.isActive)?.value ?? "all") as TeamTab;
  const goBack = () => navigation.goBack();
  const openTeamCreate = useCallback(() => navigation.navigate("TeamCreate"), [navigation]);
  const handleEndReached = useTeamLoadMore();

  return (
    <>
      <TopNavBar
        left={<TopNavBar.BackButton onPress={goBack} />}
        right={<TopNavBar.IconButton icon={<Plus />} onPress={openTeamCreate} />}
      >
        <TopNavBar.Title hasBackButton>팀</TopNavBar.Title>
      </TopNavBar>

      <RefreshView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        queryKeys={[TAB_QUERY_KEYS[activeTab]]}
        onEndReached={handleEndReached}
        resetKey={activeTab}
      >
        <SegmentedButton data={segments} setData={setSegments} />
        <RenderTeamList activeTab={activeTab} />
      </RefreshView>
    </>
  );
};

const RenderTeamList = ({ activeTab }: { activeTab: TeamTab }) => {
  switch (activeTab) {
    case "all":
      return (
        <Suspense fallback={<TeamAllList.Skeleton />}>
          <TeamAllList />
        </Suspense>
      );
    case "my":
      return (
        <Suspense fallback={<TeamMyList.Skeleton />}>
          <TeamMyList />
        </Suspense>
      );
    case "invite":
      return (
        <Suspense fallback={<TeamInviteList.Skeleton />}>
          <TeamInviteList />
        </Suspense>
      );
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
    gap: 20,
  },
});
