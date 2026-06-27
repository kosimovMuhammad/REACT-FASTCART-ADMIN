import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Loader2, X, AlertCircle, ImageIcon, Upload } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchBanners, addBanner, updateBanner, deleteBanner,
  clearAddError, clearEditError, clearDeleteError,
  type Banner,
} from '@/store/bannersSlice';
import { getImageUrl } from '@/store/productsSlice';
import DeleteModal from '@/components/modals/DeleteModal';
import { cn } from '@/lib/utils';

interface BannerFormModalProps {
  mode: 'add' | 'edit';
  initial?: Banner;
  onClose: () => void;
}

function BannerFormModal({ mode, initial, onClose }: BannerFormModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { addLoading, addError, editLoading, editError } = useSelector((s: RootState) => s.banners);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial?.imageUrl ? getImageUrl(initial.imageUrl) ?? null : null
  );

  const loading = mode === 'add' ? addLoading : editLoading;
  const error   = mode === 'add' ? addError   : editError;

  useEffect(() => {
    dispatch(clearAddError());
    dispatch(clearEditError());
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch, onClose]);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    if (title.trim()) fd.append('Title', title.trim());
    if (file) fd.append('BannerImage', file);

    if (mode === 'add') {
      if (!file) return;
      const res = await dispatch(addBanner(fd));
      if (addBanner.fulfilled.match(res)) onClose();
    } else {
      fd.append('Id', String(initial!.id));
      const res = await dispatch(updateBanner(fd));
      if (updateBanner.fulfilled.match(res)) onClose();
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
            {mode === 'add' ? 'Add banner' : 'Edit banner'}
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
              Title (optional)
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Banner title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
              Image {mode === 'add' && <span className="text-red-500">*</span>}
            </label>
            <label className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors relative min-h-[140px]">
              <input
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-40 object-cover" />
              ) : (
                <div className="py-8 flex flex-col items-center">
                  <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                    <Upload size={18} className="text-zinc-500" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    <span className="underline underline-offset-2">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-zinc-400">PNG, JPG, GIF, WEBP</p>
                </div>
              )}
            </label>
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
            disabled={loading || (mode === 'add' && !file)}
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

export default function Banners() {
  const dispatch = useDispatch<AppDispatch>();
  const { banners, loading, error, deleteLoading } = useSelector((s: RootState) => s.banners);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [toDelete, setToDelete] = useState<Banner | null>(null);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const handleDelete = async () => {
    if (!toDelete) return;
    const res = await dispatch(deleteBanner(toDelete.id));
    if (deleteBanner.fulfilled.match(res)) setToDelete(null);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Banners
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage homepage banners
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
              onClick={() => dispatch(fetchBanners())}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium dark:bg-red-500/10 dark:text-red-400"
            >
              Retry
            </button>
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <ImageIcon size={32} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">No banners yet</p>
            <p className="text-xs mt-1">Click "Add" to create the first banner</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium w-32">Image</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {banners.map((banner) => (
                <tr key={banner.id} className={cn('hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors')}>
                  <td className="px-6 py-4">
                    <div className="w-24 h-14 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      {banner.imageUrl ? (
                        <img
                          src={getImageUrl(banner.imageUrl)}
                          alt={banner.title ?? 'banner'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={20} className="text-zinc-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {banner.title ?? <span className="text-zinc-400 italic">No title</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditItem(banner)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        title="Edit"
                      >
                        <Pencil size={16} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => { setToDelete(banner); dispatch(clearDeleteError()); }}
                        disabled={deleteLoading}
                        className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteLoading && toDelete?.id === banner.id
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
        <BannerFormModal mode="add" onClose={() => setShowAddModal(false)} />
      )}

      {editItem && (
        <BannerFormModal mode="edit" initial={editItem} onClose={() => setEditItem(null)} />
      )}

      {toDelete && (
        <DeleteModal
          productName={toDelete.title ?? 'this banner'}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
