import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchProfile } from '@/store/profileSlice';
export type { UserProfile } from '@/store/profileSlice';

export function useProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((s: RootState) => s.profile);
  const token = useSelector((s: RootState) => s.auth.token);

  useEffect(() => {
    if (token && !profile) {
      dispatch(fetchProfile());
    }
  }, [token, profile, dispatch]);

  const refetch = () => dispatch(fetchProfile());
  return { profile, loading, error, refetch };
}
