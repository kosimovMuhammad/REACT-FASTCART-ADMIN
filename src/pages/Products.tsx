import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RootState, AppDispatch } from '@/store';
import { fetchProducts, deleteProduct, clearDeleteError, type Product } from '@/store/productsSlice';
import DeleteModal from '@/components/modals/DeleteModal';

import ProductToolbar from './products/ProductToolbar';
import ProductTable from './products/ProductTable';
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export default function Products() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { items: products, total, loading, error, deleteLoading } = useSelector(
    (s: RootState) => s.products
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('Newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const SORT_OPTS = [
    t('products.sortNewest'),
    t('products.sortOldest'),
    t('products.sortPriceLow'),
    t('products.sortPriceHigh'),
  ];

  const [searchQuery, setSearchQuery] = useState('');

  const load = (p: number, q: string) =>
    dispatch(fetchProducts({ pageNumber: p, pageSize: PAGE_SIZE, productName: q || undefined }));

  useEffect(() => {
    load(page, searchQuery);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);        
    load(1, search);
  };

  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  const toggleOne = (id: number) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const confirmDelete = async () => {
    if (!toDelete) return;
    const result = await dispatch(deleteProduct(toDelete.id));
    if (deleteProduct.fulfilled.match(result)) {
      setToDelete(null);
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(toDelete.id);
        return n;
      });
      load(page, searchQuery);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(t('products.deleteMultipleConfirm', { count: selected.size }))) return;
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => dispatch(deleteProduct(id))));
    setSelected(new Set());
    load(page, searchQuery);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.hasDiscount && a.discountPrice ? a.discountPrice : a.price;
    const priceB = b.hasDiscount && b.discountPrice ? b.discountPrice : b.price;
    const sortNewest = t('products.sortNewest');
    const sortOldest = t('products.sortOldest');
    const sortLow = t('products.sortPriceLow');
    switch (filter) {
      case sortOldest: return a.id - b.id;
      case sortLow: return priceA - priceB;
      case sortNewest:
      default: return b.id - a.id;
    }
  });

  const safeProducts = sortedProducts as unknown as any[];

  return (
    <div className={cn('flex', 'flex-col', 'h-full')}>
      <div className={cn('flex', 'items-center', 'justify-between', 'mb-6')}>
        <div>
          <h1 className={cn('text-2xl', 'font-bold', 'tracking-tight', 'text-zinc-900', 'dark:text-zinc-50')}>
            {t('products.title')}
          </h1>
          <p className={cn('text-sm', 'text-zinc-500', 'dark:text-zinc-400', 'mt-1')}>
            {t('products.subtitle')}
          </p>
        </div>
        <button
          onClick={() => navigate('/products/add')}
          className={cn('flex', 'items-center', 'gap-2', 'px-4', 'py-2', 'bg-indigo-600', 'hover:bg-indigo-500', 'text-white', 'rounded-lg', 'font-medium', 'transition-colors', 'shadow-sm')}
        >
          <Plus size={18} />
          {t('products.addProduct')}
        </button>
      </div>

      <ProductToolbar
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
        filter={filter}
        setFilter={setFilter}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        sortOpts={SORT_OPTS}
        selectedCount={selected.size}
        onBulkDelete={handleBulkDelete}
      />

      <div className="mt-4">
        <ProductTable
          products={safeProducts} 
          loading={loading}
          error={error}
          selected={selected}
          allSelected={allSelected}
          toggleAll={toggleAll}
          toggleOne={toggleOne}
          onEdit={(id) => navigate(`/products/edit/${id}`)}
          onDeleteClick={(p) => { setToDelete(p); dispatch(clearDeleteError()); }}
          deleteLoading={deleteLoading}
          toDeleteId={toDelete?.id}
          onRetry={() => { dispatch(clearDeleteError()); load(page, searchQuery); }}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          total={total}
        />
      </div>

      {toDelete && (
        <DeleteModal
          productName={toDelete.productName}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}