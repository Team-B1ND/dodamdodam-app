import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "@shared/ui";

export const TeamDetailSkeleton = () => (
  <View style={styles.header}>
    <Skeleton width={64} height={64} radius={32} />
    <Skeleton width={100} height={20} radius={4} />
    <Skeleton width={160} height={14} radius={4} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
});
