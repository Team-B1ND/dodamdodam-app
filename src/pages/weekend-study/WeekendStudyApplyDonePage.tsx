import React, { useCallback, useEffect } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDate, formatPeriods } from "@features/weekend-study";
import { Checkmark } from "@shared/icons/mono";
import { useTheme } from "@shared/theme";
import { shapes, typo } from "@shared/tokens";
import { FilledButton, TopNavBar } from "@shared/ui";
import type { WeekendStudyApplyDoneParams } from "./types";

type WeekendStudyApplyDoneStackParamList = {
  WeekendStudy: undefined;
  WeekendStudyApplyDone: WeekendStudyApplyDoneParams;
};

type WeekendStudyApplyDoneNavigation = StackNavigationProp<
  WeekendStudyApplyDoneStackParamList,
  "WeekendStudyApplyDone"
>;
type WeekendStudyApplyDoneRoute = RouteProp<
  WeekendStudyApplyDoneStackParamList,
  "WeekendStudyApplyDone"
>;

export const WeekendStudyApplyDonePage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<WeekendStudyApplyDoneNavigation>();
  const { params } = useRoute<WeekendStudyApplyDoneRoute>();

  const handleConfirm = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.pop();
    } else {
      navigation.navigate("WeekendStudy");
    }
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleConfirm();
      return true;
    });
    return () => subscription.remove();
  }, [handleConfirm]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <TopNavBar>
        <TopNavBar.Title hasBackButton>신청 완료</TopNavBar.Title>
      </TopNavBar>

      <View style={styles.content}>
        <View style={styles.hero}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.status.success },
            ]}
          >
            <Checkmark size={24} color={colors.static.white} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            주말 자습을 신청했어요
          </Text>
        </View>

        <View
          style={[styles.card, { backgroundColor: colors.background.surface }]}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text.tertiary }]}>
              날짜
            </Text>
            <Text style={[styles.infoValue, { color: colors.text.primary }]}>
              {formatDate(params.date)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text.tertiary }]}>
              시간
            </Text>
            <Text style={[styles.infoValue, { color: colors.text.primary }]}>
              {formatPeriods(params.periods)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <FilledButton size="large" display="fill" onPress={handleConfirm}>
          확인
        </FilledButton>
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
    paddingHorizontal: 16,
    paddingTop: 48,
    gap: 28,
  },
  hero: {
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typo("Heading2", "Bold"),
  },
  card: {
    borderRadius: shapes.large,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    ...typo("Body2", "Medium"),
  },
  infoValue: {
    ...typo("Body2", "Medium"),
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
