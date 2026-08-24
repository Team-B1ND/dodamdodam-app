export const inappQueryKeys = {
  activeApps: ["inapp", "active"] as const,
  teamName: (appId: string) => ["inapp", "team-name", appId] as const,
};
