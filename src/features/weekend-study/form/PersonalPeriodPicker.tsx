import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WEEKEND_STUDY_PERIODS } from "@entities/weekend-study";
import { useTheme } from "@shared/theme";
import { typo } from "@shared/tokens";
import { Checkbox, Divider } from "@shared/ui";
import { formatPeriodSlot } from "../lib/period";

export interface PersonalPeriodPickerProps {
  selectedPeriods: number[];
  appliedPeriods: ReadonlySet<number>;
  disabled?: boolean;
  errorMessage?: string | null;
  onToggle: (period: number) => void;
}

export const PersonalPeriodPicker = ({
  selectedPeriods,
  appliedPeriods,
  disabled = false,
  errorMessage,
  onToggle,
}: PersonalPeriodPickerProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        시간 선택
      </Text>

      <View>
        {WEEKEND_STUDY_PERIODS.map((period, index) => {
          const isApplied = appliedPeriods.has(period);
          const isChecked = isApplied || selectedPeriods.includes(period);
          const rowDisabled = disabled || isApplied;
          const labelColor = rowDisabled
            ? colors.text.placeholder
            : colors.text.primary;

          return (
            <React.Fragment key={period}>
              <Pressable
                style={styles.row}
                disabled={rowDisabled}
                onPress={() => onToggle(period)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked, disabled: rowDisabled }}
              >
                <View style={styles.rowLeft}>
                  <Checkbox
                    size="small"
                    selected={isChecked}
                    disabled={rowDisabled}
                    onPress={() => onToggle(period)}
                  />
                  <Text style={[styles.slotLabel, { color: labelColor }]}>
                    {formatPeriodSlot(period)}
                  </Text>
                </View>

                {isApplied && !disabled && (
                  <Text
                    style={[
                      styles.appliedLabel,
                      { color: colors.text.placeholder },
                    ]}
                  >
                    이미 신청한 시간입니다.
                  </Text>
                )}
              </Pressable>

              {index < WEEKEND_STUDY_PERIODS.length - 1 && (
                <Divider marginHorizontal={0} marginVertical={0} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {errorMessage ? (
        <Text style={[styles.errorText, { color: colors.status.error }]}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionTitle: {
    ...typo("Body1", "SemiBold"),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    gap: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  slotLabel: {
    ...typo("Body1", "Regular"),
  },
  appliedLabel: {
    ...typo("Caption1", "Regular"),
  },
  errorText: {
    ...typo("Caption1", "Regular"),
    marginTop: 4,
  },
});
