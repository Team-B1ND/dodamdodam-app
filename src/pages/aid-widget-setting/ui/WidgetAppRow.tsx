import React, { useCallback } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { Checkbox } from "@shared/ui";
import type { InApp } from "@entities/inapp/types";

interface WidgetAppRowProps {
  app: InApp;
  selected: boolean;
  onToggle: (appId: string) => void;
}

export const WidgetAppRow = React.memo(({ app, selected, onToggle }: WidgetAppRowProps) => {
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";
  const iconUri = isDark && app.darkIconUrl ? app.darkIconUrl : app.iconUrl;
  const subtitle = app.subtitle?.trim();

  const handlePress = useCallback(() => {
    onToggle(app.appId);
  }, [app.appId, onToggle]);

  return (
    <Pressable
      style={styles.row}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <Image
        source={{ uri: iconUri }}
        style={[styles.icon, { backgroundColor: colors.fill.secondary }]}
      />
      <View style={styles.textGroup}>
        <Text
          numberOfLines={1}
          style={[typo("Body1", "Bold"), { color: colors.text.primary }]}
        >
          {app.name}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[typo("Caption1", "Regular"), { color: colors.text.tertiary }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Checkbox size="small" selected={selected} onPress={handlePress} />
    </Pressable>
  );
});

WidgetAppRow.displayName = "WidgetAppRow";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
});
