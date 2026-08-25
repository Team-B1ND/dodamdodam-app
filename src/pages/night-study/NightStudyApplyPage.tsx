import React, { useRef, useState, useCallback, useMemo } from "react";
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";
import { TopNavBar, FilledButton, SegmentedButton } from "@shared/ui";
import type { SegmentedButtonData } from "@shared/ui/buttons/SegmentedButton";
import {
  PersonalForm,
  ProjectForm,
  useNightStudyForm,
  useNightStudyPersonalApply,
  useNightStudyProjectApply,
  StudentAddSheet,
  TeamAddSheet,
} from "@features/night-study";

const makeSegments = (tab: string): SegmentedButtonData[] => [
  { text: "개인", value: "personal", isActive: tab === "personal" },
  { text: "프로젝트", value: "project", isActive: tab === "project" },
];

export const NightStudyApplyPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const initialTab = route.params?.tab ?? "personal";
  const studentSheetRef = useRef<BottomSheetModal>(null);
  const teamSheetRef = useRef<BottomSheetModal>(null);

  const [segments, setSegments] = useState(() => makeSegments(initialTab));
  const activeTab = segments.find((s) => s.isActive)?.value ?? "personal";
  const { common, personal, project } = useNightStudyForm();
  const { apply: applyPersonal, loading: personalLoading } = useNightStudyPersonalApply();
  const { apply: applyProject, loading: projectLoading } = useNightStudyProjectApply();
  const loading = activeTab === "personal" ? personalLoading : projectLoading;
  // 매 렌더 새 배열이 되면 StudentAddSheet의 선택/검색어가 초기화된다.
  const teamMemberIds = useMemo(
    () => project.teams.flatMap((team) => team.members.map((member) => member.id)),
    [project.teams],
  );

  const handleAddMember = useCallback(() => {
    studentSheetRef.current?.present();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (activeTab === "personal") {
      const success = await applyPersonal({
        reason: personal.reason,
        timeSlot: common.timeSlot,
        startDate: common.startDate,
        endDate: common.endDate,
        usePhone: personal.usePhone,
        phoneReason: personal.phoneReason,
      });
      if (success) navigation.goBack();
    } else {
      const mergedMembers = [
        ...project.members,
        ...project.teams.flatMap((team) => team.members),
      ].filter((member) => !member.isSelf).filter(
        (member, index, all) =>
          all.findIndex((candidate) => candidate.id === member.id) === index,
      );
      const success = await applyProject({
        projectName: project.projectName,
        projectDescription: project.projectDescription,
        timeSlot: common.timeSlot,
        // 하루짜리 신청이므로 시작/종료를 같은 날짜로 보낸다.
        startDate: project.projectDate,
        endDate: project.projectDate,
        members: mergedMembers,
        wishRoomId: project.wishRoom?.id,
      });
      if (success) navigation.goBack();
    }
  }, [activeTab, applyPersonal, applyProject, personal, project, common, navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom"]}
    >
      <TopNavBar
        left={<TopNavBar.BackButton onPress={() => navigation.goBack()} />}
      >
        <TopNavBar.Title hasBackButton>심야 자습 신청하기</TopNavBar.Title>
      </TopNavBar>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.inner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <SegmentedButton data={segments} setData={setSegments} />

          {activeTab === "personal" ? (
            <PersonalForm common={common} personal={personal} />
          ) : (
            <ProjectForm
              common={common}
              project={project}
              onAddMember={handleAddMember}
              onAddTeam={() => teamSheetRef.current?.present()}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <FilledButton size="large" display="fill" isLoading={loading} onPress={handleSubmit}>
          신청
        </FilledButton>
      </View>

      <StudentAddSheet
        sheetRef={studentSheetRef}
        selected={project.members}
        excludedIds={teamMemberIds}
        onConfirm={(members) => {
          project.members.forEach((m) => project.removeMember(m.id));
          members.forEach((m) => project.addMember(m));
        }}
      />
      <TeamAddSheet
        sheetRef={teamSheetRef}
        selectedTeamIds={project.teams.map((team) => team.id)}
        onConfirm={(teams) => {
          const teamMemberIds = new Set(
            teams.flatMap((team) => team.members.map((member) => member.id)),
          );
          project.members
            .filter((member) => teamMemberIds.has(member.id))
            .forEach((member) => project.removeMember(member.id));
          project.teams.forEach((team) => project.removeTeam(team.id));
          teams.forEach((team) => project.addTeam(team));
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
  scroll: { flex: 1 },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
