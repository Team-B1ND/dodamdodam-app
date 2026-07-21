import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";
import { FilledButton, TextField, Avatar, VerifyCodeDialog, useOverlay } from "@shared/ui";
import { usePressAnimation } from "@shared/hooks";
import { Plus } from "@shared/icons/mono";
import { typo } from "@shared/tokens";
import { useEditProfile } from "./hooks/useEditProfile";
import { formatPhoneNumber, parsePhoneDigits } from "@features/register/formatPhoneNumber";

const AVATAR_SIZE = 120;
const ADD_BUTTON_SIZE = 32;

interface EditProfileFormProps {
  onComplete: () => void;
}

export const EditProfileForm = ({ onComplete }: EditProfileFormProps) => {
  const { colors } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const overlay = useOverlay();

  const {
    isStudent, isTeacher, isPhoneChanged, profileImageUri,
    name, setName, phone, setPhone,
    grade, setGrade, room, setRoom, number, setNumber,
    position, setPosition,
    pickFromAlbum, resetToDefault,
    sendVerificationCode, submitUpdate,
    isSaving, isSendingCode, hasChanges,
  } = useEditProfile(onComplete);

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(parsePhoneDigits(text));
  }, [setPhone]);

  const [imgError, setImgError] = useState(false);
  useEffect(() => setImgError(false), [profileImageUri]);

  const { animatedStyle: addBtnStyle, handlePressIn, handlePressOut } =
    usePressAnimation({ scale: 0.98 });

  const openSheet = useCallback(() => sheetRef.current?.present(), []);

  const dismissAndRun = useCallback((fn: () => void) => {
    sheetRef.current?.dismiss();
    fn();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleSave = useCallback(async () => {
    if (!isPhoneChanged) {
      submitUpdate();
      return;
    }

    const sent = await sendVerificationCode();
    if (!sent) return;

    overlay.open(({ isOpen, close, exit, setDimClickHandler }) => (
      <VerifyCodeDialog
        isOpen={isOpen}
        close={close}
        exit={exit}
        setDimClickHandler={setDimClickHandler}
        phone={phone}
        onVerified={() => {
          close();
          submitUpdate();
        }}
      />
    ));
  }, [isPhoneChanged, phone, sendVerificationCode, submitUpdate, overlay]);

  const showImage = profileImageUri && !imgError;

  return (
    <>
      <View>
        <View style={styles.avatarContainer}>
          {showImage ? (
            <Image
              source={{ uri: profileImageUri }}
              style={styles.avatarImage}
              onError={() => setImgError(true)}
            />
          ) : (
            <Avatar size={AVATAR_SIZE} />
          )}
          <Pressable onPress={openSheet} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={[styles.addButton, { backgroundColor: colors.brand.primary }, addBtnStyle]}>
              <Plus size={16} color={colors.static.white} />
            </Animated.View>
          </Pressable>
        </View>

        <View style={styles.fields}>
          <TextField label="이름" value={name} onChangeText={setName} />
          <TextField label="전화번호" value={formatPhoneNumber(phone)} onChangeText={handlePhoneChange} keyboardType="number-pad" />
          {isStudent && (
            <View style={styles.row}>
              <TextField label="학년" value={grade} onChangeText={setGrade} keyboardType="number-pad" customStyle={styles.rowField} />
              <TextField label="반" value={room} onChangeText={setRoom} keyboardType="number-pad" customStyle={styles.rowField} />
              <TextField label="번호" value={number} onChangeText={setNumber} keyboardType="number-pad" customStyle={styles.rowField} />
            </View>
          )}
          {isTeacher && (
            <TextField label="직위" value={position} onChangeText={setPosition} />
          )}
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <FilledButton
          display="fill"
          size="large"
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
          isLoading={isSaving || isSendingCode}
        >
          수정 완료
        </FilledButton>
      </View>

      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.background.surface }]}
        handleIndicatorStyle={[styles.sheetIndicator, { backgroundColor: colors.fill.secondary }]}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Pressable style={styles.sheetOption} onPress={() => dismissAndRun(pickFromAlbum)}>
            <Text style={[styles.sheetOptionText, { color: colors.text.primary }]}>앨범에서 선택</Text>
          </Pressable>
          <Pressable style={styles.sheetOption} onPress={() => dismissAndRun(resetToDefault)}>
            <Text style={[styles.sheetOptionText, { color: colors.status.error }]}>기본 프로필로 설정</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignSelf: "center",
    marginVertical: 24,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  addButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  fields: {
    paddingHorizontal: 16,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  buttonWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetIndicator: {
    width: 64,
    height: 5,
    borderRadius: 2.5,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 48,
  },
  sheetOption: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  sheetOptionText: {
    ...typo("Body1", "Medium"),
  },
});