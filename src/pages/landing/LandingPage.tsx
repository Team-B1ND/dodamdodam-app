import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { AppLogo } from "@shared/ui/topNavBar/AppLogo";
import { B1NDLogo } from "@shared/icons/logo";
import { tokenStorage } from "@entities/api/common";
import { registerPushToken } from "@shared/lib/notification";

const SPLASH_DURATION = 2000;
const APP_LOGO_WIDTH = 176;
const APP_LOGO_HEIGHT = 44;

export const LandingPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = await tokenStorage.getAccessToken();

      // 등록은 로그인 시점에만 일어나서, 이미 로그인된 채로 앱을 켜면 토큰이 서버에 없었다.
      // 권한이 이미 허용된 기기에서는 팝업 없이 토큰만 갱신된다.
      if (token) registerPushToken();

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: token ? "Main" : "Login" }],
        }),
      );
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
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
