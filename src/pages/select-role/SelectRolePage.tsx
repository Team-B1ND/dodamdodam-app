import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { TopNavBar, FilledButton } from "@shared/ui";
import { Student, Teacher } from "@shared/icons/illustration";
import { RoleCard } from "@features/register/RoleCard";
import { Role } from "@features/register/types";

export const SelectRolePage = () => {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNext = useCallback(() => {
    navigation.navigate("EnterName", { role: selectedRole });
  }, [selectedRole, navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.default }]}
      edges={["top", "left", "right"]}
    >
      <TopNavBar left={<TopNavBar.BackButton onPress={handleBack} />} />
      <View style={styles.content}>
        <Text style={[typo("Title3", "Bold"), { color: colors.text.primary }]}>
          {"해당하는 곳을\n선택해 주세요"}
        </Text>
        <View style={styles.cards}>
          <RoleCard
            label="학생"
            selected={selectedRole === Role.STUDENT}
            onPress={() => setSelectedRole(Role.STUDENT)}
          >
            <Student size={96} />
          </RoleCard>
          <RoleCard
            label="선생님"
            selected={selectedRole === Role.TEACHER}
            onPress={() => setSelectedRole(Role.TEACHER)}
          >
            <Teacher size={96} />
          </RoleCard>
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: bottom + 16 }]}>
        <FilledButton size="large" display="fill" onPress={handleNext}>
          다음
        </FilledButton>
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
    flexDirection: "column",
    gap: 100,
    paddingHorizontal: 24,
  },
  cards: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  bottom: {
    paddingHorizontal: 16,
  },
});
