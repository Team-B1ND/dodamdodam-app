import { basicApiHandler } from "@entities/api/common";
import type { ApiResponse, InfinityScrollResponse } from "@shared/types";
import type { Team, TeamMember, UpdateTeamRequest } from "../types";

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

  getMyInvitations: (page = 0, size = 20) =>
    basicApiHandler.get<ApiResponse<InfinityScrollResponse<Team>>>(
      "/nightstudy/teams/invite/my",
      { params: { page, size } },
    ),

  getMembers: (publicId: string) =>
    basicApiHandler.get<ApiResponse<TeamMember[]>>(`/nightstudy/teams/${publicId}`),

  create: (body: CreateTeamRequest) =>
    basicApiHandler.post<ApiResponse<CreateTeamResponse | null>>("/nightstudy/teams", body),

  inviteTeam: (publicId: string, members: string[]) =>
    basicApiHandler.post<ApiResponse<void>>("/nightstudy/teams/invite", { publicId, members }),

  acceptInvitation: (publicId: string) =>
    basicApiHandler.patch<ApiResponse<void>>(
      `/nightstudy/teams/invite/accept/${publicId}`,
    ),

  rejectInvitation: (publicId: string) =>
    basicApiHandler.delete<ApiResponse<void>>(
      `/nightstudy/teams/invite/reject/${publicId}`,
    ),

  updateTeam: (body: UpdateTeamRequest) =>
    basicApiHandler.patch<ApiResponse<void>>("/nightstudy/teams", body),

  deleteTeam: (publicId: string) =>
    basicApiHandler.delete<ApiResponse<void>>(`/nightstudy/teams/${publicId}`),

  leaveTeam: (publicId: string) =>
    basicApiHandler.delete<ApiResponse<void>>(`/nightstudy/teams/leave/${publicId}`),
};
