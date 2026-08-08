import { basicApiHandler } from "@entities/api/common";
import type { ApiResponse } from "@shared/types";
import type {
  NightStudyPersonal,
  NightStudyProject,
  NightStudyPersonalRequest,
  NightStudyProjectRequest,
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

  delete: (id: string) =>
    basicApiHandler.delete<ApiResponse>(`/nightstudy/${id}`),
};
