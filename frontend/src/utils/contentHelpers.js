import * as Icons from '@mui/icons-material';

/**
 * Renders a Material-UI icon component by name
 * @param {string} iconName - The name of the Material-UI icon
 * @returns {JSX.Element} The icon component
 */
export const renderIcon = (iconName) => {
  const IconComponent = Icons[iconName];
  if (!IconComponent) {
    return <Icons.School fontSize="large" />;
  }
  return <IconComponent fontSize="large" />;
};

/**
 * Gets the current language code from i18n
 * @param {object} i18n - The i18n object from useTranslation hook
 * @returns {string} Language code ('en', 'ar', or 'fr')
 */
export const getCurrentLang = (i18n) => {
  const lang = i18n.language;
  if (lang === 'ar') return 'ar';
  if (lang === 'fr') return 'fr';
  return 'en';
};

/**
 * Gets multi-language content for the current language with fallback
 * @param {object} content - Object containing language variations (en, ar, fr)
 * @param {string} lang - Current language code
 * @param {string} fallback - Fallback text if content not found
 * @returns {string} The content in the specified language or fallback
 */
export const getLocalizedContent = (content, lang, fallback = '') => {
  if (!content) return fallback;
  return content[lang] || content.en || fallback;
};
