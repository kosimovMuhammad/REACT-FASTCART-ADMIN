import axiosInstance from './axiosInstance';
import type { ApiResponse, SubCategory } from '@/types';

export const subCategoryApi = {
  getSubCategories: () =>
    axiosInstance.get<ApiResponse<SubCategory[]>>('/SubCategory/get-sub-category'),

  getSubCategoryById: (id: number) =>
    axiosInstance.get<ApiResponse<SubCategory>>('/SubCategory/get-sub-category-by-id', { id }),

  addSubCategory: (CategoryId: number, SubCategoryName: string) =>
    axiosInstance.post<ApiResponse<SubCategory>>('/SubCategory/add-sub-category', undefined, { CategoryId, SubCategoryName }),

  updateSubCategory: (Id: number, CategoryId: number, SubCategoryName: string) =>
    axiosInstance.put<ApiResponse<SubCategory>>('/SubCategory/update-sub-category', undefined, { Id, CategoryId, SubCategoryName }),

  deleteSubCategory: (id: number) =>
    axiosInstance.delete<ApiResponse<boolean>>('/SubCategory/delete-sub-category', { id }),
};
