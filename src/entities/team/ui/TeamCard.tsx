import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { typo, shapes } from "@shared/tokens";
import type { Team } from "../types";
import { TeamAvatar } from "./TeamAvatar";

interface TeamCardProps {
  item: Team;
  onPress?: (team: Team) => void;
}

export const TeamCard = ({ item, onPress }: TeamCardProps) => {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.background.surface }]}
      onPress={() => onPress?.(item)}
    >
      <TeamAvatar imageUrl={item.imageUrl} size={44} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text.primary }]}>
          {item.name}
        </Text>
        {item.description ? (
          <Text
            style={[styles.description, { color: colors.text.tertiary }]}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: shapes.large,
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typo("Body1", "Bold"),
  },
  description: {
    ...typo("Label", "Medium"),
  },
});
