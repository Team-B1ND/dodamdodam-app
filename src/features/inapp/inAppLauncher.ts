import { inappApi } from "@entities/inapp/api";
import { skipStorage } from "@entities/inapp/storage/skipStorage";
import type { InApp } from "@entities/inapp/types";

const PAGE_SIZE = 50;

// 단건 조회 응답엔 appUrl이 없어 활성 목록에서 찾는다.
// 딥링크 경로는 소문자로 정규화되므로 appId는 대소문자를 무시하고 비교한다.
export const findActiveInApp = async (appId: string): Promise<InApp | undefined> => {
  const target = appId.toLowerCase();

  for (let page = 0; ; page++) {
    const { data } = await inappApi.getActiveApps(page, PAGE_SIZE);
    const found = data.data.content.find((app) => app.appId.toLowerCase() === target);
    if (found) return found;
    if (!data.data.hasNext) return undefined;
  }
};

// 소개를 다시 보지 않기로 한 미니앱은 바로 웹뷰로, 아니면 소개 화면으로 연다.
export const getInAppRoute = async (app: InApp) => {
  if (await skipStorage.isSkipped(app.appId)) {
    return { name: "AppWebView", params: { appUrl: app.appUrl, name: app.name } } as const;
  }

  return {
    name: "AppIn",
    params: {
      appId: app.appId,
      name: app.name,
      subTitle: app.subtitle,
      description: app.description,
      iconUrl: app.iconUrl,
      darkIconUrl: app.darkIconUrl,
      appUrl: app.appUrl,
    },
  } as const;
};
