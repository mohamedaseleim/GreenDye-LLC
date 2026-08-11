const RTL_LANGUAGE_CODES = new Set(['ar', 'fa', 'he', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ku']);
export const languageCode = value => String(value || 'en').trim().toLowerCase().split(/[-_]/)[0];
export const isRtlLanguage = value => RTL_LANGUAGE_CODES.has(languageCode(value));
export const directionForLanguage = value => isRtlLanguage(value) ? 'rtl' : 'ltr';
export { RTL_LANGUAGE_CODES };
