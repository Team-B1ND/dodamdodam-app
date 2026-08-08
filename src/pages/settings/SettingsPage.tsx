import React, { Suspense, useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";
import { Divider, TopNavBar, Skeleton, WebPopup, toast } from "@shared/ui";
import { useLogout } from "@features/auth";
import { SettingProfile } from "./ui/SettingProfile";
import { SettingItem } from "./ui/SettingItem";

const APP_VERSION = "3.4.7";
const DOCS_BASE_URL = "https://dodam-docs.b1nd.com";

export const SettingsPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const webPopupRef = useRef<BottomSheetModal>(null);
  const [popupUrl, setPopupUrl] = useState("");
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openEditProfile = useCallback(() => navigation.navigate("EditProfile"), [navigation]);
  const openChangePassword = useCallback(() => navigation.navigate("ChangePassword"), [navigation]);
  const logout = useLogout();

  const openWebPopup = useCallback((path: string) => {
    setPopupUrl(`${DOCS_BASE_URL}${path}`);
    webPopupRef.current?.present();
  }, []);
  const openPrivacyPolicyPopup = useCallback(() => {
    setPopupUrl("https://app.notion.com/p/3b63cf93eace8049ad01e5f6a9654fdb?source=copy_link");
    webPopupRef.current?.present();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />}>
        <TopNavBar.Title hasBackButton>설정</TopNavBar.Title>
      </TopNavBar>
      <View style={styles.content}>
        <Suspense fallback={<ProfileSkeleton />}>
          <SettingProfile onEditPress={openEditProfile} />
        </Suspense>
        <Divider />
        <View style={styles.section}>
          <SettingItem title="비밀번호 수정" onPress={openChangePassword} />
        </View>
        <Divider />
        <View style={styles.section}>
          <SettingItem title="서비스 운영 정책" onPress={() => openWebPopup("/terms")} />
          <SettingItem title="개인정보 처리 방침" onPress={() => openPrivacyPolicyPopup()} />
          <SettingItem title="버전 정보" rightText={APP_VERSION} />
        </View>
        <Divider />
        <View style={styles.section}>
          <SettingItem title="로그아웃" onPress={logout} />
          <SettingItem
            title="회원탈퇴"
            color={colors.status.error}
            onPress={() => toast("회원탈퇴")}
          />
        </View>
      </View>
      <WebPopup sheetRef={webPopupRef} url={popupUrl} />
    </SafeAreaView>
  );
};

const ProfileSkeleton = () => (
  <View style={styles.profileSkeleton}>
    <Skeleton width={80} height={80} radius={40} />
    <View style={styles.profileSkeletonText}>
      <Skeleton width={100} height={20} radius={4} />
      <Skeleton width={60} height={14} radius={4} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 4,
  },
  profileSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  profileSkeletonText: {
    gap: 4,
  },
});