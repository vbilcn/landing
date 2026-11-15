'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './dict/en';
import ru from './dict/ru';
import zh from './dict/zh';
import type { Dict, LangCode, View } from './types';

const DICTS: Record<LangCode, Dict> = { en, ru, zh };
export { LANGS } from './types';

type Lang = LangCode;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  view: View;
  setView: (v: View) => void;
}

const Ctx = createContext<I18nCtx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru');
  const [view, setView] = useState<View>('overview');

  useEffect(() => {
    const stored = window.localStorage.getItem('em100-lang') as Lang | null;
    // Deliberate hydration-safe pattern (same as next-themes): server renders
    // the default language, then we sync from localStorage after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored && ['en', 'ru', 'zh'].includes(stored)) setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem('em100-lang', l);
    } catch {
      /* storage unavailable */
    }
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : l;
  }, []);

  const value = useMemo<I18nCtx>(() => ({ lang, setLang, t: DICTS[lang], view, setView }), [lang, setLang, view]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used inside LanguageProvider');
  return ctx;
}

/* ---------- locale-aware number formatters ---------- */

/** Money given in $M → "$202.4M" / "$202,4 млн" / "$2.024亿" or "$1610万" */
export function moneyM(v: number, lang: Lang): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : '';
  if (lang === 'zh') {
    if (abs >= 100) {
      const yi = (abs / 100).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
      return `${sign}$${yi}亿`;
    }
    return `${sign}$${Math.round(abs * 100)}万`;
  }
  if (lang === 'ru') {
    const s = abs.toFixed(1).replace('.', ',');
    return `${sign}$${s} млн`;
  }
  const s = abs.toFixed(1).replace(/\.0$/, '');
  return `${sign}$${s}M`;
}

/** plain decimal per locale, n digits */
export function dec(v: number, lang: Lang, digits = 1): string {
  const s = v.toFixed(digits);
  return lang === 'ru' ? s.replace('.', ',') : s;
}

/** percent, n digits */
export function pct(v: number, lang: Lang, digits = 1): string {
  return `${dec(v, lang, digits)}%`;
}

export { en, ru, zh };
