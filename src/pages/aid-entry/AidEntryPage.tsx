import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);

    // 링크에는 ID만 허용하고, 토큰을 전달할 서비스 주소는 서버에서 확인한다.
    getActiveInApp(route.params.appId)
      .then(app => {
        if (!active) return;
        if (!app) {
          setError("종료되었거나 이용할 수 없는 AID 서비스예요.");
          return;
        }
        navigation.replace("AppWebView", { appUrl: app.appUrl, name: app.name });
      })
      .catch(() => {
        if (active) setError("서비스를 불러오지 못했어요. 연결을 확인하고 다시 시도해주세요.");
      });

    return () => { active = false; };
  }, [route.params.appId, attempt, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <TopNavBar left={<TopNavBar.BackButton onPress={() => navigation.goBack()} />} />
      <View style={styles.content}>
        {error ? (
          <>
            <Text style={[styles.message, typo("Body1", "Medium"), { color: colors.text.primary }]}>
              {error}
            </Text>
            <FilledButton onPress={() => setAttempt(value => value + 1)}>다시 시도</FilledButton>
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.brand.primary} />
            <Text style={[typo("Body1", "Medium"), { color: colors.text.primary }]}>
              AID 서비스를 열고 있어요
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 20 },
  message: { textAlign: "center" },
});
