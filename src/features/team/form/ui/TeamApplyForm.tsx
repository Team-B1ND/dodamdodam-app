import { FilledButton, TextField } from "@shared/ui";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TeamAvatar, TeamMemberRow } from "@entities/team";
import { TeamImagePicker } from "./TeamImagePicker";
import type { TeamApplyFormProps } from "../model/types";

export const TeamApplyForm = ({
  teamName,
  onTeamNameChange,
  teamDescription,
  onTeamDescriptionChange,
  teamImage,
  onTeamImageChange,
  existingMembers = [],
  teamMembers,
  onAddMemberPress,
}: TeamApplyFormProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.formContent}>
      <TextField
        label="팀명"
        placeholder="팀 이름을 입력해주세요."
        supportingText="9자 이하, 특수문자 & 숫자 가능"
        value={teamName}
        onChangeText={onTeamNameChange}
      />

      <TextField
        label="팀 소개"
        placeholder="팀을 간략하게 소개해주세요."
        value={teamDescription}
        supportingText="14자 이하"
        onChangeText={onTeamDescriptionChange}
      />

      <Text style={[styles.labelText, { color: colors.text.tertiary }]}>
        팀 로고
      </Text>
      <TeamImagePicker value={teamImage} onChange={onTeamImageChange} />

      {existingMembers.length > 0 && (
        <View style={styles.memberSection}>
          <Text
            selectable
            style={[styles.labelText, { color: colors.text.tertiary }]}
          >
            현재 팀원
          </Text>
          <View>
            {existingMembers.map((member) => (
              <TeamMemberRow key={member.userId} member={member} />
            ))}
          </View>
        </View>
      )}

      {teamMembers.length > 0 && (
        <View style={styles.memberSection}>
          <Text
            selectable
            style={[styles.labelText, { color: colors.text.tertiary }]}
          >
            {existingMembers.length > 0 ? "초대 예정" : "팀원 목록"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberList}
          >
            {teamMembers.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <TeamAvatar imageUrl={member.profileImage ?? null} size={38} />
                <Text
                  selectable
                  style={[styles.memberName, { color: colors.text.secondary }]}
                >
                  {member.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <FilledButton
        size="medium"
        display="fill"
        onPress={onAddMemberPress}
      >
        학생 추가
      </FilledButton>
    </View>
  );
};

const styles = StyleSheet.create({
  memberName: {
    ...typo("Caption1", "Bold"),
    textAlign: "center",
  },
  memberItem: {
    alignItems: "center",
    gap: 4,
    width: 48,
  },
  memberList: {
    gap: 12,
  },
  memberSection: {
    gap: 12,
  },
  formContent: {
    gap: 12,
  },
  labelText: {
    ...typo("Headline", "Medium"),
    fontSize: 14,
  },
});
