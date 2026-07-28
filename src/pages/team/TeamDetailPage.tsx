import React, { Suspense } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { typo, shapes } from "@shared/tokens";
import { TopNavBar, Avatar, Divider, Skeleton } from "@shared/ui";
import { Crown } from "@shared/icons/mono";
import { useTeamDetailSuspense } from "@features/team/hooks/useTeamDetailSuspense";
import type { TeamMember } from "@entities/team/types";

export interface TeamDetailParams {
  teamId: string;
}

type TeamDetailRouteProp = RouteProp<{ TeamDetail: TeamDetailParams }, "TeamDetail">;

const TeamMemberRow = ({ member }: { member: TeamMember }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.memberRow}>
      <Avatar size={36} />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={[styles.memberName, { color: colors.text.primary }]}>
            {member.name}
          </Text>
          {member.role === "LEADER" && <Crown size={14} color={colors.status.warning} />}
        </View>
      </View>
      <Text style={[styles.memberGrade, { color: colors.text.secondary }]}>
        {member.grade}-{member.room}
      </Text>
    </View>
  );
};

const TeamDetailContent = ({ teamId }: { teamId: string }) => {
  const { colors } = useTheme();
  const team = useTeamDetailSuspense(teamId);

  if (!team) {
    return (
      <Text style={[styles.emptyMessage, { color: colors.text.tertiary }]}>
        팀 정보를 찾을 수 없어요.
      </Text>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <Avatar size={64} />
        <Text style={[styles.name, { color: colors.text.primary }]}>{team.name}</Text>
        <Text style={[styles.introduction, { color: colors.text.tertiary }]}>
          {team.introduction}
        </Text>
        <Text style={[styles.memberCount, { color: colors.text.secondary }]}>
          {team.memberCount}명
        </Text>
      </View>
      <Divider />
      <View style={styles.memberList}>
        {team.members.map((member) => (
          <TeamMemberRow key={member.publicId} member={member} />
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
          <TeamDetailContent teamId={params.teamId} />
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
  introduction: {
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
  emptyMessage: {
    ...typo("Body1", "Medium"),
    textAlign: "center",
    paddingVertical: 48,
  },
});
