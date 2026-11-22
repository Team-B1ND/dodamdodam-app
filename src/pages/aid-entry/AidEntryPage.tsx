import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "@app/navigation/navigationTypes";
import { getActiveInApp } from "@entities/inapp/api/activeApps";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { FilledButton, TopNavBar } from "@shared/ui";

type Props = StackScreenProps<RootStackParamList, "AidEntry">;

export const AidEntryPage = ({ route, navigation }: Props) => {
  const { colors } = useTheme();
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<"unavailable" | "network" | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);

    // 링크에는 ID만 허용하고, 토큰을 전달할 서비스 주소는 서버에서 확인한다.
    getActiveInApp(route.params.appId)
      .then(app => {
        if (!active) return;
        if (!app) {
          setError("unavailable");
          return;
        }
        navigation.replace("AppWebView", { appUrl: app.appUrl, name: app.name });
      })
      .catch(() => {
        if (active) setError("network");
      });

    return () => { active = false; };
  }, [route.params.appId, attempt, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.body}>
        <View style={styles.content}>
          {error ? (
            <>
              <View style={[styles.unavailableIcon, { backgroundColor: colors.fill.secondary }]}>
                <View style={styles.badge}>
                  <Image source={require("./assets/unavailable_ring.png")} style={[styles.ring, { tintColor: colors.background.surface }]} />
                  <View style={styles.badgeCenter} />
                  <Image source={require("./assets/unavailable_warn.png")} style={styles.warning} />
                </View>
              </View>
              <Text accessibilityLiveRegion="polite" style={[typo("Body1", "Medium"), styles.message, { color: colors.text.tertiary }]}>
                {"지금은 이 서비스를 이용할 수 없어요.\n잠시 후 다시 시도해 주세요."}
              </Text>
              {error === "network" && (
                <FilledButton onPress={() => setAttempt(value => value + 1)}>다시 시도</FilledButton>
              )}
            </>
          ) : (
            <ActivityIndicator accessibilityLabel="AID 서비스를 열고 있어요" color={colors.brand.primary} />
          )}
        </View>
        <View style={styles.header}>
          <TopNavBar left={<TopNavBar.BackButton onPress={() => navigation.goBack()} />} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 24 },
  header: { position: "absolute", top: 0, left: 0, right: 0 },
  message: { textAlign: "center", fontSize: 16, lineHeight: 24 },
  unavailableIcon: { width: 80, height: 80, borderRadius: 20 },
  badge: { position: "absolute", right: -6, bottom: -6, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  ring: { width: 36, height: 36, position: "absolute" },
  badgeCenter: { width: 14, height: 14, backgroundColor: "white", position: "absolute" },
  warning: { width: 23, height: 23 },
});
