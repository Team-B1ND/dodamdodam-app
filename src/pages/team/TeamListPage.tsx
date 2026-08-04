import React, { Suspense, useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { TopNavBar, SegmentedButton } from "@shared/ui";
import type { SegmentedButtonData } from "@shared/ui/buttons/SegmentedButton";
import { Plus } from "@shared/icons/mono";
import { TeamAllList, TeamMyList } from "@features/team";

const INITIAL_SEGMENTS: SegmentedButtonData[] = [
  { text: "전체 팀", value: "all", isActive: true },
  { text: "소속 팀", value: "my", isActive: false },
];

export const TeamListPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [segments, setSegments] = useState(INITIAL_SEGMENTS);
  const activeTab = segments.find((s) => s.isActive)?.value ?? "all";
  const goBack = () => navigation.goBack();
  const openTeamCreate = useCallback(() => navigation.navigate("TeamCreate"), [navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <TopNavBar
        left={<TopNavBar.BackButton onPress={goBack} />}
        right={<TopNavBar.IconButton icon={<Plus />} onPress={openTeamCreate} />}
      >
        <TopNavBar.Title hasBackButton>팀</TopNavBar.Title>
      </TopNavBar>
      <View style={styles.content}>
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 20,
  },
});
