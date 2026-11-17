import { NativeModules } from "react-native";
import type { InApp } from "@entities/inapp/types";

const { RNInAppWidgetModule } = NativeModules;

export const saveInAppsToWidget = (apps: InApp[]) => {
  RNInAppWidgetModule?.saveInApps(JSON.stringify(apps));
};
