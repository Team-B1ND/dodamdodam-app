import React, { useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import {
  TopNavBar,
  TextField,
  FilledButton,
  SelectField,
  TextAreaProvider,
  VerifyCodeDialog,
  useOverlay,
  toast,
} from "@shared/ui";
import { authApi } from "@entities/auth/api";
import type { Gender } from "@entities/auth/types";
import { Role } from "@features/register/types";
import { validateStudentNumber } from "@features/register/validateStudentNumber";
import { formatPhoneNumber, parsePhoneDigits } from "@features/register/formatPhoneNumber";
import { GenderSheet } from "@features/register/GenderSheet";
import { getGenderLabel } from "@features/register/gender";
import { useSlideAnimation } from "@shared/hooks/animations/useSlideAnimation";

interface EnterNameRouteParams {
  role: Role;
}

export const EnterNamePage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const overlay = useOverlay();
  const { role } = route.params as EnterNameRouteParams;

  const isStudent = role === Role.STUDENT;

  const [name, setName] = useState("");
  const [extraField, setExtraField] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [isGenderSheetOpen, setIsGenderSheetOpen] = useState(false);
  const genderSheetRef = useRef<BottomSheetModal>(null);

  const openGenderSheet = useCallback(() => {
    Keyboard.dismiss();
    genderSheetRef.current?.present();
  }, []);
  const [phone, setPhone] = useState("");

  const handleNameChange = useCallback((text: string) => {
    setName(text.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, ""));
  }, []);

  const handleExtraFieldChange = useCallback((text: string) => {
    setExtraField(isStudent ? validateStudentNumber(text) : text);
  }, [isStudent]);

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(parsePhoneDigits(text));
  }, []);

  const showExtraField = name.trim().length >= 2;
  const showGenderField = showExtraField && (isStudent
    ? extraField.length === 4
    : extraField.trim().length >= 1);
  const showPhoneField = showGenderField && gender !== null;
  const showVerifyButton = showPhoneField && phone.length === 11;

  const { animatedStyle: extraFieldStyle } = useSlideAnimation({
    visible: showExtraField,
    direction: "up",
    distance: 12,
  });

  const { animatedStyle: genderFieldStyle } = useSlideAnimation({
    visible: showGenderField,
    direction: "up",
    distance: 12,
  });

  const { animatedStyle: phoneFieldStyle } = useSlideAnimation({
    visible: showPhoneField,
    direction: "up",
    distance: 12,
  });

  const { animatedStyle: verifyButtonStyle } = useSlideAnimation({
    visible: showVerifyButton,
    direction: "up",
    distance: 12,
  });

  const extraLabel = isStudent ? "학반번호 (예: 1101)" : "직책";

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const [sendingCode, setSendingCode] = useState(false);

  const handleSendCode = useCallback(async () => {
    if (sendingCode) return;
    setSendingCode(true);
    try {
      await authApi.requestPhoneVerification(phone);
      toast.success("인증코드가 전송되었어요.", { position: "top" });
      overlay.open(({ isOpen, close, exit, setDimClickHandler }) => (
        <VerifyCodeDialog
          isOpen={isOpen}
          close={close}
          exit={exit}
          setDimClickHandler={setDimClickHandler}
          phone={phone}
          onVerified={() => {
            close();
            (navigation as any).navigate("CreateAccount", {
              role,
              name,
              extraField,
              phone,
              gender,
            });
          }}
        />
      ));
    } catch {
      toast.error("인증코드 전송에 실패했어요.", { position: "top" });
    } finally {
      setSendingCode(false);
    }
  }, [sendingCode, phone, overlay, navigation, role, name, extraField, gender]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TopNavBar left={<TopNavBar.BackButton onPress={handleBack} />} />

        <TextAreaProvider style={styles.content}>
          <Text style={[typo("Title3", "Bold"), styles.title, { color: colors.text.primary }]}>
            {"이름을\n입력해 주세요"}
          </Text>

          <View style={styles.fields}>
            {showPhoneField && (
              <Animated.View style={phoneFieldStyle}>
                <TextField
                  type="text"
                  label="전화번호"
                  value={formatPhoneNumber(phone)}
                  onChangeText={handlePhoneChange}
                  keyboardType="number-pad"
                />
              </Animated.View>
            )}

            {showGenderField && (
              <Animated.View style={genderFieldStyle}>
                <SelectField
                  label="성별"
                  value={getGenderLabel(gender)}
                  placeholder="선택해주세요"
                  active={isGenderSheetOpen}
                  onPress={openGenderSheet}
                />
              </Animated.View>
            )}

            {showExtraField && (
              <Animated.View style={extraFieldStyle}>
                <TextField
                  type="text"
                  label={extraLabel}
                  value={extraField}
                  onChangeText={handleExtraFieldChange}
                  keyboardType={isStudent ? "number-pad" : undefined}
                />
              </Animated.View>
            )}

            <TextField
              type="text"
              label="이름"
              value={name}
              onChangeText={handleNameChange}
            />
          </View>

          {showVerifyButton && (
            <Animated.View style={[styles.verifyButton, verifyButtonStyle]}>
              <FilledButton size="large" display="fill" isLoading={sendingCode} onPress={handleSendCode}>
                전화번호 인증코드 전송
              </FilledButton>
            </Animated.View>
          )}
        </TextAreaProvider>
      </KeyboardAvoidingView>

      <GenderSheet
        ref={genderSheetRef}
        value={gender}
        onSelect={setGender}
        onOpenChange={setIsGenderSheetOpen}
      />
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
});
