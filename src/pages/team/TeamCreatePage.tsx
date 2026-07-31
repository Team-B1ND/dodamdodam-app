import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View } from "react-native";
import { useTheme } from "@shared/theme";
import { FilledButton, TopNavBar } from "@shared/ui";
import { useNavigation, useStateForPath } from "@react-navigation/native";
import { TeamApplyForm } from "@features/team/create/form/TeamApplyForm";
import { useState } from "react";
import { ImagePickerAsset } from "expo-image-picker";
import { StudentMember } from "@features/night-study";

export const TeamCreatePage = () => {
  
  const { colors } = useTheme();
  const loading = false
  const goBack = () => navigation.goBack();
  const navigation = useNavigation<any>();

  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamImage, setTeamImage] = useState<ImagePickerAsset | null>(null);
  const [teamMembers, setTeamMembers] = useState<StudentMember[]>([]);
  
  return (
  <SafeAreaView
    style={[styles.container, { backgroundColor: colors.background.default }]}
    edges={["top"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />} >
        <TopNavBar.Title hasBackButton>팀 생성</TopNavBar.Title>
      </TopNavBar>
      <View style={styles.content}>
        <TeamApplyForm
                 teamName={teamName}
                 setTeamName={setTeamName}
                 teamDescription={teamDescription}
                 setTeamDescription={setTeamDescription}
                 teamImage={teamImage}
                 setTeamImage={setTeamImage}
                 TeamMembers={teamMembers}
                 setTeamMembers={setTeamMembers}
        />
      </View>
      <View style={styles.submitArea}>
        <FilledButton size="large" display="fill" isLoading={loading} onPress={() => { }}>
          팀 생성
        </FilledButton>
      </View>
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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

