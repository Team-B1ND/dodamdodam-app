import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FilledButton, useOverlay } from "@shared/ui";
import type { Team } from "@entities/team";
import type { TeamMemberRole } from "../model/useTeamViewerRole";
import {
  TeamManageConfirmDialog,
  type TeamManageConfirmMode,
} from "./team-manage-confirm-dialog";

interface TeamManageActionsProps {
  team: Team;
  role: TeamMemberRole;
}

export const TeamManageActions = ({ team, role }: TeamManageActionsProps) => {
  const navigation = useNavigation<any>();
  const overlay = useOverlay();

  const openTeamEdit = useCallback(() => {
    navigation.navigate("TeamEdit", { team });
  }, [navigation, team]);

  const openConfirmDialog = useCallback(
    (mode: TeamManageConfirmMode) => {
      overlay.open(({ isOpen, close, exit, setDimClickHandler }) => (
        <TeamManageConfirmDialog
          mode={mode}
          publicId={team.publicId}
          isOpen={isOpen}
          close={close}
          exit={exit}
          setDimClickHandler={setDimClickHandler}
          onCompleted={() => navigation.goBack()}
        />
      ));
    },
    [navigation, overlay, team.publicId],
  );

  if (role === "guest") return null;

  return (
    <View style={styles.container}>
      {role === "leader" ? (
        <>
          <FilledButton
            size="large"
            buttonCustomStyle={styles.button}
            onPress={openTeamEdit}
          >
            수정하기
          </FilledButton>
          <FilledButton
            role="negative"
            size="large"
            buttonCustomStyle={styles.button}
            onPress={() => openConfirmDialog("delete")}
          >
            삭제하기
          </FilledButton>
        </>
      ) : (
        <FilledButton
          role="negative"
          size="large"
          display="fill"
          onPress={() => openConfirmDialog("leave")}
        >
          탈퇴하기
        </FilledButton>
      )}
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
