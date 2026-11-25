import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { inappApi } from "@entities/inapp/api";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";
import { saveInAppsToWidget } from "@shared/lib/widget/inAppWidget";

// 위젯은 Medium 4개 · Large 5개씩 넘겨 보므로 몇 페이지 분량만 있으면 충분하다.
const WIDGET_APP_COUNT = 30;
const WIDGET_SYNC_STALE_TIME = 5 * 60 * 1000;

/**
 * 앱인도담 위젯이 쓸 미니앱 목록을 받아 App Group에 저장한다.
 * 위젯 저장 경로를 하나로 통일해 홈·미니앱 탭 어디로 진입해도 같은 최대 30개 목록을 쓴다.
 */
export const useInAppWidgetSync = () => {
  const queryClient = useQueryClient();

  useQuery({
    queryKey: inappQueryKeys.widgetApps,
    queryFn: async () => {
      const { data } = await inappApi.getActiveApps(0, WIDGET_APP_COUNT);
      const apps = data.data.content;
      saveInAppsToWidget(apps);
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
