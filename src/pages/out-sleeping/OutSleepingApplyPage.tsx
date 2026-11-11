import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { TopNavBar, TextAreaProvider } from "@shared/ui";
import { OutSleepingApplyForm } from "@features/out-sleeping";

export const OutSleepingApplyPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <TopNavBar
        left={<TopNavBar.BackButton onPress={() => navigation.goBack()} />}
      >
        <TopNavBar.Title hasBackButton>외출/외박 신청하기</TopNavBar.Title>
      </TopNavBar>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TextAreaProvider style={styles.inner}>
          <OutSleepingApplyForm />
        </TextAreaProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
  inner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});