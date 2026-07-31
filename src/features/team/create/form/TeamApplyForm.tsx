import { Avatar, FilledButton, TextField } from "@shared/ui"
import { useCallback, useRef, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { ImagePickerAsset } from "expo-image-picker"
import { TeamImagePicker } from "./TeamImagePicker"
import { StudentAddSheet, StudentMember } from "@features/night-study"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { useTheme } from "@shared/theme"
import { typo } from "@shared/tokens"
import { TeamApplyFromProps } from "../types"

export const TeamApplyForm = (FormProps:TeamApplyFromProps) => {
  const { colors } = useTheme();
  const studentSheetRef = useRef<BottomSheetModal>(null);
  const openStudentSheet = useCallback(() => {
    studentSheetRef.current?.present();
  }, [])
  
  return (
    <>
    <View style={styles.formContent}>
      <TextField
        label="팀명"
        placeholder="팀 이름을 입력해주세요."
        supportingText="9자 이하, 특수문자 & 숫자 가능"
        value={FormProps.teamName} onChangeText={FormProps.setTeamName}
      />
      
      <TextField
        label="팀 소개"
        placeholder="팀을 간략하게 소개해주세요."
        value={FormProps.teamDescription}
        supportingText="14자 이하"
        onChangeText={FormProps.setTeamDescription}
      />

      <Text style={[styles.labelText, { color: colors.text.tertiary }]}>팀 로고</Text>
      <TeamImagePicker
        value={FormProps.teamImage}
        onChange={FormProps.setTeamImage}
      />

        {FormProps.TeamMembers.length > 0 && (
          <View>
            <Text style={[styles.labelText, { color: colors.text.tertiary }]}>팀원 목록</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberList}>
          {FormProps.TeamMembers.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <Avatar size={38} />
              <Text style={[styles.memberName, { color: colors.text.secondary }]}>
                {member.name}
              </Text>
            </View>
          ))}
        </ScrollView>
        </View>
      )}

      <FilledButton size="medium" display="fill" onPress={openStudentSheet}>
        학생 추가
      </FilledButton>
      </View>
      <StudentAddSheet
        sheetRef={studentSheetRef}
        selected={FormProps.TeamMembers}
        onConfirm={FormProps.setTeamMembers}
      />
    </>
  )
}

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
  formContent: {
    gap: 12
  },
  labelText: {
    ...typo("Headline", "Medium"),
    fontSize: 14,
  }

})