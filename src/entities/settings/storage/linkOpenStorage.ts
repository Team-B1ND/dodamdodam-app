import * as SecureStore from "expo-secure-store";

const KEY = "external_link_open_mode";

export type LinkOpenMode = "webview" | "browser";

export const linkOpenStorage = {
  get: async (): Promise<LinkOpenMode> =>
    (await SecureStore.getItemAsync(KEY)) === "browser" ? "browser" : "webview",

  set: (mode: LinkOpenMode) => SecureStore.setItemAsync(KEY, mode),
};
