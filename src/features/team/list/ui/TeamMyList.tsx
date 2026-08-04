import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { shapes } from "@shared/tokens";
import { EmptyState } from "@shared/ui";
import { Handshake } from "@shared/icons/illustration";
import { TeamCard } from "@entities/team";
import { useTeamDetailNavigation } from "../../detail";
import { useMyTeamsSuspense } from "../model/useTeamListSuspense";

export const TeamMyList = () => {
  const { colors } = useTheme();
  const items = useMyTeamsSuspense();
  const handlePress = useTeamDetailNavigation();

  if (items.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.background.surface }]}>
        <EmptyState icon={<Handshake size={36} />} message="아직 소속된 팀이 없어요." />
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <TeamCard key={item.publicId} item={item} onPress={handlePress} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: shapes.large,
  },
  list: {
    gap: 12,
  },
});
