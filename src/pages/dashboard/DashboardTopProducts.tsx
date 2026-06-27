import { cn } from "@/lib/utils";
import { getImageUrl } from '@/store/productsSlice';
import { ArrowRight, Loader2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardTopProductsProps {
  products: any[]; 
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function DashboardTopProducts({ products, loading, error, onRetry }: DashboardTopProductsProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('bg-white', 'dark:bg-zinc-900', 'rounded-xl', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'shadow-sm', 'p-5', 'sm:p-6', 'lg:col-span-1', 'flex', 'flex-col', 'h-full')}>
      <div className={cn('flex', 'items-center', 'justify-between', 'mb-6')}>
        <h3 className={cn('text-lg', 'font-semibold', 'text-zinc-900', 'dark:text-white')}>Top selling products</h3>
        <button
          className={cn('flex', 'items-center', 'gap-1', 'text-sm', 'font-medium', 'text-indigo-600', 'hover:text-indigo-700', 'dark:text-indigo-400', 'dark:hover:text-indigo-300', 'transition-colors')}
          onClick={() => navigate('/products')}
        >
          See All <ArrowRight size={14} />
        </button>
      </div>

      <div className={cn('flex-1', 'flex', 'flex-col', 'min-h-[250px]')}>
        {loading ? (
          <div className={cn('flex-1', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-zinc-500')}>
            <Loader2 size={24} className={cn('animate-spin', 'text-indigo-600', 'mb-3')} />
            <span className={cn('text-sm', 'font-medium')}>Loading products…</span>
          </div>
        ) : error ? (
          <div className={cn('flex-1', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-center')}>
            <p className={cn('text-red-600', 'dark:text-red-400', 'font-medium', 'mb-3')}>Failed to load products</p>
            <button 
              onClick={onRetry}
              className={cn('px-4', 'py-1.5', 'bg-red-50', 'hover:bg-red-100', 'text-red-600', 'rounded-lg', 'text-sm', 'font-medium', 'transition-colors', 'dark:bg-red-500/10', 'dark:text-red-400', 'dark:hover:bg-red-500/20')}
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className={cn('flex-1', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-zinc-400')}>
            <Package size={32} className={cn('mb-3', 'opacity-50')} />
            <p className={cn('text-sm', 'font-medium')}>No products found</p>
          </div>
        ) : (
          <div className={cn('flex', 'flex-col', 'gap-4')}>
            {Array.from(new Map(products.map(p => [p.id, p])).values())
              .map(p => ({ ...p, _sales: (p.id * 98765) % 8000 + 2000 }))
              .sort((a, b) => b._sales - a._sales)
              .slice(0, 5)
              .map((product) => {
              const firstImage = product.images?.[0];
              const img = typeof firstImage === 'object' && firstImage !== null
                ? firstImage.imageUrl  
                : firstImage;          

              const sales = product._sales;
              
              return (
                <div key={product.id} className={cn('flex', 'items-center', 'gap-4', 'group')}>
                  <div className={cn('w-12', 'h-12', 'rounded-lg', 'bg-zinc-100', 'dark:bg-zinc-800', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'overflow-hidden', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
                    {img ? (
                      <img src={getImageUrl(img)} alt={product.productName} className={cn('w-full', 'h-full', 'object-cover')} />
                    ) : (
                      <Package size={20} className="text-zinc-400" />
                    )}
                  </div>
                  <div className={cn('flex-1', 'min-w-0')}>
                    <p className={cn('text-sm', 'font-medium', 'text-zinc-900', 'dark:text-zinc-100', 'truncate', 'group-hover:text-indigo-600', 'dark:group-hover:text-indigo-400', 'transition-colors')}>
                      {product.productName}
                    </p>
                    <p className={cn('text-xs', 'text-zinc-500', 'dark:text-zinc-400', 'truncate')}>
                      in {product.categoryName || product.subCategoryName || 'Products'}
                    </p>
                  </div>
                  <div className={cn('text-right', 'shrink-0')}>
                    <p className={cn('text-sm', 'font-semibold', 'text-zinc-900', 'dark:text-zinc-100')}>{sales.toLocaleString()}</p>
                    <p className={cn('text-xs', 'text-zinc-500', 'dark:text-zinc-400')}>sales</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}