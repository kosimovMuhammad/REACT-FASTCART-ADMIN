import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import Layout      from '@/Layout/Layout';
import Login       from '@/pages/Login';
import Dashboard   from '@/pages/Dashboard';
import Products    from '@/pages/Products';
import AddProduct  from '@/pages/AddProduct';
import EditProduct from '@/pages/EditProduct';
import Orders      from '@/pages/Orders';
import Categories  from '@/pages/Categories';
import Colors      from '@/pages/Colors';
import Other       from '@/pages/Other';

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
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: '/',
    element: <PrivateRoute><Layout /></PrivateRoute>,
    children: [
      { index: true,                    element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',              element: <Dashboard /> },
      { path: 'products',               element: <Products /> },
      { path: 'products/add',           element: <AddProduct /> },
      { path: 'products/edit/:id',      element: <EditProduct /> },
      { path: 'orders',                 element: <Orders /> },
      { path: 'categories',             element: <Categories /> },
      { path: 'colors',                 element: <Colors /> },
      { path: 'other',                  element: <Other /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
