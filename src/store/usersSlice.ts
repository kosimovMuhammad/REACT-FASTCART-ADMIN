import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

export interface User {
  id?: string;
  userId?: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  imageUrl?: string;
  roles?: string[];
}

export function getUserId(user: User): string {
  return (user.id ?? user.userId ?? user.userName) as string;
}

interface UsersState {
  users: User[];
  total: number;
  loading: boolean;
  error: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: UsersState = {
  users: [],
  total: 0,
  loading: false,
  error: null,
  deleteLoading: false,
  deleteError: null,
};

function toMsg(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error';
}

export interface FetchUsersParams {
  UserName?: string;
  PageNumber?: number;
  PageSize?: number;
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: FetchUsersParams = {}, { rejectWithValue }) => {
    try {
      const q: Record<string, string | number> = {};
      if (params.UserName) q.UserName = params.UserName;
      if (params.PageNumber) q.PageNumber = params.PageNumber;
      if (params.PageSize)   q.PageSize   = params.PageSize;

      const json = await axiosInstance.get<Record<string, unknown>>('/UserProfile/get-user-profiles', q);
      const data = (json as Record<string, unknown>).data ?? json;
      const list = Array.isArray(data) ? data as User[] : [] as User[];
      const d = json as Record<string, unknown>;
      const total = (d.totalRecord ?? d.totalRecords ?? d.totalCount ?? d.total ?? list.length) as number;
      return { users: list, total };
    } catch (err) {
      return rejectWithValue(toMsg(err));
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (user: User, { rejectWithValue }) => {
    try {
      const id = getUserId(user);
      await axiosInstance.delete('/UserProfile/delete-user', { id });
      return id;
    } catch (err) {
      return rejectWithValue(toMsg(err));
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearDeleteError: (s) => { s.deleteError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.users = a.payload.users; s.total = a.payload.total; })
      .addCase(fetchUsers.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(deleteUser.pending,   (s) => { s.deleteLoading = true;  s.deleteError = null; })
      .addCase(deleteUser.fulfilled, (s, a) => { s.deleteLoading = false; s.users = s.users.filter(u => getUserId(u) !== a.payload); s.total = Math.max(0, s.total - 1); })
      .addCase(deleteUser.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload as string; });
  },
});

export const { clearDeleteError } = usersSlice.actions;
export default usersSlice.reducer;
