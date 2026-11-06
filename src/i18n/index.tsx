import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Lang,
  langInfo,
  LANGS,
  messages,
  MessageKey,
  Params,
} from './messages';

export type { Lang, MessageKey, Params };
export type Translate = (key: MessageKey, params?: Params) => string;

export const LANG_KEY = 'loopy-timer:lang';

const pluralRules = new Map<Lang, Intl.PluralRules>();
const pluralCategory = (lang: Lang, n: number): string => {
  let rules = pluralRules.get(lang);
  if (!rules) {
    rules = new Intl.PluralRules(langInfo(lang).htmlLang);
    pluralRules.set(lang, rules);
  }

  return rules.select(n);
};

const lookup = (
  lang: Lang,
  key: string,
  params: Params,
): string | undefined => {
  const table = messages[lang];
  if (typeof params.n === 'number') {
    const plural =
      table[`${key}.${pluralCategory(lang, params.n)}`] ??
      table[`${key}.other`];
    if (plural !== undefined) return plural;
  }

  return table[key];
};

export const translate = (
  lang: Lang,
  key: MessageKey,
  params: Params = {},
): string => {
  const message = lookup(lang, key, params) ?? lookup('en', key, params) ?? key;

  return message.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
};

/** `/ja/` -> 'ja'. Returns null when the path has no language prefix. */
export const langFromPath = (pathname: string): Lang | null => {
  const first = pathname.split('/')[1]?.toLowerCase();

  return LANGS.find((l) => l.code === first)?.code ?? null;
};

const fromBrowserTag = (tag: string): Lang | null => {
  const lower = tag.toLowerCase();
  if (/^zh-(tw|hk|mo|hant)/.test(lower)) return 'zh-tw';
  const exact = LANGS.find((l) => l.code === lower);
  if (exact) return exact.code;

  return LANGS.find((l) => l.code === lower.split('-')[0])?.code ?? null;
};

/** Saved choice first, then the browser's language list, then English. */
export const detectLang = (): Lang => {
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    const found = LANGS.find((l) => l.code === saved);
    if (found) return found.code;
  } catch {
    // ignore
  }
  const tags = (
    navigator.languages?.length ? navigator.languages : [navigator.language]
  ).filter((tag): tag is string => typeof tag === 'string');
  for (let i = 0; i < tags.length; i += 1) {
    const lang = fromBrowserTag(tags[i]);
    if (lang) return lang;
  }

  return 'en';
};

const pathFor = (lang: Lang): string =>
  `/${lang}/${window.location.search}${window.location.hash}`;

type Value = { lang: Lang; setLang: (lang: Lang) => void; t: Translate };

const I18nContext = createContext<Value>({
  lang: 'en',
  setLang: () => undefined,
  t: (key, params) => translate('en', key, params),
});

export const I18nProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // The URL decides the language (so each language has its own address).
  const [lang, setLangState] = useState<Lang>(
    () => langFromPath(window.location.pathname) ?? detectLang(),
  );

  // Visiting "/" lands on the matching language URL.
  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', pathFor(lang));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onPop = () => {
      const next = langFromPath(window.location.pathname);
      if (next) setLangState(next);
    };
    window.addEventListener('popstate', onPop);

    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.documentElement.lang = langInfo(lang).htmlLang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (langFromPath(window.location.pathname) !== next) {
      window.history.pushState(null, '', pathFor(next));
    }
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<Value>(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): Value => useContext(I18nContext);
