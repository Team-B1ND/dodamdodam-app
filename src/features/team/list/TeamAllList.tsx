import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { shapes } from "@shared/tokens";
import { EmptyState } from "@shared/ui";
import { Handshake } from "@shared/icons/illustration";
import type { Team } from "@entities/team/types";
import { TeamCard } from "../card/TeamCard";
import { useAllTeamsSuspense } from "../hooks/useTeamListSuspense";

export const TeamAllList = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const items = useAllTeamsSuspense();

  const handlePress = useCallback(
    (team: Team) => navigation.navigate("TeamDetail", { teamId: team.id }),
    [navigation],
  );

  if (items.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.background.surface }]}>
        <EmptyState icon={<Handshake size={36} />} message="아직 등록된 팀이 없어요." />
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <TeamCard key={item.id} item={item} onPress={handlePress} />
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
