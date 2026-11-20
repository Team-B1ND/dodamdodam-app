import { useEffect } from "react";
import { AppState } from "react-native";
import { getAllActiveInApps } from "@entities/inapp/api/activeApps";
import { saveAidAppsToWidget, supportsAidWidget } from "@shared/lib/widget/aidWidget";

/** 로그인 후와 앱 복귀 시 전체 활성 목록을 동기화해 위젯에서 서비스를 고르게 한다. */
export const useAidWidgetSync = () => {
  useEffect(() => {
    if (!supportsAidWidget) return;
    let active = true;
    let syncing = false;

    const sync = async () => {
      if (syncing) return;
      syncing = true;
      try {
        const apps = await getAllActiveInApps();
        if (active) await saveAidAppsToWidget(apps);
      } catch {
        // 일시적인 조회 실패에는 마지막으로 성공한 목록을 유지한다.
      } finally {
        syncing = false;
      }
    };

    void sync();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") void sync();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
};
