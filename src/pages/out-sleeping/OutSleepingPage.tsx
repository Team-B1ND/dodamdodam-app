import React, { Suspense, useCallback } from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { useTabPageEdges, useTabScrollPadding } from "@shared/hooks";
import { TopNavBar, RefreshView } from "@shared/ui";
import { Plus } from "@shared/icons/mono";
import { OutSleepingList } from "@features/out-sleeping";
import { outSleepingQueryKeys } from "@entities/out-sleeping/api/queryKeys";

export const OutSleepingPage = () => {
  const { colors } = useTheme();
  const scrollPadding = useTabScrollPadding();
  const edges = useTabPageEdges();
  const navigation = useNavigation<any>();

  const handleApply = useCallback(() => {
    navigation.navigate("OutSleepingApply");
  }, [navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={edges}
    >
      <TopNavBar
        right={<TopNavBar.IconButton icon={<Plus />} onPress={handleApply} />}
      >
        <TopNavBar.Title>외박</TopNavBar.Title>
      </TopNavBar>
      <RefreshView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPadding }]}
        showsVerticalScrollIndicator={false}
        queryKeys={[outSleepingQueryKeys.me]}
      >
        <Suspense fallback={<OutSleepingList.Skeleton />}>
          <OutSleepingList />
        </Suspense>
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
  },
});
