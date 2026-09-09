import React from "react";
import { View } from "react-native";
import { Skeleton } from "@shared/ui";
import { ICON_RADIUS, ICON_SIZE, styles } from "./styles";

const PLACEHOLDER_COUNT = 8;

export const InAppGridSkeleton = () => (
  <View style={styles.grid}>
    {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
      <View key={i} style={styles.cell}>
        <Skeleton width={ICON_SIZE} height={ICON_SIZE} radius={ICON_RADIUS} />
        <View style={styles.name}>
          <Skeleton width={44} height={12} radius={4} />
        </View>
      </View>
    ))}
  </View>
);
