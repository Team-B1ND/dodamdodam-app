import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { shapes } from "@shared/tokens";
import { Divider, Skeleton } from "@shared/ui";

export const WeekendStudyCardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.background.surface }]}>
      <Skeleton width={96} height={22} radius={6} />
      <Divider marginHorizontal={0} marginVertical={0} />
      <View style={styles.rows}>
        <View style={styles.row}>
          <Skeleton width={40} height={16} radius={4} />
          <Skeleton width={108} height={16} radius={4} />
        </View>
        <View style={styles.row}>
          <Skeleton width={40} height={16} radius={4} />
          <Skeleton width={88} height={16} radius={4} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: shapes.large,
    gap: 12,
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
