import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

export interface Banner {
  id: number;
  title?: string;
  imageUrl?: string;
  imageName?: string;
  link?: string;
}

interface BannersState {
  banners: Banner[];
  loading: boolean;
  error: string | null;
  addLoading: boolean;
  addError: string | null;
  editLoading: boolean;
  editError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: BannersState = {
  banners: [],
  loading: false,
  error: null,
  addLoading: false,
  addError: null,
  editLoading: false,
  editError: null,
  deleteLoading: false,
  deleteError: null,
};

const toMsg = (err: unknown) => err instanceof Error ? err.message : 'Unknown error occurred';

export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const json = await axiosInstance.get<Record<string, unknown>>('/Banner/get-banners');
      const data = json.data ?? json;
      return Array.isArray(data) ? (data as Banner[]) : [];
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const addBanner = createAsyncThunk(
  'banners/addBanner',
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.postForm('/Banner/add-banner', formData);
      dispatch(fetchBanners());
      return true;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const updateBanner = createAsyncThunk(
  'banners/updateBanner',
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.putForm('/Banner/update-banner', formData);
      dispatch(fetchBanners());
      return true;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'banners/deleteBanner',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete('/Banner/delete-banner', { id });
      dispatch(fetchBanners());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

const bannersSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearAddError:    (s) => { s.addError = null; },
    clearEditError:   (s) => { s.editError = null; },
    clearDeleteError: (s) => { s.deleteError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBanners.fulfilled, (s, a) => { s.loading = false; s.banners = a.payload; })
      .addCase(fetchBanners.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(addBanner.pending,    (s) => { s.addLoading = true; s.addError = null; })
      .addCase(addBanner.fulfilled,  (s) => { s.addLoading = false; })
      .addCase(addBanner.rejected,   (s, a) => { s.addLoading = false; s.addError = a.payload as string; })

      .addCase(updateBanner.pending,   (s) => { s.editLoading = true; s.editError = null; })
      .addCase(updateBanner.fulfilled, (s) => { s.editLoading = false; })
      .addCase(updateBanner.rejected,  (s, a) => { s.editLoading = false; s.editError = a.payload as string; })

      .addCase(deleteBanner.pending,   (s) => { s.deleteLoading = true; s.deleteError = null; })
      .addCase(deleteBanner.fulfilled, (s) => { s.deleteLoading = false; })
      .addCase(deleteBanner.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload as string; });
  },
});

export const { clearAddError, clearEditError, clearDeleteError } = bannersSlice.actions;
export default bannersSlice.reducer;
