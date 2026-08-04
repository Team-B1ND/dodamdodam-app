import { basicApiHandler } from "@entities/api/common";
import type { ApiResponse } from "@shared/types";
import type { InfinityScrollResponse } from "@entities/night-study/types";
import type { Team, TeamMember } from "../types";

export interface CreateTeamRequest {
  name: string;
  description: string;
  imageUrl: string | null;
}

export interface CreateTeamResponse {
  publicId: string;
}

export const teamApi = {
  getAll: (page = 0, size = 20) =>
    basicApiHandler.get<ApiResponse<InfinityScrollResponse<Team>>>(
      "/nightstudy/teams",
      { params: { page, size } },
    ),

  getMy: (page = 0, size = 20) =>
    basicApiHandler.get<ApiResponse<InfinityScrollResponse<Team>>>(
      "/nightstudy/teams/my",
      { params: { page, size } },
    ),

  getMembers: (publicId: string) =>
    basicApiHandler.get<ApiResponse<TeamMember[]>>(`/nightstudy/teams/${publicId}`),

  create: (body: CreateTeamRequest) =>
    basicApiHandler.post<ApiResponse<CreateTeamResponse | null>>("/nightstudy/teams", body),

  inviteTeam: (publicId: string, members: string[]) =>
    basicApiHandler.post<ApiResponse<void>>("/nightstudy/teams/invite", { publicId, members }),
};
