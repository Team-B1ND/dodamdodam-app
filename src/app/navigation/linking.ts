import type { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { validateSession } from "@features/auth/session";
import {
  deepLinkPrefixes,
  resolveDeepLink,
} from "./deepLinkResolver";
import type { RootStackParamList } from "./navigationTypes";
import { pendingDeepLink } from "./pendingDeepLink";

interface CreateLinkingOptions {
  onAuthenticationRequired: () => void;
}

export const createLinking = ({
  onAuthenticationRequired,
}: CreateLinkingOptions): LinkingOptions<RootStackParamList> => ({
  prefixes: deepLinkPrefixes,
  config: {
    screens: {
      Main: {
        path: "",
        screens: {
          Home: "home",
          Meal: "meal",
          OutSleeping: "out-sleeping",
          NightStudy: "night-study",
          More: "more",
        },
      },

      Notification: "notifications",
      OutSleepingApply: "out-sleeping/apply",

      NightStudyApply: {
        path: "night-study/apply",
        parse: {
          tab: value =>
            value === "project" || value === "personal"
              ? value
              : undefined,
        },
      },
    },
  },

  // 콜드 스타트 딥링크가 Landing의 인증 확인을 건너뛰지 않도록 보류한다.
  getInitialURL: async () => {
    const url = await Linking.getInitialURL();

    if (url && resolveDeepLink(url)) {
      pendingDeepLink.save(url);
    }

    return null;
  },

  subscribe: listener => {
    let active = true;

    const subscription = Linking.addEventListener("url", async ({ url }) => {
      if (!resolveDeepLink(url)) return;

      const authenticated = await validateSession();
      if (!active) return;

      if (authenticated) {
        listener(url);
        return;
      }

      pendingDeepLink.save(url);
      onAuthenticationRequired();
    });

    return () => {
      active = false;
      subscription.remove();
    };
  },
});
