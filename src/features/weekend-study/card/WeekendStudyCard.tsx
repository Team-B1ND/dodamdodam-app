import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useTheme } from "@shared/theme";
import { typo, shapes } from "@shared/tokens";
import { Divider, IconButton } from "@shared/ui";
import { Trash } from "@shared/icons/mono";
import { WeekendStudyCardSkeleton } from "./WeekendStudyCardSkeleton";

export interface WeekendStudyCardRow {
  label: string;
  value: string;
}

export interface WeekendStudyCardProps {
  title: string;
  subtitle?: string;
  rows: WeekendStudyCardRow[];
  onDelete?: () => void;
}

const WeekendStudyCardComponent = ({
  title,
  subtitle,
  rows,
  onDelete,
}: WeekendStudyCardProps) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      style={[styles.card, { backgroundColor: colors.background.surface }]}
      layout={LinearTransition.duration(300)}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {onDelete ? (
          <IconButton
            icon={<Trash color={colors.text.secondary} />}
            size={32}
            iconSize={20}
            customStyle={styles.deleteButton}
            onPress={onDelete}
          />
        ) : null}
      </View>

      <Divider marginHorizontal={0} marginVertical={0} />

      <View style={styles.rows}>
        {rows.map((row, index) => (
          <View key={`${row.label}-${index}`} style={styles.row}>
            <Text style={[styles.label, { color: colors.text.tertiary }]}>
              {row.label}
            </Text>
            <Text style={[styles.value, { color: colors.text.primary }]}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

export const WeekendStudyCard = Object.assign(WeekendStudyCardComponent, {
  Skeleton: WeekendStudyCardSkeleton,
});

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: shapes.large,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typo("Body1", "SemiBold"),
  },
  subtitle: {
    ...typo("Caption1", "Medium"),
  },
  deleteButton: {
    marginVertical: -4,
    marginRight: -6,
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    ...typo("Label", "Medium"),
  },
  value: {
    ...typo("Label", "Medium"),
    flexShrink: 1,
    textAlign: "right",
  },
});
