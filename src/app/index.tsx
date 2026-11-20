import React, { useEffect, useMemo, useRef } from "react";
import { CommonActions, NavigationContainer, type NavigationContainerRef } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { BridgeUiProvider } from "@b1nd/aid-kit/bridge-kit/app";
import { ThemeProvider } from "@shared/theme";
import { ToastProvider, OverlayProvider } from "@shared/ui";
import { setSessionExpiredHandler } from "@entities/api/common";
import { setupNotificationNavigation, setupTokenRefresh } from "@shared/lib/notification";
import NfcManager from "react-native-nfc-manager";
import { QrScan } from "@features/app-webview/screens/QrScan";
import { createLinking } from "./navigation/linking";
import { pendingDeepLink } from "./navigation/pendingDeepLink";

NfcManager.start().catch(() => {});
import { RootStackNavigator } from "./navigation";

const queryClient = new QueryClient();

const BRIDGE_SCREENS = {
  QR_SCAN: <QrScan />,
};

const AppInner = () => {
  const { top } = useSafeAreaInsets();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const linking = useMemo(
    () =>
      createLinking({
        onAuthenticationRequired: () => {
          navigationRef.current?.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
          );
        },
      }),
    [],
  );

  useEffect(() => {
    setSessionExpiredHandler(() => {
      // 서비스 조회 중 세션이 만료돼도 로그인 후 같은 AID로 이어진다.
      pendingDeepLink.saveAidEntry(navigationRef.current?.getCurrentRoute());
      navigationRef.current?.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
      );
    });

    setupNotificationNavigation(navigationRef);

    return setupTokenRefresh();
  }, []);

  return (
    <BridgeUiProvider top={top} screens={BRIDGE_SCREENS}>
      <ThemeProvider>
        <OverlayProvider>
          <BottomSheetModalProvider>
            <ToastProvider>
              <NavigationContainer
                ref={navigationRef}
                linking={linking}
              >
                <RootStackNavigator />
              </NavigationContainer>
            </ToastProvider>
          </BottomSheetModalProvider>
        </OverlayProvider>
      </ThemeProvider>
    </BridgeUiProvider>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppInner />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
