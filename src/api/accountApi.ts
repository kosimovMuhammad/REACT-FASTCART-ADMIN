import axiosInstance from './axiosInstance';
import type { ApiResponse, LoginRequest, RegisterRequest } from '@/types';

export const accountApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<ApiResponse<string>>('/Account/login', data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<string>>('/Account/register', data),
};
