import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@shared/theme";
import { shapes, typo } from "@shared/tokens";
import { useInfiniteScroll } from "@shared/hooks";
import { Divider, EmptyState, FilledButton, TopNavBar } from "@shared/ui";
import { Globe } from "@shared/icons/illustration";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";
import { widgetSelectionStorage } from "@entities/inapp/storage/widgetSelectionStorage";
import type { InApp } from "@entities/inapp/types";
import {
  syncInAppWidget,
  useInAppsSuspense,
  useWidgetSelectedIdsSuspense,
} from "@features/inapp";
import { WidgetAppRow } from "./ui/WidgetAppRow";
import { WidgetSettingSkeleton } from "./ui/WidgetSettingSkeleton";

const mergeApps = (primary: InApp[], secondary: InApp[]): InApp[] => {
  const seen = new Set(primary.map((app) => app.appId));
  const merged = [...primary];
  for (const app of secondary) {
    if (!seen.has(app.appId)) {
      seen.add(app.appId);
      merged.push(app);
    }
  }
  return merged;
};

interface AidWidgetSettingContentProps {
  onSaved: () => void;
}

const AidWidgetSettingContent = ({ onSaved }: AidWidgetSettingContentProps) => {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { apps, fetchMore, hasNext, loadingMore } = useInAppsSuspense();
  const savedIds = useWidgetSelectedIdsSuspense();

  // 화면을 처음 열 때의 선택 순서만 상단 정렬에 고정해 체크 변경 시 행이 튀지 않게 한다.
  const [initialSelectedIds] = useState<string[]>(() => savedIds);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => savedIds);
  const [isSaving, setIsSaving] = useState(false);

  const { onScroll, onEndReachedRef } = useInfiniteScroll();
  onEndReachedRef.current = useCallback(() => {
    if (hasNext && !loadingMore) {
      fetchMore();
    }
  }, [fetchMore, hasNext, loadingMore]);

  // 기존 선택 앱이 다음 페이지에 있으면 자동으로 이어 불러와 상단에 표시한다.
  useEffect(() => {
    if (!hasNext || loadingMore) return;
    const loadedIds = new Set(apps.map((app) => app.appId));
    if (initialSelectedIds.some((id) => !loadedIds.has(id))) {
      fetchMore();
    }
  }, [apps, fetchMore, hasNext, initialSelectedIds, loadingMore]);

  const sortedApps = useMemo(() => {
    const orderMap = new Map(initialSelectedIds.map((id, index) => [id, index]));
    const seen = new Set<string>();
    const selected: InApp[] = [];
    const unselected: InApp[] = [];

    for (const app of apps) {
      if (seen.has(app.appId)) continue;
      seen.add(app.appId);
      if (orderMap.has(app.appId)) {
        selected.push(app);
      } else {
        unselected.push(app);
      }
    }

    selected.sort((a, b) => orderMap.get(a.appId)! - orderMap.get(b.appId)!);
    return [...selected, ...unselected];
  }, [apps, initialSelectedIds]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const handleToggle = useCallback((appId: string) => {
    setSelectedIds((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId],
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // 진행 중인 위젯 동기화 쿼리가 이전 선택으로 덮어쓰지 않도록 먼저 취소한다.
      await queryClient.cancelQueries({ queryKey: inappQueryKeys.widgetApps });
      const cachedWidgetApps =
        queryClient.getQueryData<InApp[]>(inappQueryKeys.widgetApps) ?? [];
      const allKnownApps = mergeApps(apps, cachedWidgetApps);
      const knownIds = new Set(allKnownApps.map((app) => app.appId));
      const nextSelectedIds = hasNext
        ? selectedIds
        : selectedIds.filter((id) => knownIds.has(id));

      await widgetSelectionStorage.setSelectedIds(nextSelectedIds);
      queryClient.setQueryData(inappQueryKeys.widgetSelectedIds, nextSelectedIds);
      await syncInAppWidget(allKnownApps, nextSelectedIds);
      onSaved();
    } finally {
      setIsSaving(false);
    }
  }, [apps, hasNext, isSaving, onSaved, queryClient, selectedIds]);

  return (
    <View style={styles.body}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Text style={[typo("Caption1", "Regular"), { color: colors.text.tertiary }]}>
          위젯에 보여줄 앱을 골라주세요. 고른 순서대로 위젯에 표시돼요.
        </Text>

        {sortedApps.length === 0 ? (
          <EmptyState
            icon={<Globe size={36} />}
            message={"아직 사용할 수 있는\n미니앱이 없어요."}
          />
        ) : (
          <View style={[styles.card, { backgroundColor: colors.background.surface }]}>
            {sortedApps.map((app, index) => (
              <React.Fragment key={app.appId}>
                <WidgetAppRow
                  app={app}
                  selected={selectedIdSet.has(app.appId)}
                  onToggle={handleToggle}
                />
                {index < sortedApps.length - 1 ? (
                  <Divider marginHorizontal={0} marginVertical={0} />
                ) : null}
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <FilledButton
          display="fill"
          size="large"
          onPress={handleSave}
          isLoading={isSaving}
        >
          저장
        </FilledButton>
      </View>
    </View>
  );
};

export const AidWidgetSettingPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />}>
        <TopNavBar.Title hasBackButton>위젯 설정</TopNavBar.Title>
      </TopNavBar>
      <Suspense fallback={<WidgetSettingSkeleton />}>
        <AidWidgetSettingContent onSaved={goBack} />
      </Suspense>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    borderRadius: shapes.large,
    paddingHorizontal: 16,
    paddingVertical: 4,
    overflow: "hidden",
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
