import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TopNavBar, TextField, FilledButton, TextAreaProvider, toast } from "@shared/ui";
import { userApi } from "@entities/user/api";

export const ChangePasswordPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const [pastPassword, setPastPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMatch = newPassword.length > 0 && newPassword === newPasswordConfirm;
  const passwordMismatch = newPasswordConfirm.length > 0 && !passwordMatch;
  const canSubmit = pastPassword.length > 0 && passwordMatch;

  const handleSubmit = useCallback(async () => {
    if (loading || !canSubmit) return;
    setLoading(true);
    try {
      await userApi.changePassword({ pastPassword, newPassword });
      toast.success("비밀번호가 변경되었어요.", { position: "top" });
      navigation.goBack();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? "비밀번호 변경에 실패했어요."
        : "비밀번호 변경에 실패했어요.";
      toast.error(message, { position: "top" });
    } finally {
      setLoading(false);
    }
  }, [loading, canSubmit, pastPassword, newPassword, navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />}>
          <TopNavBar.Title hasBackButton>비밀번호 수정</TopNavBar.Title>
        </TopNavBar>

        <TextAreaProvider style={styles.content}>
          <Text style={[typo("Title3", "Bold"), styles.title, { color: colors.text.primary }]}>
            {"비밀번호를\n변경해 주세요"}
          </Text>

          <View style={styles.fields}>
            <TextField
              type="password"
              label="현재 비밀번호"
              value={pastPassword}
              onChangeText={setPastPassword}
            />
            <TextField
              type="password"
              label="새 비밀번호"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextField
              type="password"
              label="새 비밀번호 확인"
              value={newPasswordConfirm}
              onChangeText={setNewPasswordConfirm}
              isError={passwordMismatch}
              supportingText={passwordMismatch ? "비밀번호가 일치하지 않아요" : undefined}
            />
          </View>
        </TextAreaProvider>

        <View style={styles.bottom}>
          <FilledButton
            size="large"
            display="fill"
            disabled={!canSubmit}
            isLoading={loading}
            onPress={handleSubmit}
          >
            변경하기
          </FilledButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 12,
    marginBottom: 32,
  },
  fields: {
    gap: 20,
  },
  bottom: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
});
