import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { TeamCard, type Team } from "@entities/team";
import { Handshake } from "@shared/icons/illustration";
import { useTheme } from "@shared/theme";
import { shapes } from "@shared/tokens";
import { EmptyState } from "@shared/ui";

interface TeamListProps {
  items: Team[];
  emptyMessage: string;
  isFetchingNextPage: boolean;
  onTeamPress: (team: Team) => void;
}

export const TeamList = ({
  items,
  emptyMessage,
  isFetchingNextPage,
  onTeamPress,
}: TeamListProps) => {
  const { colors } = useTheme();

  if (items.length === 0) {
    return (
      <View
        style={[styles.card, { backgroundColor: colors.background.surface }]}
      >
        <EmptyState icon={<Handshake size={36} />} message={emptyMessage} />
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <TeamCard key={item.publicId} item={item} onPress={onTeamPress} />
      ))}
      {isFetchingNextPage ? (
        <ActivityIndicator style={styles.footer} color={colors.brand.primary} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: shapes.large,
  },
  footer: {
    paddingVertical: 16,
  },
});
