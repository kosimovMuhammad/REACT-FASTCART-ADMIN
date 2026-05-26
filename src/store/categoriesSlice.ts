import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { FetchProductsParams } from './productsSlice';

const BASE = 'https://fastcard-1-o23z.onrender.com/api';

export interface SubCategory { 
  id: number; 
  subCategoryName: string; 
  categoryId: number; 
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
  brandId: number | null;
  brandName?: string;       
  colorId: number | null;
  colorName?: string;       
  subCategoryId: number | null;
  subCategoryName?: string; 
  categoryId: number;
  categoryName: string;
  image: string | null;
  images: string[] | null;
  rating?: number;          
}

export interface Category { 
  id: number; 
  categoryName: string; 
  categoryImage?: string | null; 
  subCategories: SubCategory[]; 
}

interface CategoriesState {
  categories: Category[];
  subCategories: SubCategory[];
  loading: boolean;
  error: string | null;
  addLoading: boolean;
  addError: string | null;
  editLoading: boolean;
  editError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  subCategories: [],
  loading: false,
  error: null,
  addLoading: false,
  addError: null,
  editLoading: false,
  editError: null,
  deleteLoading: false,
  deleteError: null,
};

function getToken(state: RootState) {
  return state.auth.token ?? '';
}

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'Unknown error occurred';
};


export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Category/get-categories`, {
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const json = await res.json();
      const data = json.data ?? json;
      return Array.isArray(data) ? (data as Category[]) : [];
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchSubCategories = createAsyncThunk(
  'categories/fetchSubCategories',
  async (categoryId: number, { getState,  }) => {
    const state = getState() as RootState;
    const token = getToken(state);
    
    try {
      const res = await fetch(`${BASE}/SubCategory/get-subcategories?categoryId=${categoryId}`, {
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      });

      if (res.status === 404) {
        return []; 
      }

      if (!res.ok) throw new Error('Failed to fetch subcategories');
      
      const json = await res.json();
      const data = json.data ?? json;
      return Array.isArray(data) ? (data as SubCategory[]) : [];
    } catch (err: unknown) {
      // Ба ҷои reject, массиви холӣ медиҳем, то интерфейс вайрон нашавад
      return [];
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: FetchProductsParams, { getState, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    const q = new URLSearchParams();
    
    if (params.pageNumber) q.set('PageNumber', String(params.pageNumber));
    if (params.pageSize)   q.set('PageSize',   String(params.pageSize));
    if (params.productName) q.set('ProductName', params.productName);

    try {
      const res = await fetch(`${BASE}/Product/get-products?${q}`, {
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      }); 
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const json = await res.json();
      const list: Product[] = json.data?.products ?? [];
      const totalCount = json.data?.totalRecords ?? list.length;
      
      return { products: list, total: totalCount };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (formData: FormData, { getState, dispatch, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Category/add-category`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add category');
      dispatch(fetchCategories());
      return true;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async (formData: FormData, { getState, dispatch, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Category/update-category`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update category');
      dispatch(fetchCategories());
      return true;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: number, { getState, dispatch, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Category/delete-category?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      });
      if (!res.ok) throw new Error('Failed to delete category');
      dispatch(fetchCategories());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/* ── Slice ── */

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearAddError:    (s) => { s.addError = null; },
    clearEditError:   (s) => { s.editError = null; },
    clearDeleteError: (s) => { s.deleteError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending,      (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCategories.fulfilled,    (s, a) => { s.loading = false; s.categories = a.payload; })
      .addCase(fetchCategories.rejected,     (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(fetchSubCategories.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSubCategories.fulfilled, (s, a) => { s.loading = false; s.subCategories = a.payload; })
      .addCase(fetchSubCategories.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(addCategory.pending,    (s) => { s.addLoading = true; s.addError = null; })
      .addCase(addCategory.fulfilled,  (s) => { s.addLoading = false; })
      .addCase(addCategory.rejected,   (s, a) => { s.addLoading = false; s.addError = a.payload as string; })

      .addCase(updateCategory.pending,   (s) => { s.editLoading = true; s.editError = null; })
      .addCase(updateCategory.fulfilled, (s) => { s.editLoading = false; })
      .addCase(updateCategory.rejected,  (s, a) => { s.editLoading = false; s.editError = a.payload as string; })

      .addCase(deleteCategory.pending,   (s) => { s.deleteLoading = true; s.deleteError = null; })
      .addCase(deleteCategory.fulfilled, (s) => { s.deleteLoading = false; })
      .addCase(deleteCategory.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload as string; });
  },
});

export const { clearAddError, clearEditError, clearDeleteError } = categoriesSlice.actions;
export default categoriesSlice.reducer;