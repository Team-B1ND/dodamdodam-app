import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useTheme } from "@shared/theme";
import { typo, shapes } from "@shared/tokens";
import { Tag, Divider, Progress, IconButton } from "@shared/ui";
import { Trash } from "@shared/icons/mono";
import { calcProgress, calcRemainingTime } from "@shared/utils";
import type { TagColor } from "@shared/ui/tag/Tag";
import type { OutSleeping, OutSleepingStatus } from "@entities/out-sleeping/types";
import { OUT_SLEEPING_REASON_LABEL } from "@entities/out-sleeping/types";
import { formatDate } from "./utils/formatDate";

interface OutSleepingCardProps {
  item: OutSleeping;
  onDelete?: (publicId: string) => void;
}

const STATUS_MAP: Record<OutSleepingStatus, { label: string; color: TagColor }> = {
  ALLOWED: { label: "승인됨", color: "blue" },
  PENDING: { label: "대기 중", color: "default" },
  DENIED: { label: "거절됨", color: "red" },
};

export const OutSleepingCard = ({ item, onDelete }: OutSleepingCardProps) => {
  const { colors } = useTheme();
  const { label, color } = STATUS_MAP[item.status];
  const remaining = calcRemainingTime(item.startAt, item.endAt);
  const progress = calcProgress(item.startAt, item.endAt);

  return (
    <Animated.View
      style={[styles.card, { backgroundColor: colors.background.surface }]}
      layout={LinearTransition.duration(300)}
    >
      <View style={styles.header}>
        <Tag text={label} color={color} />
        {onDelete && (
          <IconButton
            icon={<Trash color={colors.text.secondary} />}
            size={34}
            iconSize={24}
            onPress={() => onDelete(item.publicId)}
          />
        )}
      </View>

      <Text style={[styles.description, { color: colors.text.primary }]}>
        {item.reasonType === "ETC" && item.reason
          ? item.reason
          : OUT_SLEEPING_REASON_LABEL[item.reasonType]}
      </Text>

      <Divider marginHorizontal={0} marginVertical={0} />

      {item.status !== "DENIED" && (
        <>
          <View style={styles.remainingRow}>
            <Text style={[styles.remainingText, { color: colors.text.primary }]}>
              {remaining}
            </Text>
            {remaining !== "시작 전" && remaining !== "종료됨" && (
              <Text style={[styles.remainingLabel, { color: colors.text.tertiary }]}>
                남음
              </Text>
            )}
          </View>
          <View style={styles.progressSection}>
            <Progress progress={progress} disabled={item.status === "PENDING"} />
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Text style={[styles.dateLabel, { color: colors.text.tertiary }]}>외출</Text>
                <Text style={[styles.dateValue, { color: colors.text.secondary }]}>
                  {formatDate(new Date(item.startAt))}
                </Text>
              </View>
              <View style={styles.dateItem}>
                <Text style={[styles.dateLabel, { color: colors.text.tertiary }]}>복귀</Text>
                <Text style={[styles.dateValue, { color: colors.text.secondary }]}>
                  {formatDate(new Date(item.endAt))}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {item.status === "DENIED" && (
        <View style={styles.dateItem}>
          <Text style={[styles.dateLabel, { color: colors.text.tertiary }]}>외출</Text>
          <Text style={[styles.dateValue, { color: colors.text.primary }]}>
            {formatDate(new Date(item.startAt))} ~ {formatDate(new Date(item.endAt))}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    paddingHorizontal: 12,
    borderRadius: shapes.large,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  description: {
    ...typo("Body1", "Medium"),
  },
  remainingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  remainingText: {
    ...typo("Heading2", "Bold"),
  },
  remainingLabel: {
    ...typo("Label", "Medium"),
    lineHeight: 20,
  },
  progressSection: {
    gap: 4,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateLabel: {
    ...typo("Label", "Medium"),
  },
  dateValue: {
    ...typo("Body1", "Medium"),
  },
});
