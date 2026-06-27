import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Plus, Pencil, Trash2, Loader2, Search, Upload, X, AlertCircle, Tag
} from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchCategories, addCategory, updateCategory, deleteCategory,
  clearAddError, clearEditError, clearDeleteError,
  type Category,
} from '@/store/categoriesSlice';
import { getImageUrl } from '@/store/productsSlice';
import DeleteModal from '@/components/modals/DeleteModal';
import { cn } from '@/lib/utils';

interface CategoryFormModalProps {
  mode: 'add' | 'edit';
  initial?: { id: number; categoryName: string; categoryImage?: string | null };
  onClose: () => void;
}

function CategoryFormModal({ mode, initial, onClose }: CategoryFormModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { addLoading, addError, editLoading, editError } = useSelector((s: RootState) => s.categories);

  const [name, setName] = useState(initial?.categoryName ?? '');
  const [file, setFile] = useState<File | null>(null);

  const loading = mode === 'add' ? addLoading : editLoading;
  const error   = mode === 'add' ? addError   : editError;

  useEffect(() => {
    dispatch(clearAddError());
    dispatch(clearEditError());
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch, onClose]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const formData = new FormData();
    formData.append('CategoryName', name.trim());
    if (file) formData.append('CategoryImage', file);

    let result;
    if (mode === 'add') {
      result = await dispatch(addCategory(formData));
      if (addCategory.fulfilled.match(result)) onClose();
    } else {
      formData.append('Id', String(initial!.id));
      result = await dispatch(updateCategory(formData));
      if (updateCategory.fulfilled.match(result)) onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-zinc-900 dark:text-white text-[15px]">
            {mode === 'add' ? 'Add category' : 'Edit category'}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
              Category Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <label className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors relative">
            <input
              type="file"
              accept="image/png, image/jpeg, image/gif, image/svg+xml"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
              <Upload size={18} className="text-zinc-900 dark:text-zinc-100 stroke-[2.5]" />
            </div>
            {file ? (
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  <span className="underline decoration-zinc-400 underline-offset-2">Click to upload</span> or drag and drop
                </p>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">SVG, JPG, PNG or GIF (max 900×400)</p>
              </>
            )}
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === 'add' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { categories, loading, error, deleteLoading } = useSelector((s: RootState) => s.categories);

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filtered = categories.filter(c =>
    c.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!toDelete) return;
    const result = await dispatch(deleteCategory(toDelete.id));
    if (deleteCategory.fulfilled.match(result)) {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('categories.title')}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {t('categories.subtitle')}
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
              onClick={() => { dispatch(clearDeleteError()); dispatch(fetchCategories()); }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium dark:bg-red-500/10 dark:text-red-400"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <Tag size={32} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">{t('common.noResults')}</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium w-20">Image</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Subcategories</th>
                <th className="px-6 py-4 font-medium text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filtered.map((cat) => (
                <tr key={cat.id} className={cn('hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors')}>
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      {cat.categoryImage ? (
                        <img
                          src={getImageUrl(cat.categoryImage)}
                          alt={cat.categoryName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Tag size={20} className="text-zinc-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {cat.categoryName}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    {cat.subCategories?.length ?? 0} subcategories
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditItem(cat)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        title={t('common.edit')}
                      >
                        <Pencil size={16} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => { setToDelete(cat); dispatch(clearDeleteError()); }}
                        disabled={deleteLoading}
                        className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                        title={t('common.delete')}
                      >
                        {deleteLoading && toDelete?.id === cat.id
                          ? <Loader2 size={16} className="animate-spin" />
                          : <Trash2 size={16} strokeWidth={2} />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <CategoryFormModal mode="add" onClose={() => setShowAddModal(false)} />
      )}

      {editItem && (
        <CategoryFormModal
          mode="edit"
          initial={{ id: editItem.id, categoryName: editItem.categoryName, categoryImage: editItem.categoryImage }}
          onClose={() => setEditItem(null)}
        />
      )}

      {toDelete && (
        <DeleteModal
          productName={toDelete.categoryName}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
