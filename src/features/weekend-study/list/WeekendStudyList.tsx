import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { shapes } from "@shared/tokens";
import { EmptyState, FilledButton, useOverlay } from "@shared/ui";
import { FullMoonFace } from "@shared/icons/illustration";
import { WeekendStudyCard } from "../card/WeekendStudyCard";
import { WeekendStudyCardSkeleton } from "../card/WeekendStudyCardSkeleton";
import { useWeekendStudyList } from "../hooks/useWeekendStudyList";
import { formatDate } from "../lib/date";
import { formatPeriods } from "../lib/period";
import { WeekendStudyCancelDialog } from "./WeekendStudyCancelDialog";

interface WeekendStudyListProps {
  isOpen: boolean;
  onApply: () => void;
}

interface WeekendStudyListErrorProps {
  onRetry: () => void;
}

const WeekendStudyListError = ({ onRetry }: WeekendStudyListErrorProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.stateCard, { backgroundColor: colors.background.surface }]}>
      <EmptyState
        icon={<FullMoonFace size={36} />}
        message="신청 내역을 불러올 수 없어요."
        cta={
          <FilledButton role="assistive" size="large" display="fill" onPress={onRetry}>
            다시 시도
          </FilledButton>
        }
      />
    </View>
  );
};

const WeekendStudyListComponent = ({ isOpen, onApply }: WeekendStudyListProps) => {
  const { colors } = useTheme();
  const overlay = useOverlay();
  const items = useWeekendStudyList();

  const handleOpenCancelDialog = useCallback(
    (id: string) => {
      overlay.open(({ isOpen: dialogOpen, close, exit, setDimClickHandler }) => (
        <WeekendStudyCancelDialog
          id={id}
          isOpen={dialogOpen}
          close={close}
          exit={exit}
          setDimClickHandler={setDimClickHandler}
        />
      ));
    },
    [overlay],
  );

  if (items.length === 0) {
    return (
      <View style={[styles.stateCard, { backgroundColor: colors.background.surface }]}>
        <EmptyState
          icon={<FullMoonFace size={36} />}
          message="아직 신청한 주말 자습이 없어요."
          cta={
            <FilledButton
              role="assistive"
              size="large"
              display="fill"
              disabled={!isOpen}
              onPress={onApply}
            >
              주말 자습 신청하기
            </FilledButton>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <WeekendStudyCard
          key={item.id}
          title="개별 자습"
          rows={[
            { label: "날짜", value: formatDate(item.date) },
            { label: "시간", value: formatPeriods(item.periods) },
          ]}
          onDelete={isOpen ? () => handleOpenCancelDialog(item.id) : undefined}
        />
      ))}
    </View>
  );
};

export const WeekendStudyList = Object.assign(WeekendStudyListComponent, {
  Skeleton: WeekendStudyCardSkeleton,
  Error: WeekendStudyListError,
});

const styles = StyleSheet.create({
  stateCard: {
    padding: 16,
    borderRadius: shapes.large,
  },
  list: {
    gap: 12,
  },
});
