import React, { useCallback, useEffect, useMemo, useRef, type FC } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import {FilledButton, TextAreaProvider} from "@shared/ui";
import { SelectedStudentList } from "./SelectedStudentList";
import { StudentList } from "./StudentList";
import { useStudentSelection } from "../hooks/useStudentSelection";
import { useStudentSearch } from "../hooks/useStudentSearch";
import type { StudentMember } from "../hooks/useNightStudyForm";

interface StudentAddSheetProps {
  selected: StudentMember[];
  excludedIds?: readonly string[];
  onConfirm: (members: StudentMember[]) => void;
  sheetRef: React.RefObject<BottomSheetModal | null>;
}

const Backdrop: FC<BottomSheetBackdropProps> = (props) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.4}
    pressBehavior="close"
  />
);

const SNAP_POINTS = ["85%"];

export const StudentAddSheet = ({
  selected,
  excludedIds = [],
  onConfirm,
  sheetRef,
}: StudentAddSheetProps) => {
  const { colors } = useTheme();
  const selection = useStudentSelection(selected);
  const { students, hasNext, loading, search, loadMore } = useStudentSearch();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const excludedIdSet = useMemo(() => new Set(excludedIds), [excludedIds]);
  const selectableStudents = useMemo(
    () => students.filter((student) => !excludedIdSet.has(student.id)),
    [excludedIdSet, students],
  );

  const handleSearch = useCallback((text: string) => {
    selection.setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 300);
  }, [selection, search]);

  useEffect(() => {
    search("");
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const handleConfirm = useCallback(() => {
    onConfirm(selection.members);
    sheetRef.current?.dismiss();
  }, [onConfirm, selection.members, sheetRef]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing={false}
      snapPoints={SNAP_POINTS}
      index={0}
      enablePanDownToClose
      backdropComponent={Backdrop}
      backgroundStyle={{ backgroundColor: colors.background.default }}
      handleIndicatorStyle={{ backgroundColor: colors.fill.secondary }}
    >
      <TextAreaProvider style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          학생 추가
        </Text>

        <View style={styles.body}>
          <SelectedStudentList members={selection.members} onRemove={selection.remove} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary, borderBottomColor: colors.border.normal }]}
            placeholder="학생 검색"
            placeholderTextColor={colors.text.placeholder}
            onChangeText={handleSearch}
          />
          <StudentList
            data={selectableStudents}
            selectedIds={selection.ids}
            onToggle={selection.toggle}
            onEndReached={hasNext ? loadMore : undefined}
            loading={loading}
          />
        </View>

        <FilledButton size="large" display="fill" onPress={handleConfirm}>
          추가
        </FilledButton>
      </TextAreaProvider>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  title: {
    ...typo("Heading2", "Bold"),
    paddingVertical: 8,
    marginBottom: 8,
  },
  body: {
    flex: 1,
  },
  searchInput: {
    ...typo("Headline", "Medium"),
    lineHeight: undefined,
    height: 45,
    borderBottomWidth: 1.5,
    paddingVertical: 0,
  },
});
