import { useCallback } from "react";
import * as Haptics from "expo-haptics";

export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "soft"
  | "rigid"
  | "selection"
  | "success"
  | "warning"
  | "error";

const IMPACT_MAP: Record<string, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  soft: Haptics.ImpactFeedbackStyle.Soft,
  rigid: Haptics.ImpactFeedbackStyle.Rigid,
};

const NOTIFICATION_MAP: Record<string, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
};

export const triggerHaptic = async (type: HapticType = "light") => {
  if (type === "selection") return Haptics.selectionAsync();

  const impact = IMPACT_MAP[type];
  if (impact !== undefined) return Haptics.impactAsync(impact);

  const notification = NOTIFICATION_MAP[type];
  if (notification !== undefined) return Haptics.notificationAsync(notification);
};

export const useHaptic = (type: HapticType = "light") =>
  useCallback(() => {
    triggerHaptic(type);
  }, [type]);
