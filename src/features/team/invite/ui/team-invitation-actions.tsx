import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Dialog, FilledButton, useOverlay } from "@shared/ui";
import { useAcceptTeamInvitation } from "../model/useAcceptTeamInvitation";
import { useRejectTeamInvitation } from "../model/useRejectTeamInvitation";

interface TeamInvitationActionsProps {
  publicId: string;
}

export const TeamInvitationActions = ({
  publicId,
}: TeamInvitationActionsProps) => {
  const navigation = useNavigation();
  const overlay = useOverlay();
  const acceptInvitation = useAcceptTeamInvitation();
  const rejectInvitation = useRejectTeamInvitation();
  const isPending = acceptInvitation.isPending || rejectInvitation.isPending;

  const handleAccept = useCallback(() => {
    acceptInvitation.mutate(publicId, {
      onSuccess: () => navigation.goBack(),
    });
  }, [acceptInvitation, navigation, publicId]);

  // 거절은 되돌리려면 재초대가 필요하므로, 삭제/탈퇴처럼 확인 단계를 둔다.
  const handleReject = useCallback(() => {
    overlay.open(({ isOpen, close, exit, setDimClickHandler }) => (
      <Dialog
        open={isOpen}
        title="초대를 거절하시겠어요?"
        description="거절하면 팀장이 다시 초대해야 참여할 수 있어요."
        closeOnDimmerClick
        onClose={close}
        onExited={exit}
        setDimClickHandler={setDimClickHandler}
      >
        <Dialog.TextButton onPress={close}>취소</Dialog.TextButton>
        <Dialog.FilledButton
          role="negative"
          onPress={() => {
            close();
            rejectInvitation.mutate(publicId, {
              onSuccess: () => navigation.goBack(),
            });
          }}
        >
          거절하기
        </Dialog.FilledButton>
      </Dialog>
    ));
  }, [navigation, overlay, publicId, rejectInvitation]);

  return (
    <View style={styles.container}>
      <FilledButton
        role="negative"
        size="large"
        disabled={isPending}
        isLoading={rejectInvitation.isPending}
        buttonCustomStyle={styles.button}
        onPress={handleReject}
      >
        거절하기
      </FilledButton>
      <FilledButton
        size="large"
        disabled={isPending}
        isLoading={acceptInvitation.isPending}
        buttonCustomStyle={styles.button}
        onPress={handleAccept}
      >
        수락하기
      </FilledButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 16,
  },
  button: {
    flex: 1,
  },
});
