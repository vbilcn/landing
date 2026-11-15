import rawEn from './dict/en';

// All strings are plain (non-literal) in en.ts, so typeof gives widened types.
export type Dict = typeof rawEn;

export type LangCode = 'en' | 'ru' | 'zh';
export type View = 'overview' | 'engineering' | 'legal';

export const LANGS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'zh', label: '中文' },
];
