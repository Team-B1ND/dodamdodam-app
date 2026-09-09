import React, { Suspense, useCallback, useRef } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { TopNavBar, RefreshView } from "@shared/ui";
import { InAppGrid } from "@features/inapp";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";

export const AidPage = () => {
  const { colors } = useTheme();
  // 다음 페이지 로드 함수는 Suspense 안쪽 훅에 있어서, ref로 끌어올려 RefreshView에 연결한다.
  const loadMoreRef = useRef<(() => void) | null>(null);
  const handleEndReached = useCallback(() => loadMoreRef.current?.(), []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <TopNavBar>
        <TopNavBar.Title>앱인도담</TopNavBar.Title>
      </TopNavBar>
      <RefreshView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        queryKeys={[inappQueryKeys.activeApps]}
        onEndReached={handleEndReached}
      >
        <Suspense fallback={<InAppGrid.Skeleton />}>
          <InAppGrid onEndReachedRef={loadMoreRef} />
        </Suspense>
      </RefreshView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
});
