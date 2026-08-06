import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { StudentAddSheet, type StudentMember } from "@features/night-study";
import {
  TeamApplyForm,
  useTeamMembersSuspense,
  useUpdateTeam,
  type TeamFormImage,
} from "@features/team";
import type { Team } from "@entities/team";
import { useTheme } from "@shared/theme";
import { FilledButton, TopNavBar } from "@shared/ui";
import { TeamDetailSkeleton } from "./ui";

export interface TeamEditParams {
  team: Team;
}

type TeamEditRouteProp = RouteProp<{ TeamEdit: TeamEditParams }, "TeamEdit">;

interface TeamEditContentProps {
  team: Team;
  onBack: () => void;
  onUpdated: (team: Team) => void;
}

const TeamEditContent = ({ team, onBack, onUpdated }: TeamEditContentProps) => {
  const members = useTeamMembersSuspense(team.publicId);
  const studentSheetRef = useRef<BottomSheetModal>(null);
  const [teamName, setTeamName] = useState(() => team.name);
  const [teamDescription, setTeamDescription] = useState(() => team.description ?? "");
  const [teamImage, setTeamImage] = useState<TeamFormImage>(() =>
    team.imageUrl ? { type: "remote", url: team.imageUrl } : null,
  );
  const [selectedMembers, setSelectedMembers] = useState<StudentMember[]>([]);
  const updateTeam = useUpdateTeam({ onSuccess: onUpdated });
  const existingMemberIds = useMemo(
    () => members.map((member) => member.userId),
    [members],
  );

  const openStudentSheet = useCallback(() => {
    studentSheetRef.current?.present();
  }, []);

  const isValid =
    teamName.trim().length > 0 &&
    teamName.length <= 9 &&
    teamDescription.length <= 14;

  const handleSubmit = useCallback(() => {
    updateTeam.mutate({
      team,
      name: teamName.trim(),
      description: teamDescription.trim(),
      image: teamImage,
      members: selectedMembers,
    });
  }, [selectedMembers, team, teamDescription, teamImage, teamName, updateTeam]);

  return (
    <>
      <TopNavBar left={<TopNavBar.BackButton onPress={onBack} />}>
        <TopNavBar.Title hasBackButton>팀 수정</TopNavBar.Title>
      </TopNavBar>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TeamApplyForm
          teamName={teamName}
          onTeamNameChange={setTeamName}
          teamDescription={teamDescription}
          onTeamDescriptionChange={setTeamDescription}
          teamImage={teamImage}
          onTeamImageChange={setTeamImage}
          existingMembers={members}
          teamMembers={selectedMembers}
          onAddMemberPress={openStudentSheet}
        />
      </ScrollView>
      <View style={styles.submitArea}>
        <FilledButton
          size="large"
          display="fill"
          disabled={!isValid || updateTeam.isPending}
          isLoading={updateTeam.isPending}
          onPress={handleSubmit}
        >
          수정 완료
        </FilledButton>
      </View>
      <StudentAddSheet
        sheetRef={studentSheetRef}
        selected={selectedMembers}
        excludedIds={existingMemberIds}
        onConfirm={setSelectedMembers}
      />
    </>
  );
};

export const TeamEditPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { params } = useRoute<TeamEditRouteProp>();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleUpdated = useCallback(
    (team: Team) => navigation.popTo("TeamDetail", { team }),
    [navigation],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom"]}
    >
      <Suspense fallback={<TeamDetailSkeleton />}>
        <TeamEditContent
          key={params.team.publicId}
          team={params.team}
          onBack={goBack}
          onUpdated={handleUpdated}
        />
      </Suspense>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
