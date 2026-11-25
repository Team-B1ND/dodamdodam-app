import { basicApiHandler } from "@entities/api/common";
import type { ApiResponse } from "@shared/types";
import type {
  WeekendStudyDeadline,
  WeekendStudyPersonal,
  WeekendStudyPersonalRequest,
  WeekendStudyProject,
} from "@entities/weekend-study/types";

export const weekendStudyApi = {
  getMyPersonal: () =>
    basicApiHandler.get<ApiResponse<WeekendStudyPersonal[]>>(
      "/weekendstudy/my/personal",
    ),

  getMyProject: () =>
    basicApiHandler.get<ApiResponse<WeekendStudyProject[]>>(
      "/weekendstudy/my/project",
    ),

  getDeadline: () =>
    basicApiHandler.get<ApiResponse<WeekendStudyDeadline | null | undefined>>(
      "/weekendstudy/deadline",
    ),

  createPersonal: (body: WeekendStudyPersonalRequest) =>
    basicApiHandler.post<ApiResponse>("/weekendstudy/personal", body),

  cancel: (id: string) =>
    basicApiHandler.delete<ApiResponse>(`/weekendstudy/${id}`),
};
