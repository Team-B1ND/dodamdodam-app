import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { TopNavBar } from "@shared/ui";
import { useNavigation } from "@react-navigation/native";

export const TeamCreatePage = () => {
  const { colors } = useTheme();
  const goBack = () => navigation.goBack();
  const navigation = useNavigation<any>();
  return (
  <SafeAreaView
    style={[styles.container, { backgroundColor: colors.background.default }]}
    edges={["top"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={goBack} />} >
        <TopNavBar.Title hasBackButton>팀 생성</TopNavBar.Title>
      </TopNavBar>
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 140,
    gap: 20,
  },
});
