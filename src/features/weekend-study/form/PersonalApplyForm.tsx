import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { FilledButton } from "@shared/ui";
import { useWeekendStudyDeadline } from "../hooks/useWeekendStudyDeadline";
import {
  useWeekendStudyMyPersonal,
  useWeekendStudyMyProject,
} from "../hooks/useWeekendStudyList";
import { useWeekendStudyPersonalApply } from "../hooks/useWeekendStudyPersonalApply";
import { formatDate, getUpcomingSunday } from "../lib/date";
import {
  DEADLINE_CLOSED_MESSAGE,
  formatDeadlineNotice,
} from "../lib/deadline";
import { PersonalPeriodPicker } from "./PersonalPeriodPicker";

const EMPTY_PERIOD_ERROR = "시간을 1개 이상 선택하세요.";

export interface PersonalApplyFormProps {
  onSuccess: (result: { date: string; periods: number[] }) => void;
}

export const PersonalApplyForm = ({ onSuccess }: PersonalApplyFormProps) => {
  const { colors } = useTheme();
  const targetDate = useMemo(() => getUpcomingSunday(), []);

  const { deadline, isOpen } = useWeekendStudyDeadline();
  const { data: myPersonal = [] } = useWeekendStudyMyPersonal();
  const { data: myProject = [] } = useWeekendStudyMyProject();
  const { apply, isLoading } = useWeekendStudyPersonalApply();

  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const appliedPeriods = useMemo(() => {
    const set = new Set<number>();

    for (const item of myPersonal) {
      if (item.date === targetDate) {
        for (const period of item.periods) set.add(period);
      }
    }

    for (const item of myProject) {
      if (item.date === targetDate) {
        for (const period of item.periods) set.add(period);
      }
    }

    return set;
  }, [myPersonal, myProject, targetDate]);

  // 409 재조회 등으로 이미 신청된 교시가 갱신되면 선택 목록에서 제외한다.
  useEffect(() => {
    setSelectedPeriods((prev) => {
      const next = prev.filter((period) => !appliedPeriods.has(period));
      return next.length === prev.length ? prev : next;
    });
  }, [appliedPeriods]);

  const handleTogglePeriod = useCallback(
    (period: number) => {
      if (!isOpen || appliedPeriods.has(period)) return;

      setSelectedPeriods((prev) => {
        const exists = prev.includes(period);
        const next = exists
          ? prev.filter((p) => p !== period)
          : [...prev, period];
        if (next.length > 0) setValidationError(null);
        return next;
      });
    },
    [isOpen, appliedPeriods],
  );

  const handleSubmit = useCallback(async () => {
    if (!isOpen || isLoading) return;

    const periods = selectedPeriods
      .filter((period) => !appliedPeriods.has(period))
      .sort((a, b) => a - b);

    if (periods.length === 0) {
      setValidationError(EMPTY_PERIOD_ERROR);
      return;
    }

    setValidationError(null);
    const succeeded = await apply({ date: targetDate, periods });
    if (succeeded) {
      onSuccess({ date: targetDate, periods });
    }
  }, [isOpen, isLoading, selectedPeriods, appliedPeriods, apply, targetDate, onSuccess]);

  const noticeText = !isOpen
    ? DEADLINE_CLOSED_MESSAGE
    : deadline
      ? formatDeadlineNotice(deadline)
      : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {noticeText ? (
          <Text
            style={[
              styles.notice,
              { color: isOpen ? colors.text.placeholder : colors.status.error },
            ]}
          >
            {noticeText}
          </Text>
        ) : null}

        <View style={styles.dateRow}>
          <Text style={[styles.dateLabel, { color: colors.text.tertiary }]}>
            날짜
          </Text>
          <Text style={[styles.dateValue, { color: colors.brand.primary }]}>
            {formatDate(targetDate)}
          </Text>
        </View>

        <PersonalPeriodPicker
          selectedPeriods={selectedPeriods}
          appliedPeriods={appliedPeriods}
          disabled={!isOpen}
          errorMessage={isOpen ? validationError : null}
          onToggle={handleTogglePeriod}
        />
      </ScrollView>

      <View style={styles.footer}>
        <FilledButton
          size="large"
          display="fill"
          disabled={!isOpen}
          isLoading={isLoading}
          onPress={handleSubmit}
        >
          자습 신청하기
        </FilledButton>
      </View>
    </View>
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
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 20,
  },
  notice: {
    ...typo("Caption2", "Regular"),
    lineHeight: 18,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  dateLabel: {
    ...typo("Headline", "Medium"),
  },
  dateValue: {
    ...typo("Headline", "Regular"),
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
