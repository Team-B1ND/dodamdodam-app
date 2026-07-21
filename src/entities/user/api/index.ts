import axios from "axios";
import { basicApiHandler } from "@entities/api/common";
import type { ApiResponse } from "@shared/types";
import type { User, UpdateUserRequest, StudentInfo, TeacherInfo, UserSearchParams, UserSearchResponse, ChangePasswordRequest, ResetPasswordRequest } from "@entities/user/types";
import { env } from "@shared/config";

export const userApi = {
  getMe: () => basicApiHandler.get<ApiResponse<User>>("/user/me"),

  updateMe: (body: UpdateUserRequest) =>
    basicApiHandler.patch<ApiResponse<User>>("/user", body),

  updateStudent: (body: StudentInfo) =>
    basicApiHandler.patch<ApiResponse<void>>("/user/student", body),

  updateTeacher: (body: TeacherInfo) =>
    basicApiHandler.patch<ApiResponse<void>>("/user/teacher", body),

  changePassword: (body: ChangePasswordRequest) =>
    basicApiHandler.patch<ApiResponse<void>>("/user/password", body),

  resetPassword: (body: ResetPasswordRequest) =>
    axios.patch<ApiResponse<void>>(`${env.API_BASE_URL}/user/reset-password`, body),

  search: (params: UserSearchParams) => {
    const query: Record<string, any> = {
      roles: params.roles,
      generationOnly: params.generationOnly,
      page: params.page,
      size: params.size,
    };
    if (params.keyword) query.keyword = params.keyword;
    return basicApiHandler.get<ApiResponse<UserSearchResponse>>("/user/search", {
      params: query,
    });
  },
};
