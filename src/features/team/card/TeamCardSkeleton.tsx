import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { Skeleton } from "@shared/ui";
import { shapes } from "@shared/tokens";

const CardSkeleton = ({ backgroundColor }: { backgroundColor: string }) => (
  <View style={[styles.card, { backgroundColor }]}>
    <Skeleton width={44} height={44} radius={22} />
    <View style={styles.info}>
      <Skeleton width={80} height={16} radius={4} />
      <Skeleton width={140} height={12} radius={4} />
    </View>
    <Skeleton width={28} height={12} radius={4} />
  </View>
);

export const TeamCardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <CardSkeleton backgroundColor={colors.background.surface} />
      <CardSkeleton backgroundColor={colors.background.surface} />
      <CardSkeleton backgroundColor={colors.background.surface} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: shapes.large,
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 6,
  },
});
