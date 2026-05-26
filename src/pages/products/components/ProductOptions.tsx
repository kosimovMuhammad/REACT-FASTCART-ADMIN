import { Plus, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface OptionRow {
  name: string;
  values: string[];
  inputVal: string;
}

interface ProductOptionsProps {
  hasOptions: boolean;
  setHasOptions: (v: boolean) => void;
  options: OptionRow[];
  updateOptName: (i: number, val: string) => void;
  updateOptInput: (i: number, val: string) => void;
  addOptValue: (i: number) => void;
  removeOptValue: (i: number, val: string) => void;
  addOptionRow: () => void;
}

export default function ProductOptions({
  hasOptions, setHasOptions,
  options,
  updateOptName, updateOptInput,
  addOptValue, removeOptValue, addOptionRow
}: ProductOptionsProps) {
  return (
    <div className={cn('bg-white', 'dark:bg-zinc-900', 'rounded-xl', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'shadow-sm', 'p-5', 'sm:p-6', 'mb-6')}>
      <div className={cn('flex', 'items-center', 'justify-between', 'mb-4')}>
        <div>
          <h3 className={cn('text-lg', 'font-semibold', 'text-zinc-900', 'dark:text-white')}>Different Options</h3>
          <p className={cn('text-sm', 'text-zinc-500', 'dark:text-zinc-400', 'mt-0.5')}>This product has multiple options</p>
        </div>
        <div 
          className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${hasOptions ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          onClick={() => setHasOptions(!hasOptions)}
        >
          <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${hasOptions ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </div>

      {hasOptions && (
        <div className={cn('mt-6', 'space-y-4', 'pt-4', 'border-t', 'border-zinc-100', 'dark:border-zinc-800')}>
          <h4 className={cn('text-sm', 'font-medium', 'text-zinc-900', 'dark:text-white', 'uppercase', 'tracking-wide')}>Options</h4>
          
          <div className="space-y-4">
            {options.map((opt, i) => (
              <div key={i} className={cn('flex', 'flex-col', 'sm:flex-row', 'gap-4', 'bg-zinc-50', 'dark:bg-zinc-950/50', 'p-4', 'rounded-lg', 'border', 'border-zinc-100', 'dark:border-zinc-800')}>
                <div className={cn('sm:w-1/3', 'shrink-0')}>
                  <span className={cn('block', 'text-xs', 'font-semibold', 'text-zinc-500', 'dark:text-zinc-400', 'mb-1.5', 'uppercase', 'tracking-wide')}>Option {i + 1}</span>
                  <input
                    className={cn('w-full', 'rounded-md', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-3', 'py-2', 'text-sm', 'bg-white', 'dark:bg-zinc-900', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-indigo-500', 'focus:ring-indigo-500/20', 'transition-all')}
                    placeholder="e.g., Size"
                    value={opt.name}
                    onChange={e => updateOptName(i, e.target.value)}
                  />
                </div>
                
                <div className="flex-1">
                  <span className={cn('block', 'text-xs', 'font-semibold', 'text-zinc-500', 'dark:text-zinc-400', 'mb-1.5', 'uppercase', 'tracking-wide')}>Value</span>
                  <div className={cn('flex', 'flex-wrap', 'gap-2', 'items-center', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'rounded-md', 'p-1.5', 'focus-within:ring-2', 'focus-within:ring-indigo-500/20', 'focus-within:border-indigo-500', 'transition-all')}>
                    {opt.values.map(v => (
                      <span key={v} className={cn('flex', 'items-center', 'gap-1.5', 'bg-indigo-50', 'dark:bg-indigo-500/10', 'text-indigo-700', 'dark:text-indigo-300', 'px-2', 'py-1', 'rounded', 'text-sm', 'font-medium', 'border', 'border-indigo-100', 'dark:border-indigo-500/20')}>
                        {v}
                        <button 
                          type="button" 
                          onClick={() => removeOptValue(i, v)}
                          className={cn('text-indigo-400', 'hover:text-indigo-600', 'dark:text-indigo-500', 'dark:hover:text-indigo-300', 'rounded-full', 'hover:bg-indigo-200/50', 'dark:hover:bg-indigo-500/20', 'p-0.5', 'transition-colors')}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      className={cn('flex-1', 'min-w-[100px]', 'border-none', 'bg-transparent', 'text-sm', 'px-2', 'py-1', 'outline-none', 'dark:text-white', 'placeholder:text-zinc-400')}
                      placeholder="Add value (Enter or comma)"
                      value={opt.inputVal}
                      onChange={e => updateOptInput(i, e.target.value)}
                      onKeyDown={e => { 
                        if (e.key === 'Enter' || e.key === ',') { 
                          e.preventDefault(); 
                          addOptValue(i); 
                        } 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            className={cn('flex', 'items-center', 'gap-2', 'mt-4', 'text-sm', 'font-medium', 'text-indigo-600', 'dark:text-indigo-400', 'hover:text-indigo-700', 'dark:hover:text-indigo-300', 'transition-colors')} 
            onClick={addOptionRow}
          >
            <Plus size={16} /> 
            Add more option
          </button>
        </div>
      )}
    </div>
  );
}
