import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './index';

const BASE = 'https://fastcard-1-o23z.onrender.com/api';

// Папкаи доимии расмҳо (аз рӯи супориши шумо)
export const IMAGE_URL = 'https://fastcard-1-o23z.onrender.com/images/';

/**
 * Convert any image path or name returned by the API to a full absolute URL.
 * Handles: absolute URLs, relative paths, blob:, data: URIs, and simple filenames.
 */
export const getImageUrl = (imageName?: string | null): string | undefined => {
  if (!imageName) return undefined;
  // Агар расм аллакай URL-и пурра дошта бошад (масалан http ё https)
  if (/^(https?:|blob:|data:)/.test(imageName)) return imageName;
  
  // Дар акси ҳол, номи файлро ба IMAGE_URL мепайвандад
  // .replace(/^\//, '') барои тоза кардани слэш аз аввали номи файл (агар бошад)
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

function getToken(state: RootState) {
  return state.auth.token ?? '';
}

/* ── Thunks ── */

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
      const data  = json.data ?? json;
      const list: Product[] = Array.isArray(data) ? data : data.items ?? data.products ?? [];
      const totalCount = data.totalRecords ?? data.totalCount ?? json.totalRecords ?? json.totalCount ?? json.total ?? list.length;
      return { products: list, total: totalCount as number };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: number, { getState, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Product/delete-product?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Delete failed');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (formData: FormData, { getState, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Product/add-product`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to add product' }));
        throw new Error(err.message || `Server error ${res.status}`);
      }
      const json = await res.json();
      const created = (json.data ?? json) as Product;

      if (created?.id) {
        try {
          const refreshRes = await fetch(`${BASE}/Product/get-product-by-id?id=${created.id}`, {
            headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
          });
          if (refreshRes.ok) {
            const refreshJson = await refreshRes.json();
            return (refreshJson.data ?? refreshJson) as Product;
          }
        } catch {
        }
      }

      return created;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to add product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (formData: FormData, { getState, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    
    const id = formData.get('id') || formData.get('Id');
    const productName = formData.get('productName') || formData.get('ProductName');
    const description = formData.get('description') || formData.get('Description');
    const price = formData.get('price') || formData.get('Price');
    const quantity = formData.get('quantity') || formData.get('Quantity');
    const brandId = formData.get('brandId') || formData.get('BrandId');
    const colorId = formData.get('colorId') || formData.get('ColorId');
    const subCategoryId = formData.get('subCategoryId') || formData.get('SubCategoryId');
    const categoryId = formData.get('categoryId') || formData.get('CategoryId');
    const code = formData.get('code') || formData.get('Code');
    const weight = formData.get('weight') || formData.get('Weight');
    const size = formData.get('size') || formData.get('Size');
    const hasDiscount = formData.get('hasDiscount') || formData.get('HasDiscount');
    const discountPrice = formData.get('discountPrice') || formData.get('DiscountPrice');

    const jsonBody: Record<string, any> = {
      Id: id ? Number(id) : 0,
      ProductName: productName ? String(productName) : '',
      Description: description ? String(description) : '',
      Price: price ? Number(price) : 0,
      Quantity: quantity ? Number(quantity) : 0,
      CategoryId: categoryId ? Number(categoryId) : 0,
      Code: code ? String(code) : '',
      HasDiscount: hasDiscount === 'true' || true,
    };

    if (brandId && Number(brandId) > 0) jsonBody.BrandId = Number(brandId);
    if (colorId && Number(colorId) > 0) jsonBody.ColorId = Number(colorId);
    if (subCategoryId && Number(subCategoryId) > 0) jsonBody.SubCategoryId = Number(subCategoryId);
    
    if (weight && String(weight).trim() !== '') jsonBody.Weight = String(weight);
    if (size && String(size).trim() !== '') jsonBody.Size = String(size);
    if (discountPrice && Number(discountPrice) > 0) jsonBody.DiscountPrice = Number(discountPrice);

    try {
      const res = await fetch(`${BASE}/Product/update-product`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify(jsonBody), 
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.error("Сервер хатогӣ дод:", errJson);
        
        let errorMsg = 'Failed to update product';
        if (errJson) {
          if (errJson.errors) {
            errorMsg = Object.values(errJson.errors).flat().join(' | ');
          } else if (errJson.message) {
            errorMsg = Array.isArray(errJson.message) ? errJson.message.join(' | ') : errJson.message;
          }
        }
        throw new Error(errorMsg);
      }
      
      const json = await res.json();
      return (json.data ?? json) as Product;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update product');
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
        const updated = a.payload;
        s.items = s.items.map(item => item.id === updated.id ? updated : item);
      })
      .addCase(updateProduct.rejected,  (s, a) => { s.addLoading = false; s.addError = a.payload as string; });
  },
});

export const { clearAddSuccess, clearDeleteError, clearErrors } = productsSlice.actions;
export default productsSlice.reducer;