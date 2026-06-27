import axiosInstance from './axiosInstance';
import type { ApiResponse, UserProfile } from '@/types';

export interface UserProfileListResponse {
  data: UserProfile[];
  totalRecord: number;
}

export const userProfileApi = {
  getUserProfiles: (params?: { UserName?: string; PageNumber?: number; PageSize?: number }) =>
    axiosInstance.get<ApiResponse<UserProfileListResponse>>('/UserProfile/get-user-profiles', params),

  getUserProfileById: (id: number) =>
    axiosInstance.get<ApiResponse<UserProfile>>('/UserProfile/get-user-profile-by-id', { id }),

  updateUserProfile: (formData: FormData) =>
    axiosInstance.putForm<ApiResponse<UserProfile>>('/UserProfile/update-user-profile', formData),

  deleteUser: (id: number) =>
    axiosInstance.delete<ApiResponse<boolean>>('/UserProfile/delete-user', { id }),

  addRoleToUser: (UserId: string, RoleId: string) =>
    axiosInstance.post<ApiResponse<boolean>>('/UserProfile/addrole-from-user', undefined, { UserId, RoleId } as Record<string, string | number | boolean | null | undefined>),

  removeRoleFromUser: (UserId: string, RoleId: string) =>
    axiosInstance.delete<ApiResponse<boolean>>('/UserProfile/remove-role-from-user', { UserId, RoleId } as Record<string, string | number | boolean | null | undefined>),

  getUserRoles: () =>
    axiosInstance.get<ApiResponse<string[]>>('/UserProfile/get-user-roles'),
};
