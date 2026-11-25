import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { AppLogo } from "@shared/ui/topNavBar/AppLogo";
import { B1NDLogo } from "@shared/icons/logo";
import { notificationApi } from "@entities/notification/api";
import { validateSession } from "@features/auth/session";
import { registerPushToken } from "@shared/lib/notification";
import { pendingDeepLink, resolvePendingNavigation } from "@app/navigation/pendingDeepLink";

const SPLASH_DURATION = 2000;
const APP_LOGO_WIDTH = 176;
const APP_LOGO_HEIGHT = 44;

export const LandingPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      const authenticated = await validateSession();
      if (!active) return;

      if (!authenticated) {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
        );
        return;
      }

      registerPushToken();

      const pendingTarget = pendingDeepLink.peek();
      const resolved = resolvePendingNavigation(pendingTarget);

      navigation.dispatch(
        CommonActions.reset(
          resolved?.state ?? { index: 0, routes: [{ name: "Main" }] },
        ),
      );
      pendingDeepLink.clear();

      if (resolved?.notificationId) {
        notificationApi.markAsRead(resolved.notificationId).catch(() => {});
      }
    }, SPLASH_DURATION);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.default }]}
    >
      <View style={styles.center}>
        <AppLogo width={APP_LOGO_WIDTH} height={APP_LOGO_HEIGHT} />
      </View>
      <View style={[styles.bottom, { paddingBottom: bottom + 16 }]}>
        <B1NDLogo color={colors.brand.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
  },
});
