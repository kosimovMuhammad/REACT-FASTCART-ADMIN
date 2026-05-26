import { useEffect } from 'react';
import { CheckCircle2, Plus, ArrowRight } from 'lucide-react';

interface SuccessModalProps {
  onGoToProducts: () => void;
  onAddNew: () => void;
}

export default function SuccessModal({ onGoToProducts, onAddNew }: SuccessModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onGoToProducts(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onGoToProducts]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm" onClick={onGoToProducts}>
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800 p-8 text-center" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 border border-emerald-100 dark:border-emerald-500/20">
          <CheckCircle2 size={36} className="text-emerald-500 dark:text-emerald-400" />
        </div>
        
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Successfully added!</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
          The product has been saved. Would you like to add another product to your store?
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors shadow-sm" 
            onClick={onAddNew}
          >
            <Plus size={18} />
            Add another
          </button>
          <button 
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm" 
            onClick={onGoToProducts}
          >
            Go to products
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
