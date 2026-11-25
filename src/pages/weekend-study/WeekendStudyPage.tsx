import React, { Suspense, useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QueryErrorResetBoundary, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { NetworkErrorBoundary, RefreshView, TopNavBar } from "@shared/ui";
import { Plus } from "@shared/icons/mono";
import { weekendStudyQueryKeys } from "@entities/weekend-study";
import {
  DEADLINE_CLOSED_MESSAGE,
  WeekendStudyList,
  useWeekendStudyDeadline,
} from "@features/weekend-study";

const REFRESH_QUERY_KEYS = [
  weekendStudyQueryKeys.myPersonal,
  weekendStudyQueryKeys.deadline,
] as const;

export const WeekendStudyPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { isOpen, isClosed } = useWeekendStudyDeadline();
  const [retryKey, setRetryKey] = useState(0);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleApply = useCallback(() => {
    navigation.navigate("WeekendStudyApply");
  }, [navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <TopNavBar
        left={<TopNavBar.BackButton onPress={handleGoBack} />}
        right={
          <TopNavBar.IconButton
            icon={<Plus />}
            disabled={!isOpen}
            onPress={handleApply}
          />
        }
      >
        <TopNavBar.Title hasBackButton>주말 자습</TopNavBar.Title>
      </TopNavBar>

      <RefreshView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        queryKeys={REFRESH_QUERY_KEYS}
      >
        {isClosed ? (
          <Text style={[styles.closedNotice, { color: colors.status.error }]}>
            {DEADLINE_CLOSED_MESSAGE}
          </Text>
        ) : null}

        <QueryErrorResetBoundary>
          {({ reset }) => (
            <NetworkErrorBoundary
              key={retryKey}
              fallback={
                <WeekendStudyList.Error
                  onRetry={() => {
                    reset();
                    void queryClient.resetQueries({
                      queryKey: weekendStudyQueryKeys.myPersonal,
                    });
                    setRetryKey((prev) => prev + 1);
                  }}
                />
              }
            >
              <Suspense fallback={<WeekendStudyList.Skeleton />}>
                <WeekendStudyList isOpen={isOpen} onApply={handleApply} />
              </Suspense>
            </NetworkErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </RefreshView>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  closedNotice: {
    ...typo("Caption2", "Medium"),
  },
});
