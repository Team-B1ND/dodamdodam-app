import { basicApiHandler } from "@entities/api/common";
import type { ApiResponse } from "@shared/types";
import type { Team, TeamDetail } from "../types";

export const teamApi = {
  getAll: () => basicApiHandler.get<ApiResponse<Team[]>>("/teams"),
  getMy: () => basicApiHandler.get<ApiResponse<Team[]>>("/teams/my"),
  getDetail: (teamId: string) =>
    basicApiHandler.get<ApiResponse<TeamDetail>>(`/teams/${teamId}`),
};
