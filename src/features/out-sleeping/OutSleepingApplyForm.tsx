import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TextField, FilledButton, Dropdown } from "@shared/ui";
import {
  OUT_SLEEPING_REASON_LABEL,
  OUT_SLEEPING_REASON_TYPES,
  type OutSleepingReasonType,
} from "@entities/out-sleeping/types";
import { DatePickerRow } from "./DatePickerRow";
import { useOutSleepingApply } from "./useOutSleepingApply";

const REASON_LABELS = OUT_SLEEPING_REASON_TYPES.map((type) => OUT_SLEEPING_REASON_LABEL[type]);

const typeOfLabel = (label: string): OutSleepingReasonType | null =>
  OUT_SLEEPING_REASON_TYPES.find((type) => OUT_SLEEPING_REASON_LABEL[type] === label) ?? null;

const getNextSunday = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + diff);
  return sunday;
};

const getNextMonday = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day <= 1 ? 1 - day : 8 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday;
};

export const OutSleepingApplyForm = () => {
  const navigation = useNavigation();
  const { apply, loading } = useOutSleepingApply();

  const [reasonType, setReasonType] = useState<OutSleepingReasonType | null>(null);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState(getNextSunday);
  const [endDate, setEndDate] = useState(getNextMonday);

  const handleSelectLabel = useCallback((label: string) => {
    setReasonType(typeOfLabel(label));
  }, []);

  const handleSubmit = useCallback(async () => {
    const success = await apply({ reasonType, reason, startDate, endDate });
    if (success) navigation.goBack();
  }, [apply, reasonType, reason, startDate, endDate, navigation]);

  return (
    <>
      <View style={styles.form}>
        <Dropdown
          items={REASON_LABELS}
          value={reasonType ? OUT_SLEEPING_REASON_LABEL[reasonType] : ""}
          placeholder="사유 선택"
          onSelectedItemChange={handleSelectLabel}
        />
        {reasonType === "ETC" && (
          <TextField label="외박 사유" value={reason} onChangeText={setReason} />
        )}
        <DatePickerRow label="외출 날짜" date={startDate} onChangeDate={setStartDate} />
        <DatePickerRow label="복귀 날짜" date={endDate} onChangeDate={setEndDate} />
      </View>

      <View style={styles.spacer} />

      <FilledButton size="large" display="fill" isLoading={loading} onPress={handleSubmit}>
        신청
      </FilledButton>
    </>
  );
};

const styles = StyleSheet.create({
  form: { gap: 16 },
  spacer: { flex: 1 },
});