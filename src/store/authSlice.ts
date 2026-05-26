import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  userId: number | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  userId: typeof window !== 'undefined'
    ? (() => {
        const id = localStorage.getItem('userId');
        return id ? Number(id) : null;
      })()
    : null,
  isAuthenticated:
    typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; userId?: number }>
    ) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId ?? null;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      if (action.payload.userId) {
        localStorage.setItem('userId', String(action.payload.userId));
      }
    },
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;