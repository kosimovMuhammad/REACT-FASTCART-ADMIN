import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    debug: false,
    supportedLngs: ['ru', 'en', 'tj'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18n_lang',
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/Locales/{{lng}}/translation.json',
    },
  });

export default i18n;
