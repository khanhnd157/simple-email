import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import vi from './vi';

const savedLang = typeof localStorage !== 'undefined'
  ? localStorage.getItem('simple-email-lang') || 'en'
  : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
