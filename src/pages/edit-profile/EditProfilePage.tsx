import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { TopNavBar, TextAreaProvider } from "@shared/ui";
import { EditProfileForm } from "@features/edit-profile";

export const EditProfilePage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />}>
        <TopNavBar.Title hasBackButton>정보 수정</TopNavBar.Title>
      </TopNavBar>
      <TextAreaProvider style={styles.content}>
        <EditProfileForm onComplete={goBack} />
      </TextAreaProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between" as const,
  },
});