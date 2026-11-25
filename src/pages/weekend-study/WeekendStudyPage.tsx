import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QueryErrorResetBoundary, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { RefreshView, TopNavBar } from "@shared/ui";
import { Plus } from "@shared/icons/mono";
import { weekendStudyQueryKeys } from "@entities/weekend-study";
import {
  DEADLINE_CLOSED_MESSAGE,
  WeekendStudyErrorBoundary,
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
  const [hasListError, setHasListError] = useState(false);
  const hasListErrorRef = useRef(false);
  const resetRef = useRef<(() => void) | null>(null);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleApply = useCallback(() => {
    navigation.navigate("WeekendStudyApply");
  }, [navigation]);

  const handleListError = useCallback(() => {
    hasListErrorRef.current = true;
    setHasListError(true);
  }, []);

  // 오류 화면에서 당겨서 새로고침하면 캐시가 초기화되므로 에러 경계도 함께 복구한다.
  useEffect(() => {
    if (!hasListError) return;

    return queryClient.getQueryCache().subscribe((event) => {
      if (!hasListErrorRef.current || event.type !== "updated") return;
      const key = event.query.queryKey;
      if (
        key.length !== weekendStudyQueryKeys.myPersonal.length ||
        weekendStudyQueryKeys.myPersonal.some((part, index) => key[index] !== part)
      ) {
        return;
      }
      if (event.query.state.status === "pending") {
        hasListErrorRef.current = false;
        resetRef.current?.();
        setHasListError(false);
        setRetryKey((prev) => prev + 1);
      }
    });
  }, [hasListError, queryClient]);

  // 목록 조회 실패 상태로 화면을 벗어나면 캐시된 오류를 비워 재진입 시 바로 재조회한다.
  useEffect(() => {
    return () => {
      if (
        queryClient.getQueryState(weekendStudyQueryKeys.myPersonal)?.status ===
        "error"
      ) {
        queryClient.removeQueries({
          queryKey: weekendStudyQueryKeys.myPersonal,
        });
      }
    };
  }, [queryClient]);

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
          {({ reset }) => {
            resetRef.current = reset;
            return (
              <WeekendStudyErrorBoundary
                key={retryKey}
                onError={handleListError}
                fallback={
                  <WeekendStudyList.Error
                    onRetry={() => {
                      hasListErrorRef.current = false;
                      setHasListError(false);
                      reset();
                      void queryClient.resetQueries({
                        queryKey: weekendStudyQueryKeys.myPersonal,
                      });
                      void queryClient.resetQueries({
                        queryKey: weekendStudyQueryKeys.deadline,
                      });
                      setRetryKey((prev) => prev + 1);
                    }}
                  />
                }
              >
                <Suspense fallback={<WeekendStudyList.Skeleton />}>
                  <WeekendStudyList isOpen={isOpen} onApply={handleApply} />
                </Suspense>
              </WeekendStudyErrorBoundary>
            );
          }}
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
