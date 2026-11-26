import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { inappApi } from "@entities/inapp/api";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";
import { widgetSelectionStorage } from "@entities/inapp/storage/widgetSelectionStorage";
import type { InApp } from "@entities/inapp/types";
import { saveInAppsToWidget } from "@shared/lib/widget/inAppWidget";

// 위젯은 Medium 4개 · Large 5개씩 넘겨 보므로 몇 페이지 분량만 있으면 충분하다.
const WIDGET_APP_COUNT = 30;
const WIDGET_SYNC_STALE_TIME = 5 * 60 * 1000;

// 진행 중이던 이전 동기화가 최신 저장 결과를 덮어쓰지 않도록 순번을 관리한다.
let latestSyncVersion = 0;

/**
 * 저장된 선택 ID 순서대로 미니앱 목록을 거르고 정렬한다.
 * 선택이 비어 있거나 선택된 ID가 현재 목록에 하나도 없으면 기본 목록(최대 30개)을 반환한다.
 */
export const resolveWidgetInApps = (apps: InApp[], selectedIds: string[]): InApp[] => {
  if (selectedIds.length === 0) return apps.slice(0, WIDGET_APP_COUNT);

  const appById = new Map(apps.map((app) => [app.appId, app]));
  const filtered = selectedIds
    .map((id) => appById.get(id))
    .filter((app): app is InApp => app !== undefined);

  return filtered.length > 0 ? filtered : apps.slice(0, WIDGET_APP_COUNT);
};

/**
 * 미니앱 목록에 현재 선택 설정을 반영해 위젯에 저장하고 타임라인을 리로드한다.
 */
export const syncInAppWidget = async (apps: InApp[], selectedIds?: string[]) => {
  const version = ++latestSyncVersion;
  const ids = selectedIds ?? (await widgetSelectionStorage.getSelectedIds());
  if (version !== latestSyncVersion) return;
  saveInAppsToWidget(resolveWidgetInApps(apps, ids));
};

/**
 * 위젯 동기화에 필요한 활성 미니앱 목록을 조회한다.
 * 기본은 첫 페이지(최대 30개)만 받고, 선택된 ID 중 누락된 항목이 있으면 다음 페이지까지 이어 조회한다.
 */
const fetchWidgetApps = async (
  selectedIds: string[],
  signal?: AbortSignal,
): Promise<InApp[]> => {
  const apps: InApp[] = [];
  const seenIds = new Set<string>();

  for (let page = 0; ; page++) {
    const { data } = await inappApi.getActiveApps(page, WIDGET_APP_COUNT, signal);
    const { content, hasNext } = data.data;

    for (const app of content) {
      if (!seenIds.has(app.appId)) {
        seenIds.add(app.appId);
        apps.push(app);
      }
    }

    const hasUnmatchedSelection =
      selectedIds.length > 0 && selectedIds.some((id) => !seenIds.has(id));
    if (!hasNext || !hasUnmatchedSelection) {
      return apps;
    }
  }
};

interface SyncWidgetFromQueryOptions {
  forceFetch?: boolean;
  beforeSave?: () => Promise<void>;
}

/**
 * 위젯 기본 목록(최대 30개, 누락된 선택이 있으면 추가 페이지 포함)을 확보한 뒤 위젯에 저장한다.
 * 진행 중인 기존 위젯 쿼리를 취소하고 순번을 비교해 덮어쓰기 경합을 막는다.
 */
export const syncInAppWidgetFromQuery = async (
  queryClient: QueryClient,
  selectedIds: string[],
  options?: SyncWidgetFromQueryOptions,
) => {
  await queryClient.cancelQueries({ queryKey: inappQueryKeys.widgetApps });
  const version = ++latestSyncVersion;
  const apps = await queryClient.fetchQuery({
    queryKey: inappQueryKeys.widgetApps,
    queryFn: ({ signal }) => fetchWidgetApps(selectedIds, signal),
    staleTime: options?.forceFetch ? 0 : WIDGET_SYNC_STALE_TIME,
  });
  if (version !== latestSyncVersion) return;
  if (options?.beforeSave) {
    await options.beforeSave();
    if (version !== latestSyncVersion) return;
  }
  saveInAppsToWidget(resolveWidgetInApps(apps, selectedIds));
};

/**
 * 앱인도담 위젯이 쓸 미니앱 목록을 받아 App Group에 저장한다.
 * 위젯 저장 경로를 하나로 통일해 홈·미니앱 탭 어디로 진입해도 같은 목록을 쓴다.
 */
export const useInAppWidgetSync = () => {
  const queryClient = useQueryClient();

  useQuery({
    queryKey: inappQueryKeys.widgetApps,
    queryFn: async ({ signal }) => {
      const version = ++latestSyncVersion;
      const selectedIds = await widgetSelectionStorage.getSelectedIds();
      const apps = await fetchWidgetApps(selectedIds, signal);
      if (!signal.aborted && version === latestSyncVersion) {
        saveInAppsToWidget(resolveWidgetInApps(apps, selectedIds));
      }
      return apps;
    },
    staleTime: WIDGET_SYNC_STALE_TIME,
  });

  // 이미 마운트된 탭으로 딥링크(dodamdodam://aid 등) 재진입 시 stale·오류 상태면 다시 채운다.
  useFocusEffect(
    useCallback(() => {
      queryClient.refetchQueries(
        { queryKey: inappQueryKeys.widgetApps, stale: true },
        { cancelRefetch: false },
      );
    }, [queryClient]),
  );
};
