import { useCallback, useMemo, useRef, useState } from "react";
import { Linking } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import type { BannerItem } from "@features/home/home-banner";
import { bannerApi } from "@entities/banner/api";
import { bannerQueryKeys } from "@entities/banner/api/queryKeys";
import { mealQueryKeys } from "@entities/meal/api/queryKeys";
import { timeTableQueryKeys } from "@entities/time-table/api/queryKeys";
import { linkOpenStorage } from "@entities/settings/storage/linkOpenStorage";
import { TAB_ROUTES, formatToday } from "./constants";

const fetchBanner = async (): Promise<BannerItem[]> => {
  try {
    const { data } = await bannerApi.get();
    const banners = data.data ?? [];
    return banners
      .filter((b) => b.isActive)
      .map((b) => ({ id: String(b.id), imageUrl: b.imageUrl, linkUrl: b.linkUrl }));
  } catch {
    return [];
  }
};

export const useHomePage = () => {
  const navigation = useNavigation<any>();
  const webPopupRef = useRef<BottomSheetModal>(null);
  const [popupUrl, setPopupUrl] = useState("");

  const { data: banners, isLoading: bannerLoading } = useQuery({
    queryKey: bannerQueryKeys.banner,
    queryFn: fetchBanner,
  });

  const navigateToNotification = useCallback(
    () => navigation.navigate("Notification"),
    [navigation],
  );

  const navigateToMeal = useCallback(
    () => navigation.navigate("Meal"),
    [navigation],
  );

  const handleBannerPress = useCallback(async (item: BannerItem) => {
    const { linkUrl } = item;
    if (!linkUrl) return;

    if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
      if ((await linkOpenStorage.get()) === "browser") {
        Linking.openURL(linkUrl).catch(() => {});
        return;
      }
      setPopupUrl(linkUrl);
      webPopupRef.current?.present();
    } else if (linkUrl.startsWith("/")) {
      const tabRoute = TAB_ROUTES[linkUrl.toLowerCase()];
      if (tabRoute) {
        navigation.dispatch(
          CommonActions.navigate("Main", { screen: tabRoute }),
        );
      }
    }
  }, [navigation]);

  const today = useMemo(formatToday, []);
  const queryKeys = useMemo(
    () => [mealQueryKeys.byDate(today), timeTableQueryKeys.me, bannerQueryKeys.banner],
    [today],
  );

  return {
    banners,
    bannerLoading,
    webPopupRef,
    popupUrl,
    queryKeys,
    navigateToNotification,
    navigateToMeal,
    handleBannerPress,
  };
};