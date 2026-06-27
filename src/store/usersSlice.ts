import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';
import type { UserProfile } from '@/types';

export interface Role {
  id: string;
  name: string;
}

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
  /* sidebar */
  selectedUser: UserProfile | null;
  selectedUserLoading: boolean;
  selectedUserError: string | null;
  /* available roles */
  roles: Role[];
  rolesLoading: boolean;
  rolesError: string | null;
  /* profile update */
  updateLoading: boolean;
  updateError: string | null;
  /* role add/remove */
  roleActionLoading: boolean;
  roleActionError: string | null;
}

const initialState: UsersState = {
  users: [],
  total: 0,
  loading: false,
  error: null,
  deleteLoading: false,
  deleteError: null,
  selectedUser: null,
  selectedUserLoading: false,
  selectedUserError: null,
  roles: [],
  rolesLoading: false,
  rolesError: null,
  updateLoading: false,
  updateError: null,
  roleActionLoading: false,
  roleActionError: null,
};

function toMsg(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error';
}

export interface FetchUsersParams {
  UserName?: string;
  PageNumber?: number;
  PageSize?: number;
}

/* ── Thunks ─────────────────────────────────────────────── */

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: FetchUsersParams = {}, { rejectWithValue }) => {
    try {
      const q: Record<string, string | number> = {};
      if (params.UserName)   q.UserName   = params.UserName;
      if (params.PageNumber) q.PageNumber = params.PageNumber;
      if (params.PageSize)   q.PageSize   = params.PageSize;
      const json  = await axiosInstance.get<Record<string, unknown>>('/UserProfile/get-user-profiles', q);
      const inner = (json as Record<string, unknown>).data ?? json;
      const list  = Array.isArray(inner) ? inner as User[] : [] as User[];
      const d     = json as Record<string, unknown>;
      const total = (d.totalRecord ?? d.totalRecords ?? d.totalCount ?? d.total ?? list.length) as number;
      return { users: list, total };
    } catch (err) { return rejectWithValue(toMsg(err)); }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (user: User, { rejectWithValue }) => {
    try {
      const id = getUserId(user);
      await axiosInstance.delete('/UserProfile/delete-user', { id });
      return id;
    } catch (err) { return rejectWithValue(toMsg(err)); }
  }
);

export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const json = await axiosInstance.get<Record<string, unknown>>('/UserProfile/get-user-profile-by-id', { id });
      const data = (json as Record<string, unknown>).data ?? json;
      return data as UserProfile;
    } catch (err) { return rejectWithValue(toMsg(err)); }
  }
);

export const fetchUserRoles = createAsyncThunk(
  'users/fetchUserRoles',
  async (_: void, { rejectWithValue }) => {
    try {
      const json = await axiosInstance.get<Record<string, unknown>>('/UserProfile/get-user-roles');
      const data = (json as Record<string, unknown>).data ?? json;
      if (!Array.isArray(data)) return [] as Role[];
      return data.map((r: unknown): Role | null => {
        if (typeof r === 'string') return { id: r, name: r };
        if (r && typeof r === 'object') {
          const o = r as Record<string, unknown>;
          const id   = String(o.id   ?? o.roleId ?? o.Id   ?? '');
          const name = String(o.name ?? o.roleName ?? o.Name ?? o.title ?? '');
          if (!name && !id) return null;
          return { id: id || name, name: name || id };
        }
        return null;
      }).filter((r): r is Role => r !== null && Boolean(r.name));
    } catch (err) { return rejectWithValue(toMsg(err)); }
  }
);

export const updateUserProfile = createAsyncThunk(
  'users/updateUserProfile',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const json = await axiosInstance.putForm<Record<string, unknown>>('/UserProfile/update-user-profile', formData);
      const data = (json as Record<string, unknown>).data ?? json;
      return data as UserProfile;
    } catch (err) { return rejectWithValue(toMsg(err)); }
  }
);

const isNotFoundError = (e: unknown) => {
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return msg.includes('not found') || msg.includes('404');
};

export const addRoleToUser = createAsyncThunk(
  'users/addRoleToUser',
  async ({ UserId, RoleId, UserName }: { UserId: string; RoleId: string; UserName?: string }, { rejectWithValue }) => {
    const tryPost = async (uid: string) =>
      axiosInstance.post('/UserProfile/addrole-from-user', undefined,
        { UserId: uid, RoleId } as Record<string, string | number | boolean | null | undefined>);
    try {
      try { await tryPost(UserId); }
      catch (e) {
        const msg = (e instanceof Error ? e.message : '').toLowerCase();
        // Treat "already has role" (409) as success — idempotent
        if (msg.includes('already has')) return { UserId, RoleId };
        // Only retry with username for "user not found" errors
        if (UserName && UserName !== UserId && isNotFoundError(e)) { await tryPost(UserName); }
        else throw e;
      }
      return { UserId, RoleId };
    } catch (err) { return rejectWithValue(toMsg(err)); }
  }
);

export const removeRoleFromUser = createAsyncThunk(
  'users/removeRoleFromUser',
  async ({ UserId, RoleId, UserName }: { UserId: string; RoleId: string; UserName?: string }, { rejectWithValue }) => {
    const tryDel = async (uid: string) =>
      axiosInstance.delete('/UserProfile/remove-role-from-user',
        { UserId: uid, RoleId } as Record<string, string | number | boolean | null | undefined>);
    try {
      try { await tryDel(UserId); }
      catch (e) {
        const msg = (e instanceof Error ? e.message : '').toLowerCase();
        // Treat "role not assigned" as success — idempotent
        if (msg.includes('not assigned') || msg.includes('does not have')) return { UserId, RoleId };
        // Only retry with username for "user not found" errors
        if (UserName && UserName !== UserId && isNotFoundError(e)) { await tryDel(UserName); }
        else throw e;
      }
      return { UserId, RoleId };
    } catch (err) { return rejectWithValue(toMsg(err)); }
  }
);

