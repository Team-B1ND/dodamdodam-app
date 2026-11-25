export const inappQueryKeys = {
  activeApps: ["inapp", "active"] as const,
  widgetApps: ["inapp", "widget"] as const,
  widgetSelectedIds: ["inapp", "widget-selected-ids"] as const,
  teamName: (appId: string) => ["inapp", "team-name", appId] as const,
};
