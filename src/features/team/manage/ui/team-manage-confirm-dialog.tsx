import { useCallback } from "react";
import { Dialog } from "@shared/ui";
import { useDeleteTeam } from "../model/useDeleteTeam";
import { useLeaveTeam } from "../model/useLeaveTeam";

export type TeamManageConfirmMode = "delete" | "leave";

interface TeamManageConfirmDialogProps {
  mode: TeamManageConfirmMode;
  publicId: string;
  isOpen: boolean;
  close: () => void;
  exit: () => void;
  setDimClickHandler: (handler: () => void) => void;
  onCompleted: () => void;
}

export const TeamManageConfirmDialog = ({
  mode,
  publicId,
  isOpen,
  close,
  exit,
  setDimClickHandler,
  onCompleted,
}: TeamManageConfirmDialogProps) => {
  const deleteTeam = useDeleteTeam();
  const leaveTeam = useLeaveTeam();
  const mutation = mode === "delete" ? deleteTeam : leaveTeam;
  const isPending = mutation.isPending;

  const handleConfirm = useCallback(() => {
    mutation.mutate(publicId, {
      onSuccess: () => {
        close();
        onCompleted();
      },
    });
  }, [close, mutation, onCompleted, publicId]);

  return (
    <Dialog
      open={isOpen}
      title={mode === "delete" ? "팀을 삭제하시겠어요?" : "팀에서 탈퇴하시겠어요?"}
      description={
        mode === "delete"
          ? "삭제한 팀은 다시 복구할 수 없어요."
          : "탈퇴하면 소속 팀 목록에서 제외돼요."
      }
      closeOnDimmerClick={!isPending}
      onClose={close}
      onExited={exit}
      setDimClickHandler={setDimClickHandler}
    >
      <Dialog.TextButton disabled={isPending} onPress={close}>
        취소
      </Dialog.TextButton>
      <Dialog.FilledButton
        role="negative"
        isLoading={isPending}
        onPress={handleConfirm}
      >
        {mode === "delete" ? "삭제하기" : "탈퇴하기"}
      </Dialog.FilledButton>
    </Dialog>
  );
};
