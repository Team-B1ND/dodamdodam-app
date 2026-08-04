import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { StudentAddSheet, type StudentMember } from "@features/night-study";
import { TeamApplyForm, useCreateTeam, type TeamFormImage } from "@features/team";
import { useTheme } from "@shared/theme";
import { FilledButton, TopNavBar } from "@shared/ui";

export const TeamCreatePage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const studentSheetRef = useRef<BottomSheetModal>(null);

  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamImage, setTeamImage] = useState<TeamFormImage>(null);
  const [teamMembers, setTeamMembers] = useState<StudentMember[]>([]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const { submit, isSubmitting } = useCreateTeam(goBack);

  const openStudentSheet = useCallback(() => {
    studentSheetRef.current?.present();
  }, []);

  const isValid =
    teamName.trim().length > 0 &&
    teamName.length <= 9 &&
    teamDescription.length <= 14;

  const handleSubmit = useCallback(() => {
    submit({
      name: teamName.trim(),
      description: teamDescription.trim(),
      image: teamImage,
      members: teamMembers,
    });
  }, [submit, teamName, teamDescription, teamImage, teamMembers]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />}>
        <TopNavBar.Title hasBackButton>팀 생성</TopNavBar.Title>
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
          teamMembers={teamMembers}
          onAddMemberPress={openStudentSheet}
        />
      </ScrollView>
      <View style={styles.submitArea}>
        <FilledButton
          size="large"
          display="fill"
          disabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
          onPress={handleSubmit}
        >
          팀 생성
        </FilledButton>
      </View>
      <StudentAddSheet
        sheetRef={studentSheetRef}
        selected={teamMembers}
        onConfirm={setTeamMembers}
      />
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
    marginTop: "auto",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
});
