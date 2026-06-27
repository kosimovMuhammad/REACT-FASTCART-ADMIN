import axiosInstance from './axiosInstance';
import type { ApiResponse, Brand } from '@/types';

export interface BrandsListResponse {
  data: Brand[];
  totalRecord: number;
}

export const brandsApi = {
  getBrands: (params?: { BrandName?: string; BrandId?: number; PageNumber?: number; PageSize?: number }) =>
    axiosInstance.get<ApiResponse<BrandsListResponse>>('/Brand/get-brands', params),

  getBrandById: (id: number) =>
    axiosInstance.get<ApiResponse<Brand>>('/Brand/get-brand-by-id', { id }),

  addBrand: (BrandName: string) =>
    axiosInstance.post<ApiResponse<Brand>>('/Brand/add-brand', undefined, { BrandName }),

  updateBrand: (Id: number, BrandName: string) =>
    axiosInstance.put<ApiResponse<Brand>>('/Brand/update-brand', undefined, { Id, BrandName }),

  deleteBrand: (id: number) =>
    axiosInstance.delete<ApiResponse<boolean>>('/Brand/delete-brand', { id }),
};
