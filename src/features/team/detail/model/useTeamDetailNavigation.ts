import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { Team } from "@entities/team";

export const useTeamDetailNavigation = () => {
  const navigation = useNavigation<any>();

  return useCallback(
    (team: Team) => navigation.navigate("TeamDetail", { teamId: team.id }),
    [navigation],
  );
};
