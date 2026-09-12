let pendingUrl: string | null = null;

export const pendingDeepLink = {
  save(url: string) {
    pendingUrl = url;
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
