import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@shared/theme";
import { shapes } from "@shared/tokens";
import { Divider, Skeleton } from "@shared/ui";

const SKELETON_ROW_COUNT = 6;

export const WidgetSettingSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Skeleton width={260} height={16} radius={4} />
      <View style={[styles.card, { backgroundColor: colors.background.surface }]}>
        {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
          <React.Fragment key={index}>
            <View style={styles.row}>
              <Skeleton width={44} height={44} radius={14} />
              <View style={styles.textGroup}>
                <Skeleton width={96} height={18} radius={4} />
                <Skeleton width={160} height={14} radius={4} />
              </View>
              <Skeleton width={28} height={28} radius={shapes.extraSmall} />
            </View>
            {index < SKELETON_ROW_COUNT - 1 ? (
              <Divider marginHorizontal={0} marginVertical={0} />
            ) : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    borderRadius: shapes.large,
    paddingHorizontal: 16,
    paddingVertical: 4,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  textGroup: {
    flex: 1,
    gap: 6,
  },
});