/* ── Slice ──────────────────────────────────────────────── */

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearDeleteError:       (s) => { s.deleteError = null; },
    clearSelectedUser:      (s) => { s.selectedUser = null; s.selectedUserError = null; },
    clearUpdateError:       (s) => { s.updateError = null; },
    clearRoleActionError:   (s) => { s.roleActionError = null; },
    clearSelectedUserError: (s) => { s.selectedUserError = null; },
    clearRolesError:        (s) => { s.rolesError = null; },
  },
  extraReducers: (builder) => {
    builder
      /* fetchUsers */
      .addCase(fetchUsers.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.loading = false;
        s.users = a.payload.users;
        s.total = a.payload.total;
        // Collect unique role names from the users list as fallback Role objects (id = name)
        a.payload.users.forEach(u => (u.roles ?? []).forEach(name => {
          if (name && !s.roles.some(r => r.name.toLowerCase() === name.toLowerCase())) {
            s.roles.push({ id: name, name });
          }
        }));
      })
      .addCase(fetchUsers.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      /* deleteUser */
      .addCase(deleteUser.pending,   (s) => { s.deleteLoading = true;  s.deleteError = null; })
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.deleteLoading = false;
        s.users = s.users.filter(u => getUserId(u) !== a.payload);
        s.total = Math.max(0, s.total - 1);
        if (s.selectedUser && String(s.selectedUser.id) === a.payload) {
          s.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload as string; })

      /* getUserById */
      .addCase(getUserById.pending,   (s) => { s.selectedUserLoading = true; s.selectedUserError = null; })
      .addCase(getUserById.fulfilled, (s, a) => { s.selectedUserLoading = false; s.selectedUser = a.payload; })
      .addCase(getUserById.rejected,  (s, a) => { s.selectedUserLoading = false; s.selectedUserError = a.payload as string; })

      /* fetchUserRoles */
      .addCase(fetchUserRoles.pending,   (s) => { s.rolesLoading = true; s.rolesError = null; })
      .addCase(fetchUserRoles.fulfilled, (s, a) => { s.rolesLoading = false; s.roles = a.payload; })
      .addCase(fetchUserRoles.rejected,  (s, a) => { s.rolesLoading = false; s.rolesError = a.payload as string; })

      /* updateUserProfile */
      .addCase(updateUserProfile.pending,   (s) => { s.updateLoading = true; s.updateError = null; })
      .addCase(updateUserProfile.fulfilled, (s, a) => { s.updateLoading = false; s.selectedUser = a.payload; })
      .addCase(updateUserProfile.rejected,  (s, a) => { s.updateLoading = false; s.updateError = a.payload as string; })

      /* addRoleToUser */
      .addCase(addRoleToUser.pending,   (s) => { s.roleActionLoading = true; s.roleActionError = null; })
      .addCase(addRoleToUser.fulfilled, (s, a) => {
        s.roleActionLoading = false;
        const roleObj = s.roles.find(r => r.id.toLowerCase() === a.payload.RoleId.toLowerCase());
        const roleName = roleObj?.name ?? a.payload.RoleId;
        // Update selectedUser (sidebar)
        if (s.selectedUser) {
          const cur = s.selectedUser.roles ?? [];
          if (!cur.some(r => r.toLowerCase() === roleName.toLowerCase())) {
            s.selectedUser = { ...s.selectedUser, roles: [...cur, roleName] };
          }
        }
        // Update users list (table column)
        s.users = s.users.map(u => {
          if (u.id === a.payload.UserId || u.userId === a.payload.UserId || u.userName === a.payload.UserId) {
            const cur = u.roles ?? [];
            if (!cur.some(r => r.toLowerCase() === roleName.toLowerCase())) {
              return { ...u, roles: [...cur, roleName] };
            }
          }
          return u;
        });
      })
      .addCase(addRoleToUser.rejected, (s, a) => { s.roleActionLoading = false; s.roleActionError = a.payload as string; })

      /* removeRoleFromUser */
      .addCase(removeRoleFromUser.pending,   (s) => { s.roleActionLoading = true; s.roleActionError = null; })
      .addCase(removeRoleFromUser.fulfilled, (s, a) => {
        s.roleActionLoading = false;
        const roleObj = s.roles.find(r => r.id.toLowerCase() === a.payload.RoleId.toLowerCase());
        const roleName = roleObj?.name ?? a.payload.RoleId;
        const filterRoles = (arr: string[]) =>
          arr.filter(r => r.toLowerCase() !== roleName.toLowerCase() && r.toLowerCase() !== a.payload.RoleId.toLowerCase());
        // Update selectedUser (sidebar)
        if (s.selectedUser) {
          s.selectedUser = { ...s.selectedUser, roles: filterRoles(s.selectedUser.roles ?? []) };
        }
        // Update users list (table column)
        s.users = s.users.map(u => {
          if (u.id === a.payload.UserId || u.userId === a.payload.UserId || u.userName === a.payload.UserId) {
            return { ...u, roles: filterRoles(u.roles ?? []) };
          }
          return u;
        });
      })
      .addCase(removeRoleFromUser.rejected, (s, a) => { s.roleActionLoading = false; s.roleActionError = a.payload as string; });
  },
});

export const {
  clearDeleteError, clearSelectedUser, clearUpdateError,
  clearRoleActionError, clearSelectedUserError, clearRolesError,
} = usersSlice.actions;
export default usersSlice.reducer;
