import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

export const IMAGE_URL =
  (import.meta.env.VITE_IMAGE_URL as string) ||
  `${import.meta.env.VITE_API_URL as string}/images/`;

export const getImageUrl = (imageName?: string | null): string | undefined => {
  if (!imageName) return undefined;
  if (/^(https?:|blob:|data:)/.test(imageName)) return imageName;
  return `${IMAGE_URL}${imageName.replace(/^\//, '')}`;
};

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

interface ProductsState {
  items: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  addLoading: boolean;
  addError: string | null;
  addSuccess: boolean;
}

const initialState: ProductsState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  deleteLoading: false,
  deleteError: null,
  addLoading: false,
  addError: null,
  addSuccess: false,
};

export interface FetchProductsParams {
  pageNumber?: number;
  pageSize?: number;
  productName?: string;
}

/* ── Thunks ── */

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: FetchProductsParams, { rejectWithValue }) => {
    const q: Record<string, string | number> = {};
    if (params.pageNumber) q.PageNumber = params.pageNumber;
    if (params.pageSize)   q.PageSize   = params.pageSize;
    if (params.productName) q.ProductName = params.productName;
    try {
      const json = await axiosInstance.get<Record<string, unknown>>('/Product/get-products', q);
      const data = (json.data ?? json) as Record<string, unknown> | Product[];
      const list: Product[] = Array.isArray(data)
        ? (data as Product[])
        : (((data as Record<string, unknown>).items ?? (data as Record<string, unknown>).products ?? []) as Product[]);
      const d = data as Record<string, unknown>;
      const totalCount = (
        d.totalRecords ?? d.totalCount ?? d.totalRecord ??
        (json as Record<string, unknown>).totalRecord ??
        (json as Record<string, unknown>).totalRecords ??
        (json as Record<string, unknown>).total ??
        list.length
      ) as number;
      return { products: list, total: totalCount };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/Product/delete-product', { id });
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Delete failed');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (formData: FormData, { rejectWithValue }) => {
    console.log('[addProduct] token from localStorage:', localStorage.getItem('token') ? `${localStorage.getItem('token')!.slice(0, 20)}…` : 'MISSING');
    try {
      const json = await axiosInstance.postForm<Record<string, unknown>>('/Product/add-product', formData);
      const created = (json.data ?? json) as Product;

      if (created?.id) {
        try {
          const refreshJson = await axiosInstance.get<Record<string, unknown>>('/Product/get-product-by-id', { id: created.id });
          return ((refreshJson as Record<string, unknown>).data ?? refreshJson) as Product;
        } catch {
          // fall through to return created
        }
      }

      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add product';
      if (msg.includes('403')) return rejectWithValue('Access denied: Admin role required');
      return rejectWithValue(msg);
    }
  }
);

export interface UpdateProductParams {
  Id: number;
  ProductName: string;
  Code?: string;
  Description?: string;
  Price: number;
  DiscountPrice?: number;
  HasDiscount: boolean;
  Quantity: number;
  SubCategoryId?: number;
  BrandId?: number;
  ColorId?: number;
  Size?: string;
  Weight?: string;
}

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (params: UpdateProductParams, { rejectWithValue }) => {
    try {
      const json = await axiosInstance.put<Record<string, unknown>>('/Product/update-product', undefined, params as unknown as Record<string, string | number | boolean | null | undefined>);
      return ((json as Record<string, unknown>).data ?? json) as Product;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update product';
      console.error('[updateProduct] error:', msg);
      if (msg.includes('403')) return rejectWithValue('Access denied: Admin role required');
      if (msg.includes('401')) return rejectWithValue('Unauthorized: please login again');
      return rejectWithValue(msg);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearAddSuccess:  (state) => { state.addSuccess = false; state.addError = null; },
    clearDeleteError: (state) => { state.deleteError = null; },
    clearErrors:      (state) => { state.error = null; state.addError = null; state.deleteError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.products; s.total = a.payload.total; })
      .addCase(fetchProducts.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(deleteProduct.pending,   (s) => { s.deleteLoading = true;  s.deleteError = null; })
      .addCase(deleteProduct.fulfilled, (s, a) => { s.deleteLoading = false; s.items = s.items.filter(p => p.id !== a.payload); s.total = Math.max(0, s.total - 1); })
      .addCase(deleteProduct.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload as string; })

      .addCase(addProduct.pending,   (s) => { s.addLoading = true;  s.addError = null; s.addSuccess = false; })
      .addCase(addProduct.fulfilled, (s, a) => { s.addLoading = false; s.addSuccess = true; s.items.unshift(a.payload); s.total += 1; })
      .addCase(addProduct.rejected,  (s, a) => { s.addLoading = false; s.addError = a.payload as string; })

      .addCase(updateProduct.pending,   (s) => { s.addLoading = true;  s.addError = null; s.addSuccess = false; })
      .addCase(updateProduct.fulfilled, (s, a) => {
        s.addLoading = false;
        s.addSuccess = true;
        s.items = s.items.map(item => item.id === a.payload.id ? a.payload : item);
      })
      .addCase(updateProduct.rejected,  (s, a) => { s.addLoading = false; s.addError = a.payload as string; });
  },
});

export const { clearAddSuccess, clearDeleteError, clearErrors } = productsSlice.actions;
export default productsSlice.reducer;
