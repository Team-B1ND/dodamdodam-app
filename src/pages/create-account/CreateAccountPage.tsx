import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TopNavBar, TextField, FilledButton, TextAreaProvider, toast } from "@shared/ui";
import { useSlideAnimation } from "@shared/hooks/animations/useSlideAnimation";
import { authApi } from "@entities/auth/api";
import type { Gender } from "@entities/auth/types";
import { Role } from "@features/register/types";

interface CreateAccountRouteParams {
  role: Role;
  name: string;
  extraField: string;
  phone: string;
  gender: Gender;
}

export const CreateAccountPage = () => {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as CreateAccountRouteParams;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const showPassword = username.trim().length >= 5;
  const showPasswordConfirm = showPassword && password.length >= 1;
  const passwordMatch = password.length > 0 && password === passwordConfirm;
  const canSubmit = showPasswordConfirm && passwordMatch;

  const { animatedStyle: passwordStyle } = useSlideAnimation({
    visible: showPassword,
    direction: "up",
    distance: 12,
  });

  const { animatedStyle: passwordConfirmStyle } = useSlideAnimation({
    visible: showPasswordConfirm,
    direction: "up",
    distance: 12,
  });

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSignUp = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const phone = params.phone.replace(/-/g, "");
      if (params.role === Role.STUDENT) {
        const extra = params.extraField;
        const grade = Number(extra[0]);
        const room = Number(extra[1]);
        const number = Number(extra.slice(2));
        await authApi.registerStudent({
          username,
          name: params.name,
          password,
          phone,
          grade,
          room,
          number,
          gender: params.gender,
        });
      } else {
        await authApi.registerTeacher({
          username,
          name: params.name,
          password,
          phone,
          position: params.extraField,
          gender: params.gender,
        });
      }
      toast.success("회원가입에 성공했어요. 관리자의 승인을 기다려주세요.", { position: "top" });
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? "회원가입에 실패했어요."
        : "회원가입에 실패했어요.";
      toast.error(message, { position: "top" });
    } finally {
      setLoading(false);
    }
  }, [params, username, password, loading, navigation]);

  const passwordError = showPasswordConfirm && passwordConfirm.length > 0 && !passwordMatch;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TopNavBar left={<TopNavBar.BackButton onPress={handleBack} />} />

        <TextAreaProvider style={styles.content}>
          <Text style={[typo("Title3", "Bold"), styles.title, { color: colors.text.primary }]}>
            {"아이디와 비밀번호를\n설정해 주세요"}
          </Text>

          <View style={styles.fields}>
            {showPasswordConfirm && (
              <Animated.View style={passwordConfirmStyle}>
                <TextField
                  type="password"
                  label="비밀번호 확인"
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  isError={passwordError}
                  supportingText={passwordError ? "비밀번호가 일치하지 않아요" : undefined}
                />
              </Animated.View>
            )}

            {showPassword && (
              <Animated.View style={passwordStyle}>
                <TextField
                  type="password"
                  label="비밀번호"
                  value={password}
                  onChangeText={setPassword}
                />
              </Animated.View>
            )}

            <TextField
              type="text"
              label="아이디"
              value={username}
              onChangeText={setUsername}
            />
          </View>
        </TextAreaProvider>

        <View style={styles.bottom}>
          <FilledButton
            size="large"
            display="fill"
            disabled={!canSubmit}
            isLoading={loading}
            onPress={handleSignUp}
          >
            가입하기
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
