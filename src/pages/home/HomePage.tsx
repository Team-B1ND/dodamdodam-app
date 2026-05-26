import React, { Suspense } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { TopNavBar, RefreshView, WebPopup } from "@shared/ui";
import { Bell } from "@shared/icons/mono";
import { HomeBanner } from "@features/home/home-banner";
import { HomeMealCard } from "@features/meal";
import { HomeTimeTableCard } from "@features/time-table";
import { useHomePage } from "./useHomePage";

export const HomePage = () => {
  const { colors } = useTheme();
  const {
    banners,
    bannerLoading,
    webPopupRef,
    popupUrl,
    queryKeys,
    navigateToNotification,
    navigateToMeal,
    handleBannerPress,
  } = useHomePage();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <TopNavBar
        right={<TopNavBar.IconButton icon={<Bell />} onPress={navigateToNotification} />}
      >
        <TopNavBar.Logo />
      </TopNavBar>
      <RefreshView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        queryKeys={queryKeys}
      >
        {bannerLoading ? <HomeBanner.Skeleton /> : <HomeBanner items={banners ?? []} onPressItem={handleBannerPress} />}
        <Suspense fallback={<HomeMealCard.Skeleton />}>
          <HomeMealCard onPress={navigateToMeal} />
        </Suspense>
        <Suspense fallback={<HomeTimeTableCard.Skeleton />}>
          <HomeTimeTableCard />
        </Suspense>
      </RefreshView>

      <WebPopup sheetRef={webPopupRef} url={popupUrl} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
});