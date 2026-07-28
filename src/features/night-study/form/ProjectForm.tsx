import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TextField, FilledButton, Avatar } from "@shared/ui";
import { XmarkCircle } from "@shared/icons/mono";
import { DatePickerRow } from "@features/out-sleeping";
import { TimeSlotPicker, type TimeSlot } from "./TimeSlotPicker";
import type { StudentMember } from "../hooks/useNightStudyForm";

interface ProjectFormProps {
  common: {
    timeSlot: TimeSlot;
    setTimeSlot: (slot: TimeSlot) => void;
    startDate: Date;
    setStartDate: (date: Date) => void;
    endDate: Date;
    setEndDate: (date: Date) => void;
  };
  project: {
    projectName: string;
    setProjectName: (text: string) => void;
    projectDescription: string;
    setProjectDescription: (text: string) => void;
    members: StudentMember[];
    addMember: (member: StudentMember) => void;
    removeMember: (id: string) => void;
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
      <DatePickerRow label="시작 날짜" date={common.startDate} onChangeDate={common.setStartDate} />
      <DatePickerRow label="종료 날짜" date={common.endDate} onChangeDate={common.setEndDate} />

      <View style={styles.actionRow}>
        <View style={styles.action}>
          <FilledButton
            size="large"
            display="fill"
            role="assistive"
            onPress={onAddMember}
          >
            학생추가
          </FilledButton>
        </View>
        <View style={styles.action}>
          <FilledButton
            size="large"
            display="fill"
            role="assistive"
            onPress={onAddTeam}
          >
            팀 추가
          </FilledButton>
        </View>
      </View>

      {project.members.length > 0 && (
        <View style={[styles.memberPanel, { backgroundColor: colors.background.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberList}>
            {project.members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View>
                  <Avatar size={38} />
                  <Pressable
                    hitSlop={6}
                    style={styles.removeButton}
                    onPress={() => project.removeMember(member.id)}
                  >
                    <XmarkCircle size={16} color={colors.text.tertiary} />
                  </Pressable>
                </View>
                <Text numberOfLines={1} style={[styles.memberName, { color: colors.text.secondary }]}>
                  {member.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  form: { gap: 12 },
  actionRow: { flexDirection: "row", gap: 20 },
  action: { flex: 1 },
  memberPanel: { borderRadius: 12, padding: 8 },
  memberList: { gap: 12, paddingTop: 8 },
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
