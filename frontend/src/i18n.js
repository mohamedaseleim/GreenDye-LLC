import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files.  Keeping translations in separate JSON files
// simplifies maintenance and allows automated completeness checks.  Each file
// contains a flat JSON object of keys and their corresponding translations.
import enTranslation from './locales/en/translation.json';
import arTranslation from './locales/ar/translation.json';
import frTranslation from './locales/fr/translation.json';

// Prepare i18n resources.  Each language code maps to a `translation`
// namespace expected by react-i18next.
const resources = {
  en: { translation: enTranslation },
  ar: { translation: arTranslation },
  fr: { translation: frTranslation }
};

// Initialise i18n.  The selected language is pulled from localStorage to
// persist user preference.  Fallback language is English.  We disable
// escaping because React already escapes output.
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
