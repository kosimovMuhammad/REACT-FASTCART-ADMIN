import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGS = ['ru', 'en', 'tj'] as const;
type Lang = typeof LANGS[number];

export function LangToggle() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = (LANGS.includes(i18n.language as Lang) ? i18n.language : 'ru') as Lang;

  const handleChange = (lang: Lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18n_lang', lang);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-sm font-medium"
        title="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase text-xs">{current}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-24 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg py-1">
            {LANGS.map((lang) => (
              <button
                key={lang}
                onClick={() => handleChange(lang)}
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors uppercase ${
                  current === lang
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
