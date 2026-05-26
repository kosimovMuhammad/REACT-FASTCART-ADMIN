import { Package, Loader2, AlertCircle, Pencil, Trash2, Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/store/productsSlice';
import { getImageUrl } from '@/store/productsSlice';
import { cn } from '@/lib/utils';
import ProductPagination from './ProductPagination';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  selected: Set<number>;
  allSelected: boolean;
  toggleAll: () => void;
  toggleOne: (id: number) => void;
  onEdit: (id: number) => void;
  onDeleteClick: (p: Product) => void;
  deleteLoading: boolean;
  toDeleteId?: number;
  onRetry: () => void;
  page: number;
  setPage: (val: number | ((prev: number) => number)) => void;
  totalPages: number;
  total: number;
}

export default function ProductTable({
  products,
  loading,
  error,
  selected,
  allSelected,
  toggleAll,
  toggleOne,
  onEdit,
  onDeleteClick,
  deleteLoading,
  toDeleteId,
  onRetry,
  page,
  setPage,
  totalPages,
  total,
}: ProductTableProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm min-h-[400px]')}>
        <Loader2 size={32} className={cn('animate-spin', 'text-blue-600', 'dark:text-blue-400', 'mb-4')} />
        <span className={cn('text-zinc-500', 'dark:text-zinc-400', 'font-medium')}>{t('products.loadingProducts')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm min-h-[400px]')}>
        <AlertCircle size={32} className={cn('text-red-600', 'dark:text-red-400', 'mb-4')} />
        <span className={cn('text-red-600', 'dark:text-red-400', 'font-medium', 'mb-4')}>{error}</span>
        <button
          onClick={onRetry}
          className={cn('px-5', 'py-2', 'bg-red-600', 'text-white', 'hover:bg-red-700', 'rounded-lg', 'font-medium', 'transition-colors', 'shadow-sm')}
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className={cn('w-full')}>
      <div className="overflow-x-auto">
        <table className={cn('w-full', 'text-left', 'text-[14px]', 'whitespace-nowrap', 'border-collapse')}>
          <thead className={cn('border-t', 'border-b', 'border-zinc-200', 'dark:border-zinc-800', 'text-[#64748b]', 'font-medium')}>
            <tr>
              <th className={cn('pb-4', 'w-12', 'text-left')}>
                <input
                  type="checkbox"
                  className={cn('w-4', 'h-4', 'rounded', 'border-gray-300', 'text-blue-600', 'focus:ring-blue-500/20', 'dark:border-zinc-700', 'dark:bg-zinc-900', 'transition-colors', 'cursor-pointer')}
                  checked={allSelected && products.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className={cn('pb-4', 'font-normal', 'text-[#64748b]')}>{t('products.product')}</th>
              <th className={cn('pb-4', 'font-normal', 'text-[#64748b]')}>{t('products.inventory')}</th>
              <th className={cn('pb-4', 'font-normal', 'text-[#64748b]')}>{t('products.category')}</th>
              <th className={cn('pb-4', 'font-normal', 'text-[#64748b]')}>{t('products.price')}</th>
              <th className={cn('pb-4', 'font-normal', 'text-left', 'pl-4')}>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className={cn('divide-y', 'divide-zinc-100', 'dark:divide-zinc-800/60')}>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className={cn('px-4', 'py-16', 'text-center')}>
                  <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'text-zinc-400', 'dark:text-zinc-500')}>
                    <Archive size={32} className={cn('text-zinc-300', 'dark:text-zinc-600', 'mb-4')} />
                    <p className={cn('font-medium', 'text-zinc-900', 'dark:text-zinc-300', 'text-base', 'mb-1')}>
                      {t('products.noProductsFound')}
                    </p>
                    <p className="text-sm">{t('products.noProductsDesc')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const imageSource = product.image || (product.images && product.images.length > 0 ? product.images[0] : null);
                
                const isSelected = selected.has(product.id);
                const outOfStock = product.quantity === 0;
                const price = product.hasDiscount && product.discountPrice
                  ? product.discountPrice
                  : product.price;

                return (
                  <tr
                    key={product.id}
                    className={cn('hover:bg-zinc-50/40', 'dark:hover:bg-zinc-800/20', 'transition-colors')}
                  >
                    <td className={cn('py-4', 'text-left')}>
                      <input
                        type="checkbox"
                        className={cn('w-4', 'h-4', 'rounded', 'border-gray-300', 'text-blue-600', 'focus:ring-blue-500/20', 'dark:border-zinc-700', 'dark:bg-zinc-900', 'transition-colors', 'cursor-pointer')}
                        checked={isSelected}
                        onChange={() => toggleOne(product.id)}
                      />
                    </td>
                    <td className="py-4">
                      <div className={cn('flex', 'items-center', 'gap-4')}>
                        <div className={cn('h-12', 'w-12', 'shrink-0', 'rounded-lg', 'overflow-hidden', 'bg-zinc-100', 'dark:bg-zinc-800', 'flex', 'items-center', 'justify-center', 'border', 'border-zinc-100', 'dark:border-zinc-800')}>
                            {imageSource ? (
                              <img
                                src={getImageUrl(imageSource)}
                                alt={product.productName}
                                className={cn('h-full', 'w-full', 'object-cover')}
                              />
                            ) : (
                              <Package size={22} className="text-zinc-400" />
                            )}
                        </div>
                        <span className={cn('font-medium', 'text-[#1e293b]', 'dark:text-zinc-200')}>
                          {product.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      {outOfStock ? (
                        <span className={cn('inline-flex', 'items-center', 'px-2.5', 'py-1', 'rounded-md', 'text-xs', 'font-medium', 'bg-[#ebf0f5]', 'text-[#64748b]', 'dark:bg-zinc-800', 'dark:text-zinc-400')}>
                          {t('common.outOfStock')}
                        </span>
                      ) : (
                        <span className={cn('text-[#334155]', 'dark:text-zinc-400')}>
                          {product.quantity} {t('common.inStock')}
                        </span>
                      )}
                    </td>
                    <td className={cn('py-4', 'text-[#334155]', 'dark:text-zinc-400')}>
                      {product.categoryName || product.subCategoryName || t('products.uncategorized')}
                    </td>
                    <td className={cn('py-4', 'font-medium', 'text-[#1e293b]', 'dark:text-zinc-200')}>
                      ${price.toFixed(2)}
                    </td>
                    <td className={cn('py-4', 'pl-4')}>
                      <div className={cn('flex', 'items-center', 'gap-4')}>
                        <button
                          onClick={() => onEdit(product.id)}
                          className={cn('text-[#3b82f6]', 'hover:text-blue-700', 'transition-colors')}
                          title={t('common.edit')}
                        >
                          <Pencil size={18} className="stroke-2" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(product)}
                          disabled={deleteLoading}
                          className={cn('text-[#ef4444]', 'hover:text-red-700', 'transition-colors')}
                          title={t('common.delete')}
                        >
                          {deleteLoading && toDeleteId === product.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} className="stroke-2" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <ProductPagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}