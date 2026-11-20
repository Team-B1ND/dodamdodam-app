import { useState, useEffect } from "react";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tokenStorage } from "@entities/api/common/tokenStorage";
import { buildAppWebViewUri } from "./buildAppWebViewUri";

interface AppWebViewParams {
  appUrl: string;
  name: string;
}

type AppWebViewRouteProp = RouteProp<{ AppWebView: AppWebViewParams }, "AppWebView">;

interface ResolvedUri {
  appUrl: string;
  top: number;
  bottom: number;
  uri: string;
}

export const useAppWebViewUri = () => {
  const { params } = useRoute<AppWebViewRouteProp>();
  const { top, bottom } = useSafeAreaInsets();
  const [resolved, setResolved] = useState<ResolvedUri | null>(null);

  useEffect(() => {
    let active = true;
    setResolved(null);

    const loadUri = async () => {
      try {
        const token = await tokenStorage.getAccessToken();
        if (!active) return;

        const uri = buildAppWebViewUri(params.appUrl, { top, bottom, token });
        setResolved({ appUrl: params.appUrl, top, bottom, uri });
      } catch {
        if (active) setResolved(null);
      }
    };

    void loadUri();
    return () => {
      active = false;
    };
  }, [params.appUrl, top, bottom]);

  // 새 주소의 effect가 실행되기 전에도 이전 서비스의 토큰 포함 URI를 숨긴다.
  const uri =
    resolved?.appUrl === params.appUrl &&
    resolved.top === top &&
    resolved.bottom === bottom
      ? resolved.uri
      : "";

  return { uri };
};
