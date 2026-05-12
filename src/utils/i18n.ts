import { translations } from '../data/translations';
import { Language } from '../types';

export const useTranslation = (lang: Language) => {
  const t = (key: keyof typeof translations.en) => {
    // Fallback to English if translation is missing
    return translations[lang]?.[key] || translations.en[key] || key;
  };
  return { t };
};