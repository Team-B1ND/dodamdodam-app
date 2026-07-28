import React, { Suspense, useState } from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { TopNavBar, RefreshView, SegmentedButton } from "@shared/ui";
import type { SegmentedButtonData } from "@shared/ui/buttons/SegmentedButton";
import { TeamAllList, TeamMyList } from "@features/team";
import { teamQueryKeys } from "@entities/team/api/queryKeys";

const INITIAL_SEGMENTS: SegmentedButtonData[] = [
  { text: "전체", value: "all", isActive: true },
  { text: "소속", value: "my", isActive: false },
];

export const TeamListPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [segments, setSegments] = useState(INITIAL_SEGMENTS);
  const activeTab = segments.find((s) => s.isActive)?.value ?? "all";
  const goBack = () => navigation.goBack();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />}>
        <TopNavBar.Title hasBackButton>팀</TopNavBar.Title>
      </TopNavBar>
      <RefreshView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        queryKeys={[activeTab === "all" ? teamQueryKeys.all : teamQueryKeys.my]}
      >
        <SegmentedButton data={segments} setData={setSegments} />
        {activeTab === "all" ? (
          <Suspense fallback={<TeamAllList.Skeleton />}>
            <TeamAllList />
          </Suspense>
        ) : (
          <Suspense fallback={<TeamMyList.Skeleton />}>
            <TeamMyList />
          </Suspense>
        )}
      </RefreshView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 140,
    gap: 20,
  },
});
