import React, { memo } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { useTheme } from "@shared/theme";
import { typo, shapes } from "@shared/tokens";
import { CheckmarkCircleFill } from "@shared/icons/mono";
import type { StudentMember } from "../hooks/useNightStudyForm";
import { StudentListSkeleton } from "./StudentListSkeleton";
import { StudentAvatar } from "./StudentAvatar";

interface StudentListProps {
  data: StudentMember[];
  selectedIds: Set<string>;
  onToggle: (student: StudentMember) => void;
  onEndReached?: () => void;
  loading?: boolean;
}

const StudentRow = memo(({
  item,
  selected,
  onPress,
}: {
  item: StudentMember;
  selected: boolean;
  onPress: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.info}>
        <StudentAvatar size={38} profileImage={item.profileImage} />
        <View>
          <Text style={[styles.name, { color: colors.text.primary }]}>{item.name}</Text>
          <Text style={[styles.sub, { color: colors.text.tertiary }]}>{item.grade}-{item.room}</Text>
        </View>
      </View>
      {selected && <CheckmarkCircleFill size={20} color={colors.brand.primary} />}
    </Pressable>
  );
});

const _StudentList = ({ data, selectedIds, onToggle, onEndReached, loading }: StudentListProps) => (
  <FlatList
    data={data}
    keyExtractor={(item) => item.id}
    style={styles.list}
    renderItem={({ item }) => (
      <StudentRow
        item={item}
        selected={selectedIds.has(item.id)}
        onPress={() => onToggle(item)}
      />
    )}
    onEndReached={onEndReached}
    onEndReachedThreshold={0.3}
    ListFooterComponent={loading ? <StudentListSkeleton count={3} /> : null}
  />
);

export const StudentList = Object.assign(_StudentList, {
  Skeleton: StudentListSkeleton,
});

const styles = StyleSheet.create({
  list: {
    height: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderRadius: shapes.extraSmall,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    ...typo("Body1", "Medium"),
  },
  sub: {
    ...typo("Body2", "Medium"),
  },
});
