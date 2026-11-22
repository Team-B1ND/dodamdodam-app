import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { toast } from "@shared/ui";
import { findActiveInApp, getInAppRoute } from "@features/inapp";

type InAppLaunchRouteProp = RouteProp<{ InAppLaunch: { appId: string } }, "InAppLaunch">;

// dodamdodam://apps/:appId 딥링크로 진입해 미니앱 탭에서 누른 것과 같은 화면으로 넘긴다.
// 웹뷰는 URL에 토큰을 붙여 열기 때문에 딥링크로는 appId만 받고 URL은 서버 목록에서 찾는다.
export const InAppLaunchPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { params } = useRoute<InAppLaunchRouteProp>();

  useEffect(() => {
    let active = true;

    (async () => {
      const app = await findActiveInApp(params.appId).catch(() => undefined);
      if (!active) return;

      if (!app) {
        toast.error("미니앱을 열 수 없어요", { position: "top" });
        navigation.goBack();
        return;
      }

      const route = await getInAppRoute(app);
      if (active) navigation.replace(route.name, route.params);
    })();

    return () => {
      active = false;
    };
  }, [navigation, params.appId]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background.default }}>
      <ActivityIndicator color={colors.brand.primary} />
    </View>
  );
};
