import { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface DeleteModalProps {
  productName?: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ productName, loading, onConfirm, onCancel }: DeleteModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm" onClick={onCancel}>
      <div 
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Delete product</h3>
          <button 
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800" 
            onClick={onCancel}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Are you sure you want to delete
            {productName ? <span className="font-medium text-zinc-900 dark:text-zinc-200"> {productName}</span> : ' this product'}?
            This action cannot be undone.
          </p>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm disabled:opacity-50" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70" 
            onClick={onConfirm} 
            disabled={loading}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
