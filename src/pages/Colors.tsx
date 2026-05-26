import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Colors() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-500/20">
        <Palette size={36} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">
        {t('colors.title')}
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">{t('colors.subtitle')}</p>
    </div>
  );
}
