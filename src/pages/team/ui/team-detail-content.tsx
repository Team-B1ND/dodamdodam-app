import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { TeamAvatar, TeamMemberRow, type Team } from "@entities/team";
import {
  TeamInvitationActions,
  TeamManageActions,
  useTeamMembersSuspense,
  useTeamViewerRole,
} from "@features/team";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { Divider } from "@shared/ui";

interface TeamDetailContentProps {
  team: Team;
}

export const TeamDetailContent = ({ team }: TeamDetailContentProps) => {
  const { colors } = useTheme();
  const members = useTeamMembersSuspense(team.publicId);
  const viewerRole = useTeamViewerRole(members);
  const acceptedCount = members.filter((member) => member.isAccept).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TeamAvatar imageUrl={team.imageUrl} size={64} />
        <Text selectable style={[styles.name, { color: colors.text.primary }]}>
          {team.name}
        </Text>
        {team.description ? (
          <Text
            selectable
            style={[styles.description, { color: colors.text.tertiary }]}
          >
            {team.description}
          </Text>
        ) : null}
        <Text
          selectable
          style={[styles.memberCount, { color: colors.text.secondary }]}
        >
          {acceptedCount}명
        </Text>
      </View>
      <Divider />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.memberList}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {members.map((member) => (
          <TeamMemberRow key={member.userId} member={member} />
        ))}
      </ScrollView>
      {viewerRole === "invited" ? (
        <TeamInvitationActions publicId={team.publicId} />
      ) : (
        <TeamManageActions team={team} role={viewerRole} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
  name: {
    ...typo("Heading2", "Bold"),
  },
  description: {
    ...typo("Body1", "Medium"),
  },
  memberCount: {
    ...typo("Label", "Medium"),
    marginTop: 4,
  },
  memberList: {
    flexGrow: 1,
    paddingVertical: 12,
    gap: 4,
  },
});
