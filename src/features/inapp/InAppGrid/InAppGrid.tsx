import React, { useCallback } from "react";
import { Image, Pressable, Text, View, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { EmptyState } from "@shared/ui";
import { Globe } from "@shared/icons/illustration";
import { skipStorage } from "@entities/inapp/storage/skipStorage";
import { useInAppsSuspense } from "../useInApps";
import { InAppGridSkeleton } from "./InAppGridSkeleton";
import { styles } from "./styles";
import type { InApp } from "@entities/inapp/types";

interface InAppGridProps {
  onEndReachedRef?: React.RefObject<(() => void) | null>;
}

const InAppGridComponent = ({ onEndReachedRef }: InAppGridProps) => {
  const { apps, loadingMore, fetchMore } = useInAppsSuspense();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();
  const isDark = colorScheme === "dark";

  if (onEndReachedRef) {
    onEndReachedRef.current = fetchMore;
  }

  const handlePress = useCallback(async (app: InApp) => {
    const skipped = await skipStorage.isSkipped(app.appId);
    if (skipped) {
      navigation.navigate("AppWebView", { appUrl: app.appUrl, name: app.name });
    } else {
      navigation.navigate("AppIn", {
        appId: app.appId,
        name: app.name,
        subTitle: app.subtitle,
        description: app.description,
        iconUrl: app.iconUrl,
        darkIconUrl: app.darkIconUrl,
        appUrl: app.appUrl,
      });
    }
  }, [navigation]);

  if (apps.length === 0) {
    return (
      <EmptyState icon={<Globe size={36} />} message={"아직 사용할 수 있는\n미니앱이 없어요."} />
    );
  }

  return (
    <>
      <View style={styles.grid}>
        {apps.map((app) => (
          <Pressable key={app.appId} style={styles.cell} onPress={() => handlePress(app)}>
            <Image
              source={{ uri: isDark && app.darkIconUrl ? app.darkIconUrl : app.iconUrl }}
              style={styles.icon}
            />
            <Text
              numberOfLines={2}
              style={[typo("Caption1", "Medium"), styles.name, { color: colors.text.primary }]}
            >
              {app.name}
            </Text>
          </Pressable>
        ))}
      </View>
      {loadingMore && <InAppGridSkeleton />}
    </>
  );
};

export const InAppGrid = Object.assign(React.memo(InAppGridComponent), {
  Skeleton: InAppGridSkeleton,
});
