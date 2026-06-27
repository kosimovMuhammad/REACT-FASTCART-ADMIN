import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

export interface Color { id: number; colorName: string; }

interface ColorsState {
  colors: Color[];
  loading: boolean;
  error: string | null;
  addLoading: boolean;
  addError: string | null;
  editLoading: boolean;
  editError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: ColorsState = {
  colors: [],
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

export const fetchColors = createAsyncThunk(
  'colors/fetchColors',
  async (_, { rejectWithValue }) => {
    try {
      const json = await axiosInstance.get<Record<string, unknown>>('/Color/get-colors', { PageSize: 200 });
      const data = json.data ?? json;
      const list = Array.isArray(data) ? data : ((data as Record<string, unknown>).items ?? (data as Record<string, unknown>).colors ?? []);
      return list as Color[];
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const addColor = createAsyncThunk(
  'colors/addColor',
  async (colorName: string, { dispatch, rejectWithValue }) => {
    try {
      const json = await axiosInstance.post<Record<string, unknown>>('/Color/add-color', undefined, { ColorName: colorName });
      dispatch(fetchColors());
      return (json.data ?? json) as Color;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const updateColor = createAsyncThunk(
  'colors/updateColor',
  async ({ id, colorName }: { id: number; colorName: string }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.put('/Color/update-color', undefined, { Id: id, ColorName: colorName });
      dispatch(fetchColors());
      return { id, colorName };
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const deleteColor = createAsyncThunk(
  'colors/deleteColor',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete('/Color/delete-color', { id });
      dispatch(fetchColors());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

const colorsSlice = createSlice({
  name: 'colors',
  initialState,
  reducers: {
    clearAddError:    (s) => { s.addError = null; },
    clearEditError:   (s) => { s.editError = null; },
    clearDeleteError: (s) => { s.deleteError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColors.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchColors.fulfilled, (s, a) => { s.loading = false; s.colors = a.payload; })
      .addCase(fetchColors.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(addColor.pending,   (s) => { s.addLoading = true; s.addError = null; })
      .addCase(addColor.fulfilled, (s) => { s.addLoading = false; })
      .addCase(addColor.rejected,  (s, a) => { s.addLoading = false; s.addError = a.payload as string; })

      .addCase(updateColor.pending,   (s) => { s.editLoading = true; s.editError = null; })
      .addCase(updateColor.fulfilled, (s) => { s.editLoading = false; })
      .addCase(updateColor.rejected,  (s, a) => { s.editLoading = false; s.editError = a.payload as string; })

      .addCase(deleteColor.pending,   (s) => { s.deleteLoading = true; s.deleteError = null; })
      .addCase(deleteColor.fulfilled, (s) => { s.deleteLoading = false; })
      .addCase(deleteColor.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload as string; });
  },
});

export const { clearAddError, clearEditError, clearDeleteError } = colorsSlice.actions;
export default colorsSlice.reducer;
