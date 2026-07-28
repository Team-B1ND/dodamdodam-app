import { basicApiHandler } from "@entities/api/common";
import type { ApiResponse } from "@shared/types";
import type { Team } from "@entities/team/types";

export const teamApi = {
  getAll: () => basicApiHandler.get<ApiResponse<Team[]>>("/teams"),
  getMy: () => basicApiHandler.get<ApiResponse<Team[]>>("/teams/my"),
};
