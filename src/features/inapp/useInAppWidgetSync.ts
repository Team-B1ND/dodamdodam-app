import { useQuery } from "@tanstack/react-query";
import { inappApi } from "@entities/inapp/api";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";
import { saveInAppsToWidget } from "@shared/lib/widget/inAppWidget";

// 위젯은 Medium 4개 · Large 5개씩 넘겨 보므로 몇 페이지 분량만 있으면 충분하다.
const WIDGET_APP_COUNT = 30;

/**
 * 앱인도담 위젯이 쓸 미니앱 목록을 받아 App Group에 저장한다.
 * 미니앱 탭에 들어가지 않아도 위젯이 채워지도록 홈에서 호출한다.
 */
export const useInAppWidgetSync = () => {
  useQuery({
    queryKey: inappQueryKeys.widgetApps,
    queryFn: async () => {
      const { data } = await inappApi.getActiveApps(0, WIDGET_APP_COUNT);
      const apps = data.data.content;
      saveInAppsToWidget(apps);
      return apps;
    },
  });
};
