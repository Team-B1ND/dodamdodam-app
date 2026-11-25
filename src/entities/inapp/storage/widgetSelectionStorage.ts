import * as SecureStore from "expo-secure-store";

const WIDGET_SELECTION_KEY = "inapp_widget_selected_ids";

const parseIds = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
};

export const widgetSelectionStorage = {
  getSelectedIds: async (): Promise<string[]> => {
    const raw = await SecureStore.getItemAsync(WIDGET_SELECTION_KEY);
    return parseIds(raw);
  },

  setSelectedIds: async (ids: string[]) => {
    const uniqueIds = Array.from(new Set(ids));
    await SecureStore.setItemAsync(WIDGET_SELECTION_KEY, JSON.stringify(uniqueIds));
  },
};
