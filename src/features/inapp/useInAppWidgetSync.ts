import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { inappApi } from "@entities/inapp/api";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";
import { widgetSelectionStorage } from "@entities/inapp/storage/widgetSelectionStorage";
import type { InApp } from "@entities/inapp/types";
import { saveInAppsToWidget } from "@shared/lib/widget/inAppWidget";

// 위젯은 Medium 4개 · Large 5개씩 넘겨 보므로 몇 페이지 분량만 있으면 충분하다.
const WIDGET_APP_COUNT = 30;
const WIDGET_SYNC_STALE_TIME = 5 * 60 * 1000;

/**
 * 저장된 선택 ID 순서대로 미니앱 목록을 거르고 정렬한다.
 * 선택이 비어 있거나 선택된 ID가 현재 목록에 하나도 없으면 전체 목록을 그대로 반환한다.
 */
export const resolveWidgetInApps = (apps: InApp[], selectedIds: string[]): InApp[] => {
  if (selectedIds.length === 0) return apps;

  const appById = new Map(apps.map((app) => [app.appId, app]));
  const filtered = selectedIds
    .map((id) => appById.get(id))
    .filter((app): app is InApp => app !== undefined);

  return filtered.length > 0 ? filtered : apps;
};

/**
 * 미니앱 목록에 현재 선택 설정을 반영해 위젯에 저장하고 타임라인을 리로드한다.
 */
export const syncInAppWidget = async (apps: InApp[], selectedIds?: string[]) => {
  const ids = selectedIds ?? (await widgetSelectionStorage.getSelectedIds());
  saveInAppsToWidget(resolveWidgetInApps(apps, ids));
};

/**
 * 앱인도담 위젯이 쓸 미니앱 목록을 받아 App Group에 저장한다.
 * 위젯 저장 경로를 하나로 통일해 홈·미니앱 탭 어디로 진입해도 같은 최대 30개 목록을 쓴다.
 */
export const useInAppWidgetSync = () => {
  const queryClient = useQueryClient();

  useQuery({
    queryKey: inappQueryKeys.widgetApps,
    queryFn: async () => {
      const [{ data }, selectedIds] = await Promise.all([
        inappApi.getActiveApps(0, WIDGET_APP_COUNT),
        widgetSelectionStorage.getSelectedIds(),
      ]);
      const apps = data.data.content;
      saveInAppsToWidget(resolveWidgetInApps(apps, selectedIds));
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
