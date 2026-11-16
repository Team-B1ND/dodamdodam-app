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
}

export type AppWebViewRouteProp = RouteProp<{ AppWebView: AppWebViewParams }, "AppWebView">;

export const useAppWebViewUri = () => {
  const { params } = useRoute<AppWebViewRouteProp>();
  const { top, bottom } = useSafeAreaInsets();
  const [uri, setUri] = useState("");

  useEffect(() => {
    (async () => {
      const token = await tokenStorage.getAccessToken();
      const separator = params.appUrl.includes("?") ? "&" : "?";
      setUri(`${params.appUrl}${separator}top=${top}&bottom=${bottom}&token=${token ?? ""}`);
    })();
  }, [params.appUrl, top, bottom]);

  return { uri };
};
