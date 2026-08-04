import React, { Suspense } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TopNavBar, Divider, Skeleton } from "@shared/ui";
import { Crown } from "@shared/icons/mono";
import { useTeamMembersSuspense } from "@features/team";
import { TeamAvatar, type Team, type TeamMember } from "@entities/team";

export interface TeamDetailParams {
  team: Team;
}

type TeamDetailRouteProp = RouteProp<{ TeamDetail: TeamDetailParams }, "TeamDetail">;

const TeamMemberRow = ({ member }: { member: TeamMember }) => {
  const { colors } = useTheme();

  const statusText = member.isAccept
    ? member.student
      ? `${member.student.grade}-${member.student.room}`
      : ""
    : "초대 중";

  return (
    <View style={styles.memberRow}>
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

const TeamDetailContent = ({ team }: { team: Team }) => {
  const { colors } = useTheme();
  const members = useTeamMembersSuspense(team.publicId);
  const acceptedCount = members.filter((member) => member.isAccept).length;

  return (
    <>
      <View style={styles.header}>
        <TeamAvatar imageUrl={team.imageUrl} size={64} />
        <Text style={[styles.name, { color: colors.text.primary }]}>{team.name}</Text>
        {team.description ? (
          <Text style={[styles.description, { color: colors.text.tertiary }]}>
            {team.description}
          </Text>
        ) : null}
        <Text style={[styles.memberCount, { color: colors.text.secondary }]}>
          {acceptedCount}명
        </Text>
      </View>
      <Divider />
      <View style={styles.memberList}>
        {members.map((member) => (
          <TeamMemberRow key={member.userId} member={member} />
        ))}
      </View>
    </>
  );
};

const TeamDetailSkeleton = () => (
  <View style={styles.header}>
    <Skeleton width={64} height={64} radius={32} />
    <Skeleton width={100} height={20} radius={4} />
    <Skeleton width={160} height={14} radius={4} />
  </View>
);

export const TeamDetailPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute<TeamDetailRouteProp>();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={() => navigation.goBack()} />} />
      <View style={styles.content}>
        <Suspense fallback={<TeamDetailSkeleton />}>
          <TeamDetailContent team={params.team} />
        </Suspense>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
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
    paddingVertical: 12,
    gap: 4,
  },
  memberRow: {
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
