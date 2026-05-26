import { ClipboardList, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";

export default function Orders() {
  const { t } = useTranslation();
  return (
    <div className={cn('flex', 'flex-col', 'h-full', 'max-w-5xl', 'mx-auto')}>
      <div className="mb-8">
        <h1 className={cn('text-2xl', 'font-bold', 'tracking-tight', 'text-zinc-900', 'dark:text-zinc-50')}>
          {t('orders.title')}
        </h1>
        <p className={cn('text-sm', 'text-zinc-500', 'dark:text-zinc-400', 'mt-1')}>{t('orders.subtitle')}</p>
      </div>

      <div className={cn('flex-1', 'flex', 'flex-col', 'items-center', 'justify-center', 'p-8', 'text-center', 'bg-white', 'dark:bg-zinc-900', 'rounded-xl', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'shadow-sm')}>
        <div className={cn('w-24', 'h-24', 'bg-indigo-50', 'dark:bg-indigo-500/10', 'rounded-full', 'flex', 'items-center', 'justify-center', 'mb-6', 'border', 'border-indigo-100', 'dark:border-indigo-500/20')}>
          <ClipboardList size={48} className={cn('text-indigo-600', 'dark:text-indigo-400')} />
        </div>
        <h2 className={cn('text-2xl', 'font-bold', 'text-zinc-900', 'dark:text-white', 'mb-4')}>{t('orders.noOrders')}</h2>
        <p className={cn('text-zinc-500', 'dark:text-zinc-400', 'max-w-md', 'mx-auto', 'mb-8')}>
          {t('orders.noOrdersDesc')}
        </p>
        <button className={cn('flex', 'items-center', 'gap-2', 'px-5', 'py-2.5', 'bg-indigo-600', 'hover:bg-indigo-500', 'text-white', 'rounded-lg', 'font-medium', 'transition-all', 'shadow-sm')}>
          <Plus size={18} />
          {t('orders.addOrder')}
        </button>
      </div>
    </div>
  );
}
