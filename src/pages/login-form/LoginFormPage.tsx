import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TopNavBar, TextField, FilledButton, Dialog, useOverlay, TextAreaProvider } from "@shared/ui";
import { TextButton } from "@shared/ui/buttons";
import { useLogin } from "@features/auth/login";
import { pendingDeepLink } from "@app/navigation/pendingDeepLink";
import { resolveDeepLink } from "@app/navigation/deepLinkResolver";

export const LoginFormPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const overlay = useOverlay();
  const {
    username,
    password,
    loading,
    error,
    setUsername,
    setPassword,
    handleLogin,
  } = useLogin();

  const onLoginPress = useCallback(async () => {
    const errorMessage = await handleLogin();
    if (!errorMessage) {
      const pendingUrl = pendingDeepLink.peek();
      const deepLinkState = pendingUrl ? resolveDeepLink(pendingUrl) : null;

      navigation.dispatch(
        CommonActions.reset(
          deepLinkState ?? { index: 0, routes: [{ name: "Main" }] },
        ),
      );
      pendingDeepLink.clear();
    } else {
      overlay.open(({ isOpen, close, exit, setDimClickHandler }) => (
        <Dialog
          open={isOpen}
          title={errorMessage}
          closeOnDimmerClick
          onClose={close}
          onExited={exit}
          setDimClickHandler={setDimClickHandler}
        >
          <TextButton size="large" onPress={close}>
            닫기
          </TextButton>
        </Dialog>
      ));
    }
  }, [handleLogin, navigation, overlay]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TopNavBar left={<TopNavBar.BackButton onPress={handleBack} />} />

        <TextAreaProvider style={styles.content}>
          <Text
            style={[
              typo("Title3", "Bold"),
              styles.title,
              { color: colors.text.primary },
            ]}
          >
            {"아이디와 비밀번호를\n입력해주세요"}
          </Text>

          <View style={styles.fields}>
            <TextField
              type="text"
              label="아이디"
              value={username}
              onChangeText={setUsername}
            />

            <TextField
              type="password"
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.forgotRow}>
            <Text style={[typo("Label", "Regular"), { color: colors.text.tertiary }]}>
              비밀번호를 잊으셨나요?{" "}
            </Text>
            <Pressable onPress={() => navigation.navigate("ResetPassword" as never)}>
              <Text
                style={[
                  typo("Label", "Medium"),
                  styles.forgotLink,
                  { color: colors.text.primary },
                ]}
              >
                비밀번호 재설정
              </Text>
            </Pressable>
          </View>

          <FilledButton
            size="large"
            display="fill"
            disabled={username.trim().length < 5 || !password.trim()}
            isLoading={loading}
            onPress={onLoginPress}
          >
            로그인
          </FilledButton>
        </TextAreaProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
  forgotRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  forgotLink: {
    textDecorationLine: "underline",
  },
});
