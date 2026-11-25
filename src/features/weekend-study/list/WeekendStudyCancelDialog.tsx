import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { Dialog } from "@shared/ui";
import { useWeekendStudyCancel } from "../hooks/useWeekendStudyCancel";

interface WeekendStudyCancelDialogProps {
  id: string;
  isOpen: boolean;
  close: () => void;
  exit: () => void;
  setDimClickHandler: (handler: () => void) => void;
}

export const WeekendStudyCancelDialog = ({
  id,
  isOpen,
  close,
  exit,
  setDimClickHandler,
}: WeekendStudyCancelDialogProps) => {
  const { mutate: cancelWeekendStudy, isPending } = useWeekendStudyCancel();

  const handleConfirm = useCallback(() => {
    cancelWeekendStudy(id, {
      onSettled: () => close(),
    });
  }, [cancelWeekendStudy, close, id]);

  return (
    <Dialog
      open={isOpen}
      title="주말 자습 신청을 취소할까요?"
      description="취소한 신청은 복구할 수 없어요."
      closeOnDimmerClick={!isPending}
      onClose={close}
      onExited={exit}
      setDimClickHandler={setDimClickHandler}
    >
      <Dialog.FilledButton
        role="assistive"
        buttonCustomStyle={styles.button}
        disabled={isPending}
        onPress={close}
      >
        닫기
      </Dialog.FilledButton>
      <Dialog.FilledButton
        role="negative"
        buttonCustomStyle={styles.button}
        isLoading={isPending}
        onPress={handleConfirm}
      >
        확인
      </Dialog.FilledButton>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
  },
});
