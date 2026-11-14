import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'mangal_sentinel_lang';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    const validLang = ['en', 'hi', 'mr'].includes(lang) ? lang : 'en';
    setLanguageState(validLang);
    try {
      localStorage.setItem(STORAGE_KEY, validLang);
      document.documentElement.lang = validLang;
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Translation helper function t(key, fallback)
  const t = (key, fallback = '') => {
    if (!key) return '';
    const currentDict = translations[language] || translations.en;
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
