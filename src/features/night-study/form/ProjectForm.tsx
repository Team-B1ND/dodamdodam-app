import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TextField, FilledButton } from "@shared/ui";
import { People, XmarkCircle } from "@shared/icons/mono";
import { DatePickerRow } from "@features/out-sleeping";
import { TimeSlotPicker, type TimeSlot } from "./TimeSlotPicker";
import type { SelectedNightStudyTeam, StudentMember } from "../hooks/useNightStudyForm";
import { StudentAvatar } from "../student/StudentAvatar";

interface ProjectFormProps {
  common: {
    timeSlot: TimeSlot;
    setTimeSlot: (slot: TimeSlot) => void;
  };
  project: {
    projectDate: Date;
    setProjectDate: (date: Date) => void;
    projectName: string;
    setProjectName: (text: string) => void;
    projectDescription: string;
    setProjectDescription: (text: string) => void;
    members: StudentMember[];
    addMember: (member: StudentMember) => void;
    removeMember: (id: string) => void;
    teams: SelectedNightStudyTeam[];
    addTeam: (team: SelectedNightStudyTeam) => void;
    removeTeam: (id: string) => void;
    removeTeamMember: (teamId: string, memberId: string) => void;
  };
  onAddMember?: () => void;
  onAddTeam?: () => void;
}

export const ProjectForm = ({ common, project, onAddMember, onAddTeam }: ProjectFormProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.form}>
      <TextField label="프로젝트명" value={project.projectName} onChangeText={project.setProjectName} />
      <TextField label="프로젝트 개요" value={project.projectDescription} onChangeText={project.setProjectDescription} />
      <TimeSlotPicker value={common.timeSlot} onChange={common.setTimeSlot} />
      <DatePickerRow label="날짜" date={project.projectDate} onChangeDate={project.setProjectDate} />

      <View style={styles.actionRow}>
        <View style={styles.action}>
          <FilledButton
            size="large"
            display="fill"
            role="primary"
            onPress={onAddMember}
          >
            학생추가
          </FilledButton>
        </View>
        <View style={styles.action}>
          <FilledButton
            size="large"
            display="fill"
            role="primary"
            onPress={onAddTeam}
          >
            팀 추가
          </FilledButton>
        </View>
      </View>

      {project.teams.map((team) => (
        <View
          key={team.id}
          style={[styles.teamPanel, { backgroundColor: colors.background.surface }]}
        >
          <View style={styles.teamHeader}>
            <View style={styles.teamTitle}>
              <People size={17} color={colors.text.placeholder} />
              <Text style={[styles.teamLabel, { color: colors.text.placeholder }]}>
                {team.name} 팀 - {team.members.length}명
              </Text>
            </View>
            <Pressable hitSlop={8} onPress={() => project.removeTeam(team.id)}>
              <XmarkCircle size={16} color={colors.text.placeholder} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberList}>
            {team.members.map((member) => (
              <MemberAvatar
                key={member.id}
                member={member}
                onRemove={() => project.removeTeamMember(team.id, member.id)}
              />
            ))}
          </ScrollView>
        </View>
      ))}

      {project.members.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.individualList}
        >
          {project.members.map((member) => (
            <MemberAvatar
              key={member.id}
              member={member}
              onRemove={() => project.removeMember(member.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  form: { gap: 12 },
  actionRow: { flexDirection: "row", gap: 20 },
  action: { flex: 1 },
  teamPanel: {
    minHeight: 104,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  teamLabel: {
    ...typo("Caption2", "Regular"),
  },
  memberList: {
    gap: 16,
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  individualList: {
    gap: 12,
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  memberItem: {
    alignItems: "center",
    gap: 4,
    width: 48,
  },
  removeButton: {
    position: "absolute",
    right: -5,
    top: -5,
  },
  memberName: {
    ...typo("Caption1", "Bold"),
    textAlign: "center",
  },
});

const MemberAvatar = ({
  member,
  onRemove,
}: {
  member: StudentMember;
  onRemove?: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.memberItem}>
      <View>
        <StudentAvatar size={38} profileImage={member.profileImage} />
        {onRemove && (
          <Pressable hitSlop={6} style={styles.removeButton} onPress={onRemove}>
            <XmarkCircle size={16} color={colors.text.tertiary} />
          </Pressable>
        )}
      </View>
      <Text numberOfLines={1} style={[styles.memberName, { color: colors.text.secondary }]}>
        {member.name}
      </Text>
    </View>
  );
};
