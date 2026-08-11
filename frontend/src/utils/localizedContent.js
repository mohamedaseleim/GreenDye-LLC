export const SUPPORTED_LANGUAGES=['en','ar','fr'];
export const normalizeLanguage=value=>SUPPORTED_LANGUAGES.includes(value)?value:'en';
export const localized=(value,language='en')=>{if(value==null)return '';if(typeof value==='string')return value;const lang=normalizeLanguage(language);return value[lang]||value.en||value.ar||value.fr||''};
export const localeFor=language=>({en:'en-US',ar:'ar-EG',fr:'fr-FR'}[normalizeLanguage(language)]);
