import { useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { type Product } from '@/store/productsSlice';

import StatCard from './dashboard/StatCard';
import DashboardChart from './dashboard/DashboardChart';
import DashboardTopProducts from './dashboard/DashboardTopProducts';
import DashboardRecentTransactions from './dashboard/DashboardRecentTransactions';
import DashboardTopUnits from './dashboard/DashboardTopUnits';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { products, loading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts({ pageSize: 5 });
  }, []);

  const typedProducts = products as unknown as Product[];

  return (
    <div className={cn('flex', 'flex-col', 'h-full', 'max-w-7xl', 'mx-auto', 'space-y-6', 'p-4', 'sm:p-6')}>
      <div className="mb-2">
        <h1 className={cn('text-2xl', 'font-bold', 'tracking-tight', 'text-zinc-900', 'dark:text-zinc-50')}>Dashboard</h1>
        <p className={cn('text-sm', 'text-zinc-500', 'dark:text-zinc-400', 'mt-1')}>Welcome back! Here's what's happening today.</p>
      </div>

      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6')}>
        <StatCard
          icon={TrendingUp}
          label="Sales"
          value="$152k"
          color="#f97316"
          bg="#fff7ed"
        />
        <StatCard
          icon={DollarSign}
          label="Cost"
          value="$99.7k"
          color="#8b5cf6"
          bg="#f5f3ff"
        />
        <StatCard
          icon={ShoppingBag}
          label="Profit"
          value="$32.1k"
          color="#22c55e"
          bg="#f0fdf4"
        />
      </div>

      <div className={cn('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6')}>
        <div className="lg:col-span-2">
          <DashboardChart />
        </div>
        <div className="lg:col-span-1">
          <DashboardTopProducts 
            products={typedProducts} 
            loading={loading} 
            error={error} 
            onRetry={() => fetchProducts({ pageSize: 5 })} 
          />
        </div>
      </div>

      <div className={cn('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-6')}>
        <DashboardRecentTransactions />
        <DashboardTopUnits products={typedProducts} loading={loading} />
      </div>
    </div>
  );
}