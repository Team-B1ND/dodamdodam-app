import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Crown } from "@shared/icons/mono";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import type { TeamMember } from "../types";
import { TeamAvatar } from "./TeamAvatar";

interface TeamMemberRowProps {
  member: TeamMember;
}

export const TeamMemberRow = ({ member }: TeamMemberRowProps) => {
  const { colors } = useTheme();

  const statusText = member.isAccept
    ? member.student
      ? `${member.student.grade}-${member.student.room}`
      : ""
    : "초대 중";

  return (
    <View style={styles.container}>
      <TeamAvatar imageUrl={member.profileImage} size={36} />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={[styles.memberName, { color: colors.text.primary }]}>
            {member.name}
          </Text>
          {member.isOwner && <Crown size={14} color={colors.status.warning} />}
        </View>
      </View>
      <Text style={[styles.memberGrade, { color: colors.text.secondary }]}>
        {statusText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberName: {
    ...typo("Body1", "Bold"),
  },
  memberGrade: {
    ...typo("Label", "Medium"),
  },
});
