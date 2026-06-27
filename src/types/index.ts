export interface ApiResponse<T> {
  data: T;
  errors: string[];
  statusCode: number;
}

export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPage: number;
  totalRecord: number;
  data: T[];
  errors: string[];
  statusCode: number;
}

export interface Brand {
  id: number;
  brandName: string;
}

export interface SubCategory {
  id: number;
  subCategoryName: string;
  categoryId: number;
}

export interface Category {
  id: number;
  categoryName: string;
  categoryImage?: string | null;
  subCategories: SubCategory[];
}

export interface Color {
  id: number;
  colorName: string;
}

export interface ProductImage {
  id: number;
  imageUrl?: string;
  imageName?: string;
}

export interface Product {
  id: number;
  productName: string;
  code: string;
  description: string;
  price: number;
  discountPrice: number | null;
  hasDiscount: boolean;
  quantity: number;
  weight: string | null;
  size: string | null;
  brandId: number;
  brandName: string;
  colorId: number;
  colorName: string;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  image: string | null;
  images: string[] | null;
}

export interface UserProfile {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string | null;
  imageUrl: string | null;
  roles: string[];
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FetchProductsParams {
  userId?: string;
  productName?: string;
  minPrice?: number;
  maxPrice?: number;
  brandId?: number;
  colorId?: number;
  categoryId?: number;
  subcategoryId?: number;
  pageNumber?: number;
  pageSize?: number;
}
