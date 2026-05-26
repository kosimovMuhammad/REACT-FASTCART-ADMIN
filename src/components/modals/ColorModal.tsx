import { useState, useEffect } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { addColor, clearAddError } from '@/store/colorsSlice';

interface ColorModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

export default function ColorModal({ onClose, onCreated }: ColorModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { addLoading, addError } = useSelector((s: RootState) => s.colors);

  const [colorName, setColorName] = useState('');
  const [hex, setHex] = useState('#3b82f6');

  useEffect(() => {
    dispatch(clearAddError());
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, dispatch]);

  const handleCreate = async () => {
    if (!colorName.trim()) return;
    const result = await dispatch(addColor(colorName.trim()));
    if (addColor.fulfilled.match(result)) {
      onCreated?.();
      onClose();
    }
  };

  const handleHexInput = (val: string) => {
    const clean = val.startsWith('#') ? val : `#${val}`;
    setHex(clean);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Plus size={18} className="text-indigo-500" /> 
            New color
          </h3>
          <button 
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          {addError && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              {addError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">Color name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
              placeholder="e.g. Navy Blue"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">Hex Code (Optional)</label>
            <div className="flex gap-3">
              <div 
                className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden relative shrink-0 cursor-pointer shadow-inner"
                style={{ backgroundColor: hex }}
              >
                <input
                  type="color"
                  value={hex.length === 7 ? hex : '#3b82f6'}
                  onChange={(e) => setHex(e.target.value)}
                  className="absolute inset-0 opacity-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                />
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">#</span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 pl-7 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all uppercase font-medium"
                  value={hex.replace('#', '')}
                  maxLength={6}
                  onChange={(e) => handleHexInput(e.target.value)}
                  placeholder="3B82F6"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm disabled:opacity-50" 
            onClick={onClose} 
            disabled={addLoading}
          >
            Cancel
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70" 
            onClick={handleCreate} 
            disabled={addLoading || !colorName.trim()}
          >
            {addLoading ? <Loader2 size={15} className="animate-spin" /> : null}
            {addLoading ? 'Creating…' : 'Create color'}
          </button>
        </div>
      </div>
    </div>
  );
}
