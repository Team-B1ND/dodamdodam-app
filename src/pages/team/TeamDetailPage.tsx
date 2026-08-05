import React, { Suspense } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@shared/theme";
import { TopNavBar } from "@shared/ui";
import type { Team } from "@entities/team";
import { TeamDetailContent, TeamDetailSkeleton } from "./ui";

export interface TeamDetailParams {
  team: Team;
  isInvitation?: boolean;
}

type TeamDetailRouteProp = RouteProp<{ TeamDetail: TeamDetailParams }, "TeamDetail">;

export const TeamDetailPage = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute<TeamDetailRouteProp>();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "bottom"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={() => navigation.goBack()} />} />
      <View style={styles.content}>
        <Suspense fallback={<TeamDetailSkeleton />}>
          <TeamDetailContent
            team={params.team}
            isInvitation={params.isInvitation}
          />
        </Suspense>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
