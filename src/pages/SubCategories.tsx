import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Loader2, Search, X, AlertCircle, Layers } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchCategories,
  addSubCategory, updateSubCategory, deleteSubCategory,
  clearSubCatAddError, clearSubCatEditError, clearSubCatDeleteError,
  type SubCategory, type Category,
} from '@/store/categoriesSlice';
import DeleteModal from '@/components/modals/DeleteModal';
import { cn } from '@/lib/utils';

interface SubCategoryWithParent extends SubCategory {
  categoryName: string;
}

interface SubCatFormModalProps {
  mode: 'add' | 'edit';
  categories: Category[];
  initial?: SubCategory;
  onClose: () => void;
}

function SubCatFormModal({ mode, categories, initial, onClose }: SubCatFormModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { subCatAddLoading, subCatAddError, subCatEditLoading, subCatEditError } =
    useSelector((s: RootState) => s.categories);

  const [name, setName] = useState(initial?.subCategoryName ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(initial?.categoryId ?? '');

  const loading = mode === 'add' ? subCatAddLoading : subCatEditLoading;
  const error   = mode === 'add' ? subCatAddError   : subCatEditError;

  useEffect(() => {
    dispatch(clearSubCatAddError());
    dispatch(clearSubCatEditError());
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch, onClose]);

  const handleSubmit = async () => {
    if (!name.trim() || !categoryId) return;
    if (mode === 'add') {
      const res = await dispatch(addSubCategory({ SubCategoryName: name.trim(), CategoryId: Number(categoryId) }));
      if (addSubCategory.fulfilled.match(res)) onClose();
    } else {
      const res = await dispatch(updateSubCategory({ Id: initial!.id, SubCategoryName: name.trim(), CategoryId: Number(categoryId) }));
      if (updateSubCategory.fulfilled.match(res)) onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-zinc-900 dark:text-white text-[15px]">
            {mode === 'add' ? 'Add subcategory' : 'Edit subcategory'}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
              Subcategory Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Subcategory name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value) || '')}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
          </div>
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
            disabled={loading || !name.trim() || !categoryId}
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

export default function SubCategories() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error, subCatDeleteLoading, subCatDeleteError } =
    useSelector((s: RootState) => s.categories);

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<SubCategory | null>(null);
  const [toDelete, setToDelete] = useState<SubCategoryWithParent | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const allSubCategories: SubCategoryWithParent[] = categories.flatMap(cat =>
    (cat.subCategories ?? []).map(s => ({ ...s, categoryName: cat.categoryName }))
  );

  const filtered = allSubCategories.filter(s =>
    s.subCategoryName.toLowerCase().includes(search.toLowerCase()) ||
    s.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!toDelete) return;
    const res = await dispatch(deleteSubCategory(toDelete.id));
    if (deleteSubCategory.fulfilled.match(res)) {
      dispatch(clearSubCatDeleteError());
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Subcategories
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage all subcategories
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="relative w-72 mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search subcategories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all"
        />
      </div>

      {subCatDeleteError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          {subCatDeleteError}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-indigo-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
            <button
              onClick={() => dispatch(fetchCategories())}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium dark:bg-red-500/10 dark:text-red-400"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <Layers size={32} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">No subcategories found</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">#</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filtered.map((sub, idx) => (
                <tr key={sub.id} className={cn('hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors')}>
                  <td className="px-6 py-4 text-zinc-400 dark:text-zinc-500 text-xs">{idx + 1}</td>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {sub.subCategoryName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
                      {sub.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditItem(sub)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        title="Edit"
                      >
                        <Pencil size={16} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => { setToDelete(sub); dispatch(clearSubCatDeleteError()); }}
                        disabled={subCatDeleteLoading}
                        className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                        title="Delete"
                      >
                        {subCatDeleteLoading && toDelete?.id === sub.id
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
        <SubCatFormModal
          mode="add"
          categories={categories}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editItem && (
        <SubCatFormModal
          mode="edit"
          categories={categories}
          initial={editItem}
          onClose={() => setEditItem(null)}
        />
      )}

      {toDelete && (
        <DeleteModal
          productName={toDelete.subCategoryName}
          loading={subCatDeleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
