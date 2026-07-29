import { basicApiHandler } from "@entities/api/common";
import type { ApiResponse } from "@shared/types";
import type {
  InfinityScrollResponse,
  NightStudyPersonal,
  NightStudyProject,
  NightStudyPersonalRequest,
  NightStudyProjectRequest,
  NightStudyTeam,
  NightStudyTeamMember,
} from "@entities/night-study/types";

export const nightStudyApi = {
  getMyPersonal: () =>
    basicApiHandler.get<ApiResponse<NightStudyPersonal[]>>("/nightstudy/my/personal"),

  getMyProject: () =>
    basicApiHandler.get<ApiResponse<NightStudyProject[]>>("/nightstudy/my/project"),

  createPersonal: (body: NightStudyPersonalRequest) =>
    basicApiHandler.post<ApiResponse>("/nightstudy/personal", body),

  createProject: (body: NightStudyProjectRequest) =>
    basicApiHandler.post<ApiResponse>("/nightstudy/project", body),

  getTeams: (page = 0, size = 20) =>
    basicApiHandler.get<ApiResponse<InfinityScrollResponse<NightStudyTeam>>>(
      "/nightstudy/teams",
      { params: { page, size } },
    ),

  getTeamMembers: (publicId: string) =>
    basicApiHandler.get<ApiResponse<NightStudyTeamMember[]>>(
      `/nightstudy/teams/${publicId}`,
    ),

  delete: (id: string) =>
    basicApiHandler.delete<ApiResponse>(`/nightstudy/${id}`),
};
