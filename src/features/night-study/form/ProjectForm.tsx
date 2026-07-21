import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TextField, FilledButton, Avatar } from "@shared/ui";
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
}

export const ProjectForm = ({ common, project, onAddMember }: ProjectFormProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.form}>
      <TextField label="프로젝트명" value={project.projectName} onChangeText={project.setProjectName} />
      <TextField label="프로젝트 개요" value={project.projectDescription} onChangeText={project.setProjectDescription} />
      <TimeSlotPicker value={common.timeSlot} onChange={common.setTimeSlot} />
      <DatePickerRow label="시작 날짜" date={common.startDate} onChangeDate={common.setStartDate} />
      <DatePickerRow label="종료 날짜" date={common.endDate} onChangeDate={common.setEndDate} />

      {project.members.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberList}>
          {project.members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <Avatar size={38} />
              <Text style={[styles.memberName, { color: colors.text.secondary }]}>
                {member.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <FilledButton size="medium" display="fill" onPress={onAddMember}>
        학생추가
      </FilledButton>
    </View>
  );
};

const styles = StyleSheet.create({
  form: { gap: 12 },
  memberList: {
    gap: 12,
  },
  memberItem: {
    alignItems: "center",
    gap: 4,
    width: 48,
  },
  memberName: {
    ...typo("Caption1", "Bold"),
    textAlign: "center",
  },
});
