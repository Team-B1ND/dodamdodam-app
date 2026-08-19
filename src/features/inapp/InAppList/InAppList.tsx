import React, { useCallback } from "react";
import { View, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Divider } from "@shared/ui";
import { skipStorage } from "@entities/inapp/storage/skipStorage";
import { MenuItem } from "@pages/more/ui/MenuItem";
import { useInAppsSuspense } from "../useInApps";
import { InAppListSkeleton } from "./InAppListSkeleton";
import { styles } from "./styles";
import type { InApp } from "@entities/inapp/types";

interface InAppListProps {
  onEndReachedRef?: React.RefObject<(() => void) | null>;
}

export const InAppListComponent = ({ onEndReachedRef }: InAppListProps) => {
  const { apps, loadingMore, fetchMore } = useInAppsSuspense();
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();
  const isDark = colorScheme === "dark";

  if (onEndReachedRef) {
    onEndReachedRef.current = fetchMore;
  }

  const handlePress = useCallback(async (app: InApp) => {
    const skipped = await skipStorage.isSkipped(app.appId);
    if (skipped) {
      navigation.navigate("AppWebView", {
        appUrl: app.appUrl,
        name: app.name,
      });
    } else {
      navigation.navigate("AppIn", {
        appId: app.appId,
        name: app.name,
        team: "B1ND",
        subTitle: app.subtitle,
        description: app.description,
        iconUrl: app.iconUrl,
        darkIconUrl: app.darkIconUrl,
        appUrl: app.appUrl,
      });
    }
  }, [navigation]);

  if (apps.length === 0) return null;

  return (
    <>
      <Divider />
      <View style={styles.section}>
        {apps.map((app) => (
          <MenuItem
            key={app.appId}
            iconImage={{ uri: isDark && app.darkIconUrl ? app.darkIconUrl : app.iconUrl }}
            title={app.name}
            appName={app.subtitle}
            onPress={() => handlePress(app)}
          />
        ))}
        {loadingMore && <InAppListSkeleton />}
      </View>
    </>
  );
};
