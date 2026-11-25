import { resolveDeepLink } from "./deepLinkResolver";

type PendingNavigationState = NonNullable<ReturnType<typeof resolveDeepLink>>;

export type PendingTarget =
  | { type: "deepLink"; url: string; notificationId?: string }
  | { type: "webView"; appUrl: string; name: string; notificationId?: string };

let pendingTarget: PendingTarget | null = null;

export const pendingDeepLink = {
  save(url: string, notificationId?: string) {
    pendingTarget = { type: "deepLink", url, notificationId };
  },

  saveWebView(appUrl: string, name: string, notificationId?: string) {
    pendingTarget = { type: "webView", appUrl, name, notificationId };
  },

  consume() {
    const target = pendingTarget;
    pendingTarget = null;
    return target;
  },

  peek() {
    return pendingTarget;
  },

  clear() {
    pendingTarget = null;
  },

  hasPending() {
    return pendingTarget !== null;
  },
};

export function resolvePendingNavigation(
  target: PendingTarget | null,
): { state: PendingNavigationState; notificationId?: string } | undefined {
  if (!target) return undefined;

  if (target.type === "deepLink") {
    const state = resolveDeepLink(target.url);
    return state ? { state, notificationId: target.notificationId } : undefined;
  }

  return {
    state: {
      index: 1,
      routes: [
        { name: "Main" },
        {
          name: "AppWebView",
          params: {
            appUrl: target.appUrl,
            name: target.name,
          },
        },
      ],
    },
    notificationId: target.notificationId,
  };
}
