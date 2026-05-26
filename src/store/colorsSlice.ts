import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './index';

const BASE = 'https://fastcard-1-o23z.onrender.com/api';

export interface Color { id: number; colorName: string; }

interface ColorsState {
  colors: Color[];
  loading: boolean;
  error: string | null;
  addLoading: boolean;
  addError: string | null;
}

const initialState: ColorsState = {
  colors: [], loading: false, error: null, addLoading: false, addError: null,
};

export const fetchColors = createAsyncThunk(
  'colors/fetchColors',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token ?? '';
    try {
      const res = await fetch(`${BASE}/Color/get-colors`, {
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      });
      if (!res.ok) throw new Error('Failed to fetch colors');
      const json = await res.json();
      const data = json.data ?? json;
      return Array.isArray(data) ? (data as Color[]) : [];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const addColor = createAsyncThunk(
  'colors/addColor',
  async (colorName: string, { getState, dispatch, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token ?? '';
    try {
      const res = await fetch(`${BASE}/Color/add-color`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({ colorName }),
      });
      if (!res.ok) throw new Error('Failed to add color');
      const json = await res.json();
      dispatch(fetchColors());
      return (json.data ?? json) as Color;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

const colorsSlice = createSlice({
  name: 'colors',
  initialState,
  reducers: {
    clearAddError: (s) => { s.addError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColors.pending,   (s) => { s.loading = true; })
      .addCase(fetchColors.fulfilled, (s, a) => { s.loading = false; s.colors = a.payload; })
      .addCase(fetchColors.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(addColor.pending,   (s) => { s.addLoading = true; s.addError = null; })
      .addCase(addColor.fulfilled, (s) => { s.addLoading = false; })
      .addCase(addColor.rejected,  (s, a) => { s.addLoading = false; s.addError = a.payload as string; });
  },
});

export const { clearAddError } = colorsSlice.actions;
export default colorsSlice.reducer;
