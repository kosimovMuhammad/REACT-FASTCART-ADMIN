import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  page: number;
  setPage: (val: number | ((prev: number) => number)) => void;
  totalPages: number;
  total: number;
}

export default function ProductPagination({
  page,
  setPage,
  totalPages,
  total,
}: ProductPaginationProps) {
  const { t } = useTranslation();

  const getPageNums = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };


  return (
    <div className={cn('flex', 'items-center', 'justify-between', 'pt-6', 'pb-2')}>
      <div className={cn('flex', 'items-center', 'gap-1')}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={cn('p-1', 'text-zinc-400', 'hover:text-zinc-600', 'dark:hover:text-zinc-300', 'disabled:opacity-30', 'disabled:cursor-not-allowed', 'transition-colors')}
        >
          <ArrowLeft size={16} />
        </button>

        {getPageNums().map((n, i) =>
          n === '...' ? (
            <span key={`e-${i}`} className={cn('px-1', 'text-zinc-400', 'text-sm')}>
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => setPage(n as number)}
              className={`h-8 w-8 flex items-center justify-center rounded-sm text-sm transition-colors mx-0.5 ${
                page === n
                  ? 'bg-[#e0e7ff] text-blue-600 font-medium dark:bg-blue-500/10 dark:text-blue-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {n}
            </button>
          )
        )}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={cn('p-1', 'text-zinc-400', 'hover:text-zinc-600', 'dark:hover:text-zinc-300', 'disabled:opacity-30', 'disabled:cursor-not-allowed', 'transition-colors')}
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <div className={cn('text-sm', 'text-zinc-500', 'font-medium')}>
        {t('products.totalResults', { count: total })}
      </div>
    </div>
  );
}
