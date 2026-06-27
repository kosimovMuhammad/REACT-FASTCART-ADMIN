import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const Layout         = lazy(() => import('@/Layout/Layout'));
const Login          = lazy(() => import('@/pages/Login'));
const Dashboard      = lazy(() => import('@/pages/Dashboard'));
const Products       = lazy(() => import('@/pages/Products'));
const AddProduct     = lazy(() => import('@/pages/AddProduct'));
const EditProduct    = lazy(() => import('@/pages/EditProduct'));
const Orders         = lazy(() => import('@/pages/Orders'));
const Categories     = lazy(() => import('@/pages/Categories'));
const SubCategories  = lazy(() => import('@/pages/SubCategories'));
const Colors         = lazy(() => import('@/pages/Colors'));
const Banners        = lazy(() => import('@/pages/Banners'));
const Other          = lazy(() => import('@/pages/Other'));
const Users          = lazy(() => import('@/pages/Users'));
const NotFound       = lazy(() => import('@/pages/NotFound'));

function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const ok = useSelector((s: RootState) => s.auth.isAuthenticated);
  return ok ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const ok = useSelector((s: RootState) => s.auth.isAuthenticated);
  return ok ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <PublicRoute><Login /></PublicRoute>
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <PrivateRoute><Layout /></PrivateRoute>
      </Suspense>
    ),
    children: [
      { index: true,               element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',         element: <Dashboard /> },
      { path: 'products',          element: <Products /> },
      { path: 'products/add',      element: <AddProduct /> },
      { path: 'products/edit/:id', element: <EditProduct /> },
      { path: 'orders',            element: <Orders /> },
      { path: 'categories',        element: <Categories /> },
      { path: 'subcategories',     element: <SubCategories /> },
      { path: 'colors',            element: <Colors /> },
      { path: 'banners',           element: <Banners /> },
      { path: 'other',             element: <Other /> },
      { path: 'users',             element: <Users /> },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFound />
      </Suspense>
    ),
  },
]);
