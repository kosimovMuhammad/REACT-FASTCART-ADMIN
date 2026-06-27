import { Plus, X } from 'lucide-react';
import type { Color } from '@/store/colorsSlice';
import { cn } from "@/lib/utils";

export const COLOR_HEX: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  orange: '#f97316', purple: '#8b5cf6', pink: '#ec4899', black: '#1e293b',
  white: '#f8fafc', gray: '#94a3b8', grey: '#94a3b8', brown: '#92400e',
  cyan: '#06b6d4', indigo: '#6366f1', teal: '#14b8a6', lime: '#84cc16',
  violet: '#7c3aed', rose: '#f43f5e', sky: '#0ea5e9', amber: '#f59e0b',
  navy: '#1e3a5f', magenta: '#d946ef', beige: '#d4b483', cream: '#fef3c7',
};

export function colorToHex(name: string): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(COLOR_HEX)) {
    if (lower.includes(key)) return COLOR_HEX[key];
  }
  return '#cbd5e1';
}

interface ProductSidebarProps {
  colors: Color[];
  colorIds: number[];
  toggleColor: (id: number) => void;
  setShowColorMdl: (v: boolean) => void;
  tags: string[];
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (t: string) => void;
  colorIdError?: string;
}

export default function ProductSidebar({
  colors, colorIds, toggleColor, setShowColorMdl,
  tags, tagInput, setTagInput, addTag, removeTag,
  colorIdError
}: ProductSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Colour</span>
          <button 
            type="button" 
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors" 
            onClick={() => setShowColorMdl(true)}
          >
            <Plus size={12} /> Create new
          </button>
        </div>
        {colorIdError && <span className={cn('text-xs', 'text-red-500', 'mb-2', 'block')}>{colorIdError}</span>}
        <div className={cn('flex', 'flex-wrap', 'gap-2', 'max-h-48', 'overflow-y-auto', 'p-1')}>
          {colors.map(c => {
            const isSelected = colorIds.includes(c.id);
            const hex = colorToHex(c.colorName);
            const isWhite = hex === '#f8fafc' || hex.toLowerCase() === '#ffffff';
            
            return (
              <button
                key={c.id}
                type="button"
                className={`relative w-8 h-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900 ${
                  isSelected ? 'ring-2 ring-offset-2 ring-indigo-600 dark:ring-indigo-500 scale-110' : 'hover:scale-110'
                } ${isWhite ? 'border border-zinc-300 dark:border-zinc-700' : ''}`}
                style={{ backgroundColor: hex }}
                title={c.colorName}
                onClick={() => toggleColor(c.id)}
              >
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                    <svg viewBox="0 0 24 24" fill="none" className={`w-5 h-5 ${isWhite ? 'text-zinc-900' : 'text-white'}`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide mb-4">Tags</h3>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all pr-12"
              placeholder="Add tag (Enter)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { 
                if (e.key === 'Enter') { 
                  e.preventDefault(); 
                  addTag(); 
                } 
              }}
            />
            <button 
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-900 rounded-md transition-colors"
              onClick={addTag}
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full text-sm font-medium border border-zinc-200 dark:border-zinc-700">
                {t}
                <button 
                  type="button" 
                  onClick={() => removeTag(t)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 p-0.5 transition-colors ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
