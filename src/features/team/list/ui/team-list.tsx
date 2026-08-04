import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { TeamCard, type Team } from "@entities/team";
import { Handshake } from "@shared/icons/illustration";
import { useTheme } from "@shared/theme";
import { shapes } from "@shared/tokens";
import { EmptyState } from "@shared/ui";

interface TeamListProps {
  items: Team[];
  emptyMessage: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  onTeamPress: (team: Team) => void;
  fetchNextPage: () => Promise<unknown>;
  refetch: () => Promise<unknown>;
}

export const TeamList = ({
  items,
  emptyMessage,
  hasNextPage,
  isFetchingNextPage,
  isRefetching,
  onTeamPress,
  fetchNextPage,
  refetch,
}: TeamListProps) => {
  const { colors } = useTheme();

  const loadNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    void Haptics.selectionAsync();
    void refetch();
  }, [refetch]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.publicId}
      renderItem={({ item }) => (
        <TeamCard item={item} onPress={onTeamPress} />
      )}
      contentContainerStyle={[
        styles.list,
        items.length === 0 ? styles.emptyList : undefined,
      ]}
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
      onEndReached={loadNextPage}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor={colors.text.tertiary}
          colors={[colors.brand.primary]}
        />
      }
      ListEmptyComponent={
        <View
          style={[styles.card, { backgroundColor: colors.background.surface }]}
        >
          <EmptyState icon={<Handshake size={36} />} message={emptyMessage} />
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator
            style={styles.footer}
            color={colors.brand.primary}
          />
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 12,
    paddingBottom: 140,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    padding: 16,
    borderRadius: shapes.large,
  },
  footer: {
    paddingVertical: 16,
  },
});
