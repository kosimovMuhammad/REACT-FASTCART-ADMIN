import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Categories() {
  const { t } = useTranslation();
  return (
    <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-[60vh]', 'text-center', 'px-4')}>
      <div className={cn('w-20', 'h-20', 'bg-indigo-50', 'dark:bg-indigo-500/10', 'rounded-full', 'flex', 'items-center', 'justify-center', 'mb-6', 'border', 'border-indigo-100', 'dark:border-indigo-500/20')}>
        <Tag size={36} className={cn('text-indigo-600', 'dark:text-indigo-400')} />
      </div>
      <h1 className={cn('text-3xl', 'font-bold', 'text-zinc-900', 'dark:text-white', 'mb-3', 'tracking-tight')}>
        {t('categories.title')}
      </h1>
      <p className={cn('text-zinc-500', 'dark:text-zinc-400', 'max-w-sm')}>{t('categories.subtitle')}</p>
    </div>
  );
}
