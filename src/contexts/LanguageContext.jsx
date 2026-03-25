import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredLang, setStoredLang, translations,
  LANGUAGES, getLangDirection, getAITranslationCache, cacheAITranslation,
} from '../utils/translations';

const fallbackT = (key) => translations.en?.[key] ?? key;

const LanguageContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getStoredLang);

  useEffect(() => {
    setStoredLang(lang);
    const dir = getLangDirection(lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang) => {
    const valid = LANGUAGES.some((l) => l.code === newLang);
    setLangState(valid ? newLang : 'en');
  };

  const t = (key) => {
    // 1. Check built-in translations
    if (translations[lang]?.[key]) return translations[lang][key];
    // 2. Check AI translation cache
    const cache = getAITranslationCache();
    if (cache[lang]?.[key]) return cache[lang][key];
    // 3. Fallback to English
    return translations.en?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: getStoredLang(),
      setLang: () => {},
      t: fallbackT,
    };
  }
  return ctx;
}
