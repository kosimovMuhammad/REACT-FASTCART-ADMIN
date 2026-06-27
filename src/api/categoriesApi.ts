import axiosInstance from './axiosInstance';
import type { ApiResponse, Category } from '@/types';

export const categoriesApi = {
  getCategories: () =>
    axiosInstance.get<ApiResponse<Category[]>>('/Category/get-categories'),

  getCategoryById: (id: number) =>
    axiosInstance.get<ApiResponse<Category>>('/Category/get-category-by-id', { id }),

  addCategory: (formData: FormData) =>
    axiosInstance.postForm<ApiResponse<Category>>('/Category/add-category', formData),

  updateCategory: (formData: FormData) =>
    axiosInstance.putForm<ApiResponse<Category>>('/Category/update-category', formData),

  deleteCategory: (id: number) =>
    axiosInstance.delete<ApiResponse<boolean>>('/Category/delete-category', { id }),
};
