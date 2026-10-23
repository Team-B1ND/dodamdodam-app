import React, { Suspense, useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { useTabPageEdges, useTabScrollPadding } from "@shared/hooks";
import { TopNavBar, RefreshView, SegmentedButton } from "@shared/ui";
import type { SegmentedButtonData } from "@shared/ui/buttons/SegmentedButton";
import { Plus } from "@shared/icons/mono";
import { NightStudyPersonalList, NightStudyProjectList } from "@features/night-study";
import { nightStudyQueryKeys } from "@entities/night-study/api/queryKeys";

const INITIAL_SEGMENTS: SegmentedButtonData[] = [
  { text: "개인", value: "personal", isActive: true },
  { text: "프로젝트", value: "project", isActive: false },
];

export const NightStudyPage = () => {
  const { colors } = useTheme();
  const scrollPadding = useTabScrollPadding();
  const edges = useTabPageEdges();
  const navigation = useNavigation<any>();
  const [segments, setSegments] = useState(INITIAL_SEGMENTS);
  const activeTab = segments.find((s) => s.isActive)?.value ?? "personal";

  const handleApply = useCallback(() => {
    navigation.navigate("NightStudyApply", { tab: activeTab });
  }, [navigation, activeTab]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={edges}
    >
      <TopNavBar
        right={<TopNavBar.IconButton icon={<Plus />} onPress={handleApply} />}
      >
        <TopNavBar.Title>심야 자습</TopNavBar.Title>
      </TopNavBar>
      <RefreshView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPadding }]}
        showsVerticalScrollIndicator={false}
        queryKeys={[
          activeTab === "personal"
            ? nightStudyQueryKeys.myPersonal
            : nightStudyQueryKeys.myProject,
        ]}
      >
        <SegmentedButton data={segments} setData={setSegments} />
        {activeTab === "personal" ? (
          <Suspense fallback={<NightStudyPersonalList.Skeleton />}>
            <NightStudyPersonalList />
          </Suspense>
        ) : (
          <Suspense fallback={<NightStudyProjectList.Skeleton />}>
            <NightStudyProjectList />
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
    gap: 20,
  },
});
