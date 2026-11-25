import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "@app/navigation";
import { PersonalApplyForm } from "@features/weekend-study";
import { useTheme } from "@shared/theme";
import { TopNavBar } from "@shared/ui";

type WeekendStudyApplyNavigation = StackNavigationProp<
  RootStackParamList,
  "WeekendStudyApply"
>;

export const WeekendStudyApplyPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<WeekendStudyApplyNavigation>();

  const handleApplySuccess = useCallback(
    (result: { date: string; periods: number[] }) => {
      navigation.replace("WeekendStudyApplyDone", result);
    },
    [navigation],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={() => navigation.goBack()} />}>
        <TopNavBar.Title hasBackButton>주말 자습 신청하기</TopNavBar.Title>
      </TopNavBar>

      {/* 실 대여 탭이 추가되면 이 자리에 SegmentedButton으로 폼을 전환한다. */}
      <PersonalApplyForm onSuccess={handleApplySuccess} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
