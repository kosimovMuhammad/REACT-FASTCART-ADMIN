import React from 'react';
import { Search, ChevronDown, Pencil, Trash2 } from 'lucide-react';

interface ProductToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  filter: string;
  setFilter: (val: string) => void;
  filterOpen: boolean;
  setFilterOpen: (val: boolean) => void;
  sortOpts: string[];
  selectedCount: number;
  onBulkDelete: () => void;
}

export default function ProductToolbar({
  search,
  setSearch,
  handleSearch,
  filter,
  setFilter,
  filterOpen,
  setFilterOpen,
  sortOpts,
  selectedCount,
  onBulkDelete,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
        <form className="relative w-full sm:w-64" onSubmit={handleSearch}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-zinc-100 transition-shadow"
          />
        </form>

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Sort by:</span>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              {filter}
              <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full z-20 mt-2 w-48 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg py-1">
                {sortOpts.map((opt) => (
                  <button
                    key={opt}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                      filter === opt ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                    onClick={() => {
                      setFilter(opt);
                      setFilterOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Edit selected"
          disabled={selectedCount !== 1}
        >
          <Pencil size={18} />
        </button>
        <button
          className="flex items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 dark:hover:border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Delete selected"
          onClick={onBulkDelete}
          disabled={selectedCount === 0}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
