import { useState, useEffect } from "react";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tokenStorage } from "@entities/api/common/tokenStorage";

export interface AppWebViewParams {
  appUrl: string;
  name: string;
  // 푸시 알림으로 들어오면 아이콘 정보가 없다.
  iconUrl?: string;
  darkIconUrl?: string | null;
  // 같은 화면 인스턴스가 재사용될 때 미니앱 열기 요청을 구분하는 토큰.
  requestId?: number;
}

export type AppWebViewRouteProp = RouteProp<{ AppWebView: AppWebViewParams }, "AppWebView">;

export const useAppWebViewUri = () => {
  const { params } = useRoute<AppWebViewRouteProp>();
  const { top, bottom } = useSafeAreaInsets();
  const [resolved, setResolved] = useState<{
    params: AppWebViewParams;
    appUrl: string;
    uri: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await tokenStorage.getAccessToken();
      if (cancelled) return;
      const separator = params.appUrl.includes("?") ? "&" : "?";
      setResolved({
        params,
        appUrl: params.appUrl,
        uri: `${params.appUrl}${separator}top=${top}&bottom=${bottom}&token=${token ?? ""}`,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [params, params.appUrl, top, bottom]);

  const uri =
    resolved && resolved.params === params && resolved.appUrl === params.appUrl
      ? resolved.uri
      : "";

  return { uri };
};
