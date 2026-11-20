let pendingUrl: string | null = null;

export const pendingDeepLink = {
  save(url: string) {
    pendingUrl = url;
  },

  saveAidEntry(route: { name: string; params?: object } | undefined) {
    if (route?.name !== "AidEntry") return;
    const appId = (route.params as { appId?: unknown } | undefined)?.appId;
    if (typeof appId === "string" && appId) {
      pendingUrl = `dodamdodam://apps/${encodeURIComponent(appId)}`;
    }
  },

  consume() {
    const url = pendingUrl;
    pendingUrl = null;
    return url;
  },

  peek() {
    return pendingUrl;
  },

  clear() {
    pendingUrl = null;
  },

  hasPending() {
    return pendingUrl !== null;
  },
};
