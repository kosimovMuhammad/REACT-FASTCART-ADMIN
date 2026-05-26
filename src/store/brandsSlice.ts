import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './index';

const BASE = 'https://fastcard-1-o23z.onrender.com/api';

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

function getToken(state: RootState) {
  return state.auth.token ?? '';
}

export const fetchBrands = createAsyncThunk(
  'brands/fetchBrands',
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Brand/get-brands?PageSize=200`, {
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      });
      if (!res.ok) throw new Error('Failed to fetch brands');
      const json = await res.json();
      const data = json.data ?? json;
      const list = Array.isArray(data) ? data : (data.items ?? data.brands ?? []);
      return list as Brand[];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const addBrand = createAsyncThunk(
  'brands/addBrand',
  async (brandName: string, { getState, dispatch, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Brand/add-brand`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({ brandName }),
      });
      if (!res.ok) throw new Error('Failed to add brand');
      const json = await res.json();
      dispatch(fetchBrands());
      return (json.data ?? json) as Brand;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const updateBrand = createAsyncThunk(
  'brands/updateBrand',
  async ({ id, brandName }: { id: number; brandName: string }, { getState, dispatch, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Brand/update-brand`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({ id, brandName }),
      });
      if (!res.ok) throw new Error('Failed to update brand');
      dispatch(fetchBrands());
      return { id, brandName };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const deleteBrand = createAsyncThunk(
  'brands/deleteBrand',
  async (id: number, { getState, dispatch, rejectWithValue }) => {
    const token = getToken(getState() as RootState);
    try {
      const res = await fetch(`${BASE}/Brand/delete-brand?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      });
      if (!res.ok) throw new Error('Failed to delete brand');
      dispatch(fetchBrands());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
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
