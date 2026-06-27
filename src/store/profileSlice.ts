import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import type { RootState } from './index';

const BASE = import.meta.env.VITE_API_URL as string;

export interface UserProfile {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string | null;
  imageUrl: string | null;
  roles: string[];
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface JwtPayload {
  nameid?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  sub?: string;
  [key: string]: unknown;
}

const initialState: ProfileState = { profile: null, loading: false, error: null };

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token;
    if (!token) return rejectWithValue('No token');

    let userId: number | null = null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const raw =
        decoded.nameid ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        decoded.sub;
      if (raw && !isNaN(Number(raw))) userId = Number(raw);
    } catch {}

    if (!userId) return rejectWithValue('Cannot extract user ID from token');

    try {
      const res = await fetch(`${BASE}/UserProfile/get-user-profile-by-id?id=${userId}`, {
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const json = await res.json();
      const data = json.data ?? json;
      return {
        id:          data.id ?? data.userId ?? userId,
        userName:    data.userName    ?? '',
        firstName:   data.firstName   ?? '',
        lastName:    data.lastName    ?? '',
        email:       data.email       ?? '',
        phoneNumber: data.phoneNumber ?? '',
        dob:         data.dob         ?? null,
        imageUrl:    data.imageUrl ?? data.image ?? null,
        roles:       data.roles ?? [],
      } as UserProfile;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (s) => { s.profile = null; s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProfile.fulfilled, (s, a) => { s.loading = false; s.profile = a.payload; })
      .addCase(fetchProfile.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
