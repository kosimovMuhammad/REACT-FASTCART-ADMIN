import axiosInstance from './axiosInstance';
import type { ApiResponse, Color } from '@/types';

export interface ColorsListResponse {
  data: Color[];
  totalRecord: number;
}

export const colorsApi = {
  getColors: (params?: { ColorName?: string; PageNumber?: number; PageSize?: number }) =>
    axiosInstance.get<ApiResponse<ColorsListResponse>>('/Color/get-colors', params),

  getColorById: (id: number) =>
    axiosInstance.get<ApiResponse<Color>>('/Color/get-color-by-id', { id }),

  addColor: (ColorName: string) =>
    axiosInstance.post<ApiResponse<Color>>('/Color/add-color', undefined, { ColorName }),

  updateColor: (Id: number, ColorName: string) =>
    axiosInstance.put<ApiResponse<Color>>('/Color/update-color', undefined, { Id, ColorName }),

  deleteColor: (id: number) =>
    axiosInstance.delete<ApiResponse<boolean>>('/Color/delete-color', { id }),
};
