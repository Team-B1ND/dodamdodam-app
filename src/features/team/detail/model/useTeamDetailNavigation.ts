import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { Team } from "@entities/team";

export const useTeamDetailNavigation = (isInvitation = false) => {
  const navigation = useNavigation<any>();

  return useCallback(
    (team: Team) => navigation.navigate("TeamDetail", { team, isInvitation }),
    [isInvitation, navigation],
  );
};
