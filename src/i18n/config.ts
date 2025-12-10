import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import it from './locales/it.json';

// Get saved language from localStorage or default to English
const getInitialLanguage = (): 'en' | 'it' => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('dashboard_language');
    if (savedLanguage === 'en' || savedLanguage === 'it') {
      return savedLanguage;
    }
    // Check browser language
    const browserLanguage = navigator.language.split('-')[0];
    return browserLanguage === 'it' ? 'it' : 'en';
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Save language preference
export const saveLanguage = (language: 'en' | 'it') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dashboard_language', language);
    i18n.changeLanguage(language);
  }
};

// Get current language
export const getCurrentLanguage = () => i18n.language;

export default i18n;


