import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

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
  subCatAddLoading: boolean;
  subCatAddError: string | null;
  subCatEditLoading: boolean;
  subCatEditError: string | null;
  subCatDeleteLoading: boolean;
  subCatDeleteError: string | null;
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
  subCatAddLoading: false,
  subCatAddError: null,
  subCatEditLoading: false,
  subCatEditError: null,
  subCatDeleteLoading: false,
  subCatDeleteError: null,
};

const toMsg = (err: unknown) => err instanceof Error ? err.message : 'Unknown error occurred';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const json = await axiosInstance.get<Record<string, unknown>>('/Category/get-categories');
      const data = json.data ?? json;
      return Array.isArray(data) ? (data as Category[]) : [];
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const fetchSubCategories = createAsyncThunk(
  'categories/fetchSubCategories',
  async (categoryId: number) => {
    try {
      const json = await axiosInstance.get<Record<string, unknown>>('/SubCategory/get-subcategories', { categoryId });
      const data = json.data ?? json;
      return Array.isArray(data) ? (data as SubCategory[]) : [];
    } catch {
      return [];
    }
  }
);

export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.postForm('/Category/add-category', formData);
      dispatch(fetchCategories());
      return true;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.putForm('/Category/update-category', formData);
      dispatch(fetchCategories());
      return true;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete('/Category/delete-category', { id });
      dispatch(fetchCategories());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const addSubCategory = createAsyncThunk(
  'categories/addSubCategory',
  async (params: { SubCategoryName: string; CategoryId: number }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/SubCategory/add-sub-category', undefined, params);
      dispatch(fetchCategories());
      return true;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const updateSubCategory = createAsyncThunk(
  'categories/updateSubCategory',
  async (params: { Id: number; SubCategoryName: string; CategoryId: number }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.put('/SubCategory/update-sub-category', undefined, params);
      dispatch(fetchCategories());
      return true;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const deleteSubCategory = createAsyncThunk(
  'categories/deleteSubCategory',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete('/SubCategory/delete-sub-category', { id });
      dispatch(fetchCategories());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(toMsg(err));
    }
  }
);

/* ── Slice ── */

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearAddError:          (s) => { s.addError = null; },
    clearEditError:         (s) => { s.editError = null; },
    clearDeleteError:       (s) => { s.deleteError = null; },
    clearSubCatAddError:    (s) => { s.subCatAddError = null; },
    clearSubCatEditError:   (s) => { s.subCatEditError = null; },
    clearSubCatDeleteError: (s) => { s.subCatDeleteError = null; },
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
      .addCase(deleteCategory.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload as string; })

      .addCase(addSubCategory.pending,    (s) => { s.subCatAddLoading = true; s.subCatAddError = null; })
      .addCase(addSubCategory.fulfilled,  (s) => { s.subCatAddLoading = false; })
      .addCase(addSubCategory.rejected,   (s, a) => { s.subCatAddLoading = false; s.subCatAddError = a.payload as string; })

      .addCase(updateSubCategory.pending,   (s) => { s.subCatEditLoading = true; s.subCatEditError = null; })
      .addCase(updateSubCategory.fulfilled, (s) => { s.subCatEditLoading = false; })
      .addCase(updateSubCategory.rejected,  (s, a) => { s.subCatEditLoading = false; s.subCatEditError = a.payload as string; })

      .addCase(deleteSubCategory.pending,   (s) => { s.subCatDeleteLoading = true; s.subCatDeleteError = null; })
      .addCase(deleteSubCategory.fulfilled, (s) => { s.subCatDeleteLoading = false; })
      .addCase(deleteSubCategory.rejected,  (s, a) => { s.subCatDeleteLoading = false; s.subCatDeleteError = a.payload as string; });
  },
});

export const {
  clearAddError, clearEditError, clearDeleteError,
  clearSubCatAddError, clearSubCatEditError, clearSubCatDeleteError,
} = categoriesSlice.actions;
export default categoriesSlice.reducer;
