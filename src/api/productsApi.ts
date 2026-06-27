import axiosInstance from './axiosInstance';
import type { ApiResponse, Product, FetchProductsParams } from '@/types';

export interface ProductsListResponse {
  data: Product[];
  totalRecord: number;
  pageNumber: number;
  pageSize: number;
  totalPage: number;
}

export const productsApi = {
  getProducts: (params?: FetchProductsParams) => {
    const mapped: Record<string, string | number | boolean | null | undefined> = {};
    if (params?.userId)       mapped['UserId'] = params.userId;
    if (params?.productName)  mapped['ProductName'] = params.productName;
    if (params?.minPrice)     mapped['MinPrice'] = params.minPrice;
    if (params?.maxPrice)     mapped['MaxPrice'] = params.maxPrice;
    if (params?.brandId)      mapped['BrandId'] = params.brandId;
    if (params?.colorId)      mapped['ColorId'] = params.colorId;
    if (params?.categoryId)   mapped['CategoryId'] = params.categoryId;
    if (params?.subcategoryId) mapped['SubcategoryId'] = params.subcategoryId;
    if (params?.pageNumber)   mapped['PageNumber'] = params.pageNumber;
    if (params?.pageSize)     mapped['PageSize'] = params.pageSize;
    return axiosInstance.get<ApiResponse<ProductsListResponse>>('/Product/get-products', mapped);
  },

  getProductById: (id: number) =>
    axiosInstance.get<ApiResponse<Product>>('/Product/get-product-by-id', { id }),

  addProduct: (formData: FormData) =>
    axiosInstance.postForm<ApiResponse<Product>>('/Product/add-product', formData),

  updateProduct: (formData: FormData) =>
    axiosInstance.putForm<ApiResponse<Product>>('/Product/update-product', formData),

  addImagesToProduct: (formData: FormData) =>
    axiosInstance.postForm<ApiResponse<Product>>('/Product/add-image-to-product', formData),

  deleteImageFromProduct: (imageId: number) =>
    axiosInstance.delete<ApiResponse<boolean>>('/Product/delete-image-from-product', { imageId }),

  deleteProduct: (id: number) =>
    axiosInstance.delete<ApiResponse<boolean>>('/Product/delete-product', { id }),
};
