import React, { useRef, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TopNavBar } from "@shared/ui";
import { Ellipsis } from "@shared/icons/mono";
import { NotificationList, type NotificationListRef } from "@features/notification";

const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.4}
    pressBehavior="close"
  />
);

export const NotificationPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const listRef = useRef<NotificationListRef>(null);
  const sheetRef = useRef<BottomSheetModal>(null);

  const handleOpenSheet = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const handleReadAll = useCallback(async () => {
    sheetRef.current?.dismiss();
    await listRef.current?.readAll();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "left", "right"]}
    >
      <TopNavBar
        left={<TopNavBar.BackButton onPress={() => navigation.goBack()} />}
        right={<TopNavBar.IconButton icon={<Ellipsis />} onPress={handleOpenSheet} />}
      >
        <TopNavBar.Title hasBackButton>알림</TopNavBar.Title>
      </TopNavBar>
      <NotificationList ref={listRef} />

      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={Backdrop}
        backgroundStyle={{ backgroundColor: colors.background.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.fill.secondary }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Pressable style={styles.sheetItem} onPress={handleReadAll}>
            <Text style={[typo("Headline", "Medium"), { color: colors.text.primary }]}>
              모두 읽음 처리
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  sheetItem: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
});
