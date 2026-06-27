import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

export interface Brand { id: number; brandName: string; }

interface BrandsState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  addLoading: boolean;
  addError: string | null;
  editLoading: boolean;
  editError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: BrandsState = {
  brands: [],
  loading: false,
  error: null,
  addLoading: false,
  addError: null,
  editLoading: false,
  editError: null,
  deleteLoading: false,
  deleteError: null,
};

const toMsg = (err: unknown) => err instanceof Error ? err.message : 'Unknown error';

export const fetchBrands = createAsyncThunk(
  'brands/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const json = await axiosInstance.get<Record<string, unknown>>('/Brand/get-brands', { PageSize: 200 });
      const data = json.data ?? json;
      const list = Array.isArray(data) ? data : ((data as Record<string, unknown>).items ?? (data as Record<string, unknown>).brands ?? []);
      return list as Brand[];
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const addBrand = createAsyncThunk(
  'brands/addBrand',
  async (brandName: string, { dispatch, rejectWithValue }) => {
    try {
      const json = await axiosInstance.post<Record<string, unknown>>('/Brand/add-brand', undefined, { BrandName: brandName });
      dispatch(fetchBrands());
      return (json.data ?? json) as Brand;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const updateBrand = createAsyncThunk(
  'brands/updateBrand',
  async ({ id, brandName }: { id: number; brandName: string }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.put('/Brand/update-brand', undefined, { Id: id, BrandName: brandName });
      dispatch(fetchBrands());
      return { id, brandName };
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const deleteBrand = createAsyncThunk(
  'brands/deleteBrand',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete('/Brand/delete-brand', { id });
      dispatch(fetchBrands());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    clearAddError:    (s) => { s.addError = null; },
    clearEditError:   (s) => { s.editError = null; },
    clearDeleteError: (s) => { s.deleteError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending,    (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBrands.fulfilled,  (s, a) => { s.loading = false; s.brands = a.payload; })
      .addCase(fetchBrands.rejected,   (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(addBrand.pending,    (s) => { s.addLoading = true; s.addError = null; })
      .addCase(addBrand.fulfilled,  (s) => { s.addLoading = false; })
      .addCase(addBrand.rejected,   (s, a) => { s.addLoading = false; s.addError = a.payload as string; })

      .addCase(updateBrand.pending,   (s) => { s.editLoading = true; s.editError = null; })
      .addCase(updateBrand.fulfilled, (s) => { s.editLoading = false; })
      .addCase(updateBrand.rejected,  (s, a) => { s.editLoading = false; s.editError = a.payload as string; })

      .addCase(deleteBrand.pending,   (s) => { s.deleteLoading = true; s.deleteError = null; })
      .addCase(deleteBrand.fulfilled, (s) => { s.deleteLoading = false; })
      .addCase(deleteBrand.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload as string; });
  },
});

export const { clearAddError, clearEditError, clearDeleteError } = brandsSlice.actions;
export default brandsSlice.reducer;
