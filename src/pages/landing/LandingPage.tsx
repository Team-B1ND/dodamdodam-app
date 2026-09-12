import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { AppLogo } from "@shared/ui/topNavBar/AppLogo";
import { B1NDLogo } from "@shared/icons/logo";
import { validateSession } from "@features/auth/session";
import { registerPushToken } from "@shared/lib/notification";
import { pendingDeepLink } from "@app/navigation/pendingDeepLink";
import { resolveDeepLink } from "@app/navigation/deepLinkResolver";

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

      const pendingUrl = pendingDeepLink.peek();
      const deepLinkState = pendingUrl ? resolveDeepLink(pendingUrl) : null;

      if (deepLinkState) {
        navigation.dispatch(CommonActions.reset(deepLinkState));
        pendingDeepLink.clear();
        return;
      }

      pendingDeepLink.clear();
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: "Main" }] }),
      );
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
