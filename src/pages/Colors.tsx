import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Loader2, Search, Palette } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import { fetchColors, deleteColor, clearDeleteError, type Color } from '@/store/colorsSlice';
import ColorModal from '@/components/modals/ColorModal';
import DeleteModal from '@/components/modals/DeleteModal';
import { colorToHex } from '@/pages/products/components/ProductSidebar';
import { cn } from '@/lib/utils';

export default function Colors() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { colors, loading, error, deleteLoading } = useSelector((s: RootState) => s.colors);

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<Color | null>(null);
  const [toDelete, setToDelete] = useState<Color | null>(null);

  useEffect(() => {
    dispatch(fetchColors());
  }, [dispatch]);

  const filtered = colors.filter(c =>
    c.colorName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!toDelete) return;
    const result = await dispatch(deleteColor(toDelete.id));
    if (deleteColor.fulfilled.match(result)) {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('colors.title')}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {t('colors.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          {t('common.add')}
        </button>
      </div>

      <div className="relative w-72 mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder={t('common.search') + '...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all"
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-indigo-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
            <button
              onClick={() => { dispatch(clearDeleteError()); dispatch(fetchColors()); }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors dark:bg-red-500/10 dark:text-red-400"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <Palette size={32} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">{t('common.noResults')}</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
              <tr>
                <th className="px-6 py-4 font-medium w-16">Color</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filtered.map((color) => {
                const hex = colorToHex(color.colorName);
                return (
                  <tr key={color.id} className={cn('hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors')}>
                    <td className="px-6 py-4">
                      <div
                        className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-inner"
                        style={{ backgroundColor: hex }}
                        title={color.colorName}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {color.colorName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditItem(color)}
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          title={t('common.edit')}
                        >
                          <Pencil size={16} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => { setToDelete(color); dispatch(clearDeleteError()); }}
                          disabled={deleteLoading}
                          className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                          title={t('common.delete')}
                        >
                          {deleteLoading && toDelete?.id === color.id
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Trash2 size={16} strokeWidth={2} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <ColorModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => dispatch(fetchColors())}
        />
      )}

      {editItem && (
        <ColorModal
          editItem={editItem}
          onClose={() => setEditItem(null)}
          onCreated={() => { dispatch(fetchColors()); setEditItem(null); }}
        />
      )}

      {toDelete && (
        <DeleteModal
          productName={toDelete.colorName}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
