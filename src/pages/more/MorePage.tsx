import React, { Suspense, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@shared/theme";
import { TopNavBar, RefreshView, Dialog, useOverlay } from "@shared/ui";
import { Gear, File } from "@shared/icons/mono";
import { ProfileCard } from "@features/profile";
import { InAppList } from "@features/inapp";
import { userQueryKeys } from "@entities/user/api/queryKeys";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";
import type { User } from "@entities/user/types";
import { MenuItem } from "./ui/MenuItem";

export const MorePage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const queryClient = useQueryClient();
  const overlay = useOverlay();

  const openSettings = useCallback(() => navigation.navigate("Settings"), [navigation]);
  const openEditProfile = useCallback(() => navigation.navigate("EditProfile"), [navigation]);

  const showStudentCode = useCallback(() => {
    const user = queryClient.getQueryData<User>(userQueryKeys.me);
    if (!user) return;
    overlay.open(({ isOpen, close, exit, setDimClickHandler }) => (
      <Dialog
        open={isOpen}
        title="내 학생코드"
        description={user.publicId}
        closeOnDimmerClick
        onClose={close}
        onExited={exit}
        setDimClickHandler={setDimClickHandler}
      >
        <Dialog.FilledButton display="fill" onPress={close}>확인</Dialog.FilledButton>
      </Dialog>
    ));
  }, [queryClient, overlay]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top"]}
    >
      <TopNavBar
        right={<TopNavBar.IconButton icon={<Gear />} onPress={openSettings} />}
      >
        <TopNavBar.Title>전체</TopNavBar.Title>
      </TopNavBar>
      <RefreshView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        queryKeys={[userQueryKeys.me, inappQueryKeys.activeApps]}
      >
        <Suspense fallback={<ProfileCard.Skeleton />}>
          <ProfileCard onPress={openEditProfile} />
        </Suspense>

        <View style={styles.section}>
          <MenuItem icon={<File />} title="내 학생코드 보기" onPress={showStudentCode} />
        </View>

        <Suspense fallback={<InAppList.Skeleton />}>
          <InAppList />
        </Suspense>
      </RefreshView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  section: {
    paddingVertical: 4,
  },
});
