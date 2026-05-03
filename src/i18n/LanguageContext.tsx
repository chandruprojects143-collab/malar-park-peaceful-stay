import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { dict, Lang } from './translations';

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  toggle: () => void;
}

const LanguageContext = createContext<Ctx | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('malar_lang')) as Lang | null;
    return saved === 'ta' || saved === 'en' ? saved : 'en';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('malar_lang', l); } catch {}
  }, []);

  const toggle = useCallback(() => setLang(lang === 'en' ? 'ta' : 'en'), [lang, setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: string) => dict[lang][key] ?? dict.en[key] ?? key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useT = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useT must be used within LanguageProvider');
  return ctx;
};
