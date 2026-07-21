import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import {
  TopNavBar,
  TextField,
  FilledButton,
  TextAreaProvider,
  VerifyCodeDialog,
  useOverlay,
  toast,
} from "@shared/ui";
import { authApi } from "@entities/auth/api";
import { userApi } from "@entities/user/api";
import { useSlideAnimation } from "@shared/hooks/animations/useSlideAnimation";
import { formatPhoneNumber, parsePhoneDigits } from "@features/register/formatPhoneNumber";

export const ResetPasswordPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const overlay = useOverlay();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const [phone, setPhone] = useState("");
  const handlePhoneChange = useCallback((text: string) => {
    setPhone(parsePhoneDigits(text));
  }, []);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordMatch = newPassword.length > 0 && newPassword === newPasswordConfirm;
  const passwordMismatch = newPasswordConfirm.length > 0 && !passwordMatch;
  const canSubmit = phoneVerified && passwordMatch;

  const { animatedStyle: passwordFieldsStyle } = useSlideAnimation({
    visible: phoneVerified,
    direction: "up",
    distance: 12,
  });

  const handleSendCode = useCallback(async () => {
    if (sendingCode) return;
    const rawPhone = phone.replace(/-/g, "");
    setSendingCode(true);
    try {
      await authApi.requestPhoneVerification(rawPhone);
      toast.success("인증코드가 전송되었어요.", { position: "top" });
      overlay.open(({ isOpen, close, exit, setDimClickHandler }) => (
        <VerifyCodeDialog
          isOpen={isOpen}
          close={close}
          exit={exit}
          setDimClickHandler={setDimClickHandler}
          phone={rawPhone}
          onVerified={() => {
            setPhoneVerified(true);
            close();
          }}
        />
      ));
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? "인증코드 전송에 실패했어요."
        : "인증코드 전송에 실패했어요.";
      toast.error(message, { position: "top" });
    } finally {
      setSendingCode(false);
    }
  }, [sendingCode, phone, overlay]);

  const handleSubmit = useCallback(async () => {
    if (loading || !canSubmit) return;
    setLoading(true);
    try {
      await userApi.resetPassword({ phone: phone.replace(/-/g, ""), newPassword });
      toast.success("비밀번호가 재설정되었어요.", { position: "top" });
      navigation.goBack();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? "비밀번호 재설정에 실패했어요."
        : "비밀번호 재설정에 실패했어요.";
      toast.error(message, { position: "top" });
    } finally {
      setLoading(false);
    }
  }, [loading, canSubmit, phone, newPassword, navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />} />

        <TextAreaProvider style={styles.content}>
          <Text style={[typo("Title3", "Bold"), styles.title, { color: colors.text.primary }]}>
            {"비밀번호를\n재설정해 주세요"}
          </Text>

          <View style={styles.fields}>
            <TextField
              type="text"
              label="전화번호"
              value={formatPhoneNumber(phone)}
              onChangeText={handlePhoneChange}
              keyboardType="number-pad"
              editable={!phoneVerified}
            />

            {phoneVerified && (
              <Animated.View style={[styles.passwordFields, passwordFieldsStyle]}>
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
              </Animated.View>
            )}
          </View>

          {!phoneVerified && phone.replace(/-/g, "").length >= 10 && (
            <View style={styles.verifyButton}>
              <FilledButton
                size="large"
                display="fill"
                isLoading={sendingCode}
                onPress={handleSendCode}
              >
                인증코드 전송
              </FilledButton>
            </View>
          )}
        </TextAreaProvider>

        <View style={styles.bottom}>
          <FilledButton
            size="large"
            display="fill"
            disabled={!canSubmit}
            isLoading={loading}
            onPress={handleSubmit}
          >
            재설정하기
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
  verifyButton: {
    marginTop: 24,
  },
  passwordFields: {
    gap: 20,
  },
  bottom: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
});
