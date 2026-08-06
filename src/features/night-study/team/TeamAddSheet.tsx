import React, { useCallback, useEffect, useMemo, useState, type FC } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { FilledButton, TextAreaProvider, toast } from "@shared/ui";
import { CheckmarkCircleFill, CheckmarkCircleLine, MagnifyingGlass, People, XmarkCircle } from "@shared/icons/mono";
import { teamApi, type Team } from "@entities/team";
import { userApi } from "@entities/user/api";
import type { SelectedNightStudyTeam, StudentMember } from "../hooks/useNightStudyForm";
import { useNightStudyTeams } from "../hooks/useNightStudyTeams";

interface TeamAddSheetProps {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  selectedTeamIds?: string[];
  onConfirm: (teams: SelectedNightStudyTeam[]) => void;
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

const TeamAvatar = ({ size = 38 }: { size?: number }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.fill.primary,
      }}
    >
      <People size={size * 0.45} color={colors.fill.secondary} />
    </View>
  );
};

export const TeamAddSheet = ({
  sheetRef,
  selectedTeamIds = [],
  onConfirm,
}: TeamAddSheetProps) => {
  const { colors } = useTheme();
  const { teams, loading, loadMore, refresh } = useNightStudyTeams();
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Team[]>([]);
  const [confirming, setConfirming] = useState(false);
  const selectedIds = useMemo(
    () => new Set(selection.map((team) => team.publicId)),
    [selection],
  );
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return teams;
    return teams.filter((team) => team.name.toLowerCase().includes(keyword));
  }, [query, teams]);

  useEffect(() => {
    const selectedIds = new Set(selectedTeamIds);
    setSelection(teams.filter((team) => selectedIds.has(team.publicId)));
  }, [selectedTeamIds, teams]);

  const toggle = useCallback((team: Team) => {
    setSelection((current) =>
      current.some((item) => item.publicId === team.publicId)
        ? current.filter((item) => item.publicId !== team.publicId)
        : [...current, team],
    );
  }, []);

  const confirm = useCallback(async () => {
    if (confirming) return;

    setConfirming(true);
    try {
      const [{ data: meResponse }, memberResponses] = await Promise.all([
        userApi.getMe(),
        Promise.all(selection.map((team) => teamApi.getMembers(team.publicId))),
      ]);
      const myId = meResponse.data.publicId;
      const selectedTeams = selection.map<SelectedNightStudyTeam>((team, index) => {
        const members = memberResponses[index].data.data
          .filter((member) => member.isAccept && member.student)
          .map<StudentMember>((member) => ({
            id: member.userId,
            name: member.name,
            grade: member.student!.grade,
            room: member.student!.room,
            number: member.student!.number,
            profileImage: member.profileImage,
            isSelf: member.userId === myId,
          }));

        return {
          id: team.publicId,
          name: team.name,
          members,
        };
      });

      onConfirm(selectedTeams);
      sheetRef.current?.dismiss();
    } catch {
      toast.error("팀원을 불러오지 못했어요.", { position: "top" });
    } finally {
      setConfirming(false);
    }
  }, [confirming, onConfirm, selection, sheetRef]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={["85%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={Backdrop}
      backgroundStyle={{ backgroundColor: colors.background.default }}
      handleIndicatorStyle={{ backgroundColor: colors.border.strong }}
    >
      <TextAreaProvider style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>팀 추가</Text>

        {selection.length > 0 && (
          <View style={styles.selectedRow}>
            {selection.map((team) => (
              <View key={team.publicId} style={styles.selectedItem}>
                <View>
                  <TeamAvatar size={38} />
                  <Pressable style={styles.remove} onPress={() => toggle(team)}>
                    <XmarkCircle size={16} color={colors.text.primary} />
                  </Pressable>
                </View>
                <Text style={[styles.selectedName, { color: colors.text.secondary }]}>{team.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.search, { borderBottomColor: colors.border.strong }]}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="팀 검색"
            placeholderTextColor={colors.text.placeholder}
            style={[styles.searchInput, { color: colors.text.primary }]}
          />
          <MagnifyingGlass size={24} color={colors.text.placeholder} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(team) => team.publicId}
          style={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshing={loading && teams.length === 0}
          onRefresh={refresh}
          ListFooterComponent={
            loading && teams.length > 0
              ? <ActivityIndicator color={colors.brand.primary} />
              : null
          }
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.publicId);
            return (
              <Pressable style={styles.row} onPress={() => toggle(item)}>
                <View style={styles.info}>
                  <TeamAvatar size={38} />
                  <View>
                    <Text style={[styles.name, { color: colors.text.primary }]}>{item.name}</Text>
                  </View>
                </View>
                {isSelected ? (
                  <CheckmarkCircleFill size={20} color={colors.brand.primary} />
                ) : (
                  <CheckmarkCircleLine size={20} color={colors.text.placeholder} />
                )}
              </Pressable>
            );
          }}
        />

        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <FilledButton
          size="large"
          display="fill"
          disabled={selection.length === 0}
          isLoading={confirming}
          onPress={confirm}
        >
          추가
        </FilledButton>
      </TextAreaProvider>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 32, gap: 8 },
  title: { ...typo("Heading2", "ExtraBold"), paddingVertical: 8 },
  selectedRow: { flexDirection: "row", gap: 12 },
  selectedItem: { alignItems: "center", gap: 4, width: 48 },
  selectedName: { ...typo("Label", "Regular") },
  remove: { position: "absolute", right: -5, top: -5 },
  search: { height: 45, flexDirection: "row", alignItems: "center", borderBottomWidth: 1 },
  searchInput: { ...typo("Headline", "Medium"), flex: 1, paddingVertical: 0 },
  list: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 },
  info: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  name: { ...typo("Body1", "Medium") },
  divider: { height: 1 },
});
