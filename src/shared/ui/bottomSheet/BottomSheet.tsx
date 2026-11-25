import React, { useCallback, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { StyleSheet } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";

export interface BottomSheetRef {
  open: (index?: number) => void;
  close: () => void;
  snapTo: (index: number) => void;
}

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  enableDynamicSizing?: boolean;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children, snapPoints = ["40%"], onClose, enableDynamicSizing = false }, ref) => {
    const { colors } = useTheme();
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.present(),
      close: () => bottomSheetRef.current?.dismiss(),
      snapTo: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    }));

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

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={enableDynamicSizing ? undefined : memoizedSnapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={[
          styles.background,
          { backgroundColor: colors.background.surface },
        ]}
        handleIndicatorStyle={[
          styles.indicator,
          { backgroundColor: colors.fill.secondary },
        ]}
        onDismiss={onClose}
      >
        <BottomSheetView style={styles.content}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  indicator: {
    width: 64,
    height: 5,
    borderRadius: 2.5,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
