import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (!token && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [token, isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) return;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp as number | undefined;
      if (exp && Date.now() / 1000 > exp) {
        dispatch(logout());
        navigate('/login', { replace: true });
      }
    } catch {
      dispatch(logout());
    }
  }, [token, dispatch, navigate]);

  return <>{children}</>;
}
