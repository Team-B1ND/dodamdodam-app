import React, { useCallback } from "react";
import { Image, Pressable, Text, View, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { EmptyState } from "@shared/ui";
import { Globe } from "@shared/icons/illustration";
import { getInAppRoute } from "../inAppLauncher";
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
    const route = await getInAppRoute(app);
    navigation.navigate(route.name, route.params);
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
              style={[typo("Caption2", "Medium"), styles.name, { color: colors.text.primary }]}
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
