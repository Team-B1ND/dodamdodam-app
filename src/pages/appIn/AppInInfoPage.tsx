import React, { useCallback, useState } from "react";
import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { Checkbox, FilledButton, TopNavBar } from "@shared/ui";
import { skipStorage } from "@entities/inapp/storage/skipStorage";

export interface AppInParams {
  appId: string;
  name: string;
  team: string;
  subTitle: string;
  description: string;
  iconUrl: string;
  darkIconUrl: string | null;
  appUrl: string;
}

type AppInRouteProp = RouteProp<{ AppIn: AppInParams }, "AppIn">;

export const AppInInfoPage = () => {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { params } = useRoute<AppInRouteProp>();
  const [doNotShowAgain, setDoNotShowAgain] = useState(true);
  const toggleDoNotShowAgain = useCallback(() => setDoNotShowAgain((prev) => !prev), []);

  const isDark = colorScheme === "dark";
  const iconUri = isDark && params.darkIconUrl ? params.darkIconUrl : params.iconUrl;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={() => navigation.goBack()} />} />
      <View style={styles.content}>
        <View>
          <Image source={{ uri: iconUri }} style={styles.appIcon} />
          <Text style={[styles.appName, { color: colors.text.primary }]}>{params.name}</Text>
          <Text style={[styles.teamName, { color: colors.brand.primary }]}>{params.team}</Text>
          <Text style={[styles.subTitle, { color: colors.text.primary }]}>{params.subTitle}</Text>
          <Text style={[styles.description, { color: colors.text.primary }]}>
            {params.description}
          </Text>
        </View>
        <View style={styles.buttonWrapper}>
          <View style={styles.checkboxRow}>
            <Checkbox
              size="small"
              selected={doNotShowAgain}
              onPress={toggleDoNotShowAgain}
            />
            <Text style={[styles.checkboxLabel, { color: colors.text.tertiary }]}>
              다음부턴 보지 않기
            </Text>
          </View>
          <FilledButton display="fill" size="large" onPress={async () => {
            if (doNotShowAgain) {
              await skipStorage.addSkippedId(params.appId);
            }
            (navigation as any).replace("AppWebView", {
              appUrl: params.appUrl,
              name: params.name,
            });
          }}>서비스 시작하기</FilledButton>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between" as const,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  buttonWrapper: {
    paddingBottom: 16,
  },
  checkboxRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    marginBottom: 12,
  },
  checkboxLabel: {
    ...typo("Label", "Regular"),
  },
  appIcon: {
    width: 84,
    height: 84,
    borderRadius: 16,
    marginBottom: 16,
  },
  appName: {
    ...typo("Title2", "ExtraBold"),
    marginBottom: 4,
  },
  teamName: {
    ...typo("Body1", "SemiBold"),
    marginBottom: 24,
  },
  subTitle: {
    ...typo("Body1", "SemiBold"),
    marginBottom: 2,
  },
  description: {
    ...typo("Body2", "Regular"),
  },
});
