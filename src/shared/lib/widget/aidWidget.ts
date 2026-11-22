import { NativeModules, Platform } from "react-native";
import type { InApp } from "@entities/inapp/types";

interface AidWidgetModule {
  updateApps(appsJson: string): Promise<void>;
}

const aidWidgetModule: AidWidgetModule | undefined = NativeModules.AidWidget;

export const supportsAidWidget = Platform.OS === "android" && Boolean(aidWidgetModule);

export const saveAidAppsToWidget = async (apps: InApp[]): Promise<void> => {
  if (!supportsAidWidget) return;
  await aidWidgetModule!.updateApps(JSON.stringify(
    apps.map(({ appId, name, subtitle, iconUrl, darkIconUrl }) => ({ appId, name, subtitle, iconUrl, darkIconUrl })),
  ));
};
