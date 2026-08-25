import { basicApiHandler } from "@entities/api/common";
import type { ApiResponse } from "@shared/types";
import type { InAppPageResponse, InAppDetail, InAppTeam } from "@entities/inapp/types";

export const inappApi = {
  getActiveApps: (page: number, size: number = 10) =>
    basicApiHandler.get<ApiResponse<InAppPageResponse>>("/inapp/app/active", {
      params: { page, size },
    }),

  getApp: (appId: string) =>
    basicApiHandler.get<ApiResponse<InAppDetail>>(`/inapp/app/${appId}`),

  getTeam: (teamId: string) =>
    basicApiHandler.get<ApiResponse<InAppTeam>>(`/inapp/team/${teamId}`),
};
