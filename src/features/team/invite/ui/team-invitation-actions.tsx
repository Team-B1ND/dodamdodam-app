import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FilledButton } from "@shared/ui";
import { useAcceptTeamInvitation } from "../model/useAcceptTeamInvitation";
import { useRejectTeamInvitation } from "../model/useRejectTeamInvitation";

interface TeamInvitationActionsProps {
  publicId: string;
}

export const TeamInvitationActions = ({
  publicId,
}: TeamInvitationActionsProps) => {
  const navigation = useNavigation();
  const acceptInvitation = useAcceptTeamInvitation();
  const rejectInvitation = useRejectTeamInvitation();
  const isPending = acceptInvitation.isPending || rejectInvitation.isPending;

  const handleAccept = useCallback(() => {
    acceptInvitation.mutate(publicId, {
      onSuccess: () => navigation.goBack(),
    });
  }, [acceptInvitation, navigation, publicId]);

  const handleReject = useCallback(() => {
    rejectInvitation.mutate(publicId, {
      onSuccess: () => navigation.goBack(),
    });
  }, [navigation, publicId, rejectInvitation]);

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
