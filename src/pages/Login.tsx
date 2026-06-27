import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '@/store/authSlice';
import { jwtDecode } from 'jwt-decode';
import { Eye, EyeOff, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface JwtPayload {
  nameid?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  sub?: string;
  unique_name?: string;
  [key: string]: unknown;
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { userName: username.trim(), password };
      console.log('[Login] payload →', JSON.stringify(payload));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/Account/login`, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let token: string | null = null;
      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('application/json')) {
        const resData = await response.json();

        if (response.ok) {
          if (typeof resData === 'string') {
            token = resData;
          } else {
            const candidate = resData.data ?? resData.token ?? resData.accessToken ?? resData.Token;
            // Handle both flat string and nested object { token: "..." }
            if (typeof candidate === 'string') {
              token = candidate;
            } else if (candidate && typeof candidate === 'object') {
              const nested = candidate as Record<string, unknown>;
              token = (nested.token ?? nested.accessToken ?? nested.Token ?? null) as string | null;
            }
          }

          if (!token) {
            setError('Login failed: no token received from server.');
            return;
          }
        } else {
          const msg =
            resData.message ??
            resData.title ??
            resData.error ??
            `Server returned ${response.status}`;
          setError(msg);
          return;
        }
      } else if (response.ok) {
        token = await response.text();
      } else {
        setError(`Login failed with status ${response.status}`);
        return;
      }

      let userId: number | undefined;
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const raw =
          decoded.nameid ||
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
          decoded.sub;
        if (raw && !isNaN(Number(raw))) userId = Number(raw);
      } catch (err) {
        console.error('JWT decode error:', err);
      }

      dispatch(loginSuccess({ token, userId }));
      navigate('/dashboard');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex', 'min-h-screen', 'w-full', 'bg-zinc-50', 'dark:bg-zinc-950', 'text-zinc-900', 'dark:text-zinc-50')}>
      {/* Left decorative panel */}
      <div className={cn('hidden', 'lg:flex', 'lg:w-1/2', 'lg:flex-col', 'justify-center', 'items-center', 'bg-indigo-600', 'dark:bg-indigo-900', 'relative', 'overflow-hidden')}>
        <div className={cn('relative', 'z-10', 'flex', 'flex-col', 'items-center', 'text-white', 'text-center', 'px-12')}>
          <p className={cn('text-indigo-200', 'text-lg', 'mb-4', 'font-medium', 'uppercase', 'tracking-widest')}>Welcome to</p>
          <div className={cn('flex', 'items-center', 'gap-3', 'mb-8')}>
            <div className={cn('flex', 'h-16', 'w-16', 'items-center', 'justify-center', 'rounded-2xl', 'bg-white/10', 'backdrop-blur-md', 'border', 'border-white/20', 'shadow-xl')}>
              <ShoppingCart size={36} className="text-white" />
            </div>
            <h1 className={cn('text-5xl', 'font-extrabold', 'tracking-tight')}>
              fast<span className="text-indigo-300">cart</span>
            </h1>
          </div>
          <p className={cn('text-indigo-100', 'text-lg', 'max-w-xs', 'leading-relaxed')}>
            Your complete e-commerce admin panel. Manage products, orders, and more.
          </p>
        </div>
        <div className={cn('absolute', 'inset-0', 'z-0', 'opacity-50', 'dark:opacity-30')}>
          <div className={cn('absolute', 'top-[-10%]', 'left-[-10%]', 'w-[500px]', 'h-[500px]', 'rounded-full', 'bg-indigo-500/40', 'blur-3xl')} />
          <div className={cn('absolute', 'bottom-[-10%]', 'right-[-10%]', 'w-[600px]', 'h-[600px]', 'rounded-full', 'bg-indigo-400/30', 'blur-3xl')} />
        </div>
      </div>

      {/* Right form panel */}
      <div className={cn('flex', 'flex-1', 'flex-col', 'justify-center', 'px-6', 'py-12', 'sm:px-12', 'lg:px-24')}>
        <div className={cn('mx-auto', 'w-full', 'max-w-sm', 'lg:max-w-md')}>
          <div className={cn('mb-10', 'text-center', 'lg:text-left')}>
            <div className={cn('lg:hidden', 'flex', 'items-center', 'justify-center', 'gap-2', 'mb-6', 'text-indigo-600', 'dark:text-indigo-400')}>
              <ShoppingCart size={28} />
              <h1 className={cn('text-3xl', 'font-extrabold', 'tracking-tight', 'text-zinc-900', 'dark:text-zinc-50')}>
                fast<span className={cn('text-indigo-600', 'dark:text-indigo-400')}>cart</span>
              </h1>
            </div>
            <h2 className={cn('text-3xl', 'font-bold', 'tracking-tight', 'mb-2')}>Sign in</h2>
            <p className={cn('text-zinc-500', 'dark:text-zinc-400', 'text-sm')}>Enter your credentials to access the admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={cn('rounded-lg', 'bg-red-50', 'p-4', 'text-sm', 'text-red-600', 'border', 'border-red-200', 'dark:bg-red-500/10', 'dark:border-red-500/20', 'dark:text-red-400')}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className={cn('block', 'text-sm', 'font-medium', 'leading-6', 'mb-1.5')}>
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className={cn('block', 'w-full', 'rounded-lg', 'border-0', 'py-2.5', 'px-3.5', 'text-zinc-900', 'shadow-sm', 'ring-1', 'ring-inset', 'ring-zinc-300', 'placeholder:text-zinc-400', 'focus:ring-2', 'focus:ring-inset', 'focus:ring-indigo-600', 'sm:text-sm', 'sm:leading-6', 'dark:bg-zinc-900', 'dark:text-white', 'dark:ring-zinc-700', 'dark:focus:ring-indigo-500')}
              />
            </div>

            <div>
              <label htmlFor="password" className={cn('block', 'text-sm', 'font-medium', 'leading-6', 'mb-1.5')}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={cn('block', 'w-full', 'rounded-lg', 'border-0', 'py-2.5', 'pl-3.5', 'pr-10', 'text-zinc-900', 'shadow-sm', 'ring-1', 'ring-inset', 'ring-zinc-300', 'placeholder:text-zinc-400', 'focus:ring-2', 'focus:ring-inset', 'focus:ring-indigo-600', 'sm:text-sm', 'sm:leading-6', 'dark:bg-zinc-900', 'dark:text-white', 'dark:ring-zinc-700', 'dark:focus:ring-indigo-500')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className={cn('absolute', 'inset-y-0', 'right-0', 'flex', 'items-center', 'pr-3', 'text-zinc-400', 'hover:text-zinc-500', 'dark:hover:text-zinc-300', 'focus:outline-none')}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={cn('flex', 'items-center', 'justify-between')}>
              <a href="#" className={cn('text-sm', 'font-medium', 'text-indigo-600', 'hover:text-indigo-500', 'dark:text-indigo-400', 'dark:hover:text-indigo-300')}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
className={cn('flex', 'w-full', 'justify-center', 'rounded-lg', 'bg-indigo-600', 'px-3', 'py-2.5', 'text-sm', 'font-semibold', 'leading-6', 'text-white', 'shadow-sm', 'hover:bg-indigo-500', 'focus-visible:outline-2', 'focus-visible:outline-offset-2', 'focus-visible:outline-indigo-600', 'disabled:opacity-70', 'disabled:cursor-not-allowed', 'transition-all')}            >
              {loading ? (
                <>
                  <Loader2 size={18} className={cn('animate-spin', 'mr-2')} />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}