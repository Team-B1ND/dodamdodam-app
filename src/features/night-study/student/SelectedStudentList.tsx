import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { XmarkCircle } from "@shared/icons/mono";
import type { StudentMember } from "../hooks/useNightStudyForm";
import { StudentAvatar } from "./StudentAvatar";

interface SelectedStudentListProps {
  members: StudentMember[];
  onRemove: (id: string) => void;
}

export const SelectedStudentList = ({ members, onRemove }: SelectedStudentListProps) => {
  const { colors } = useTheme();

  if (members.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {members.map((member) => (
        <View key={member.id} style={styles.item}>
          <View>
            <StudentAvatar size={38} profileImage={member.profileImage} />
            <Pressable style={styles.removeButton} onPress={() => onRemove(member.id)}>
              <XmarkCircle size={16} color={colors.text.tertiary} />
            </Pressable>
          </View>
          <Text style={[styles.name, { color: colors.text.secondary }]}>
            {member.name}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  item: {
    alignItems: "center",
    gap: 2,
    width: 48,
    height: 80,
    paddingTop: 8,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    padding: 4,
  },
  name: {
    ...typo("Caption1", "Bold"),
    textAlign: "center",
  },
});
