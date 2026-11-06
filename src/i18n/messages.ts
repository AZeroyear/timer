import languages from './languages.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zhCn from './locales/zh-cn.json';
import zhTw from './locales/zh-tw.json';
import ko from './locales/ko.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import ru from './locales/ru.json';
import id from './locales/id.json';

export type Lang =
  | 'en'
  | 'ja'
  | 'zh-cn'
  | 'zh-tw'
  | 'ko'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'it'
  | 'ru'
  | 'id';

export type Params = Record<string, string | number>;

type PluralSuffix = 'one' | 'other' | 'few' | 'many' | 'zero' | 'two';
type StripPlural<K> = K extends `${infer B}.${PluralSuffix}` ? B : K;
/** Keys are defined by the English file; plural variants collapse to one key. */
export type MessageKey = StripPlural<keyof typeof en>;

/**
 * Every language lives in `locales/<code>.json`. Plural forms are separate
 * keys (`unit.round.one` / `.other` / ...) chosen with Intl.PluralRules.
 * To add a language: add the JSON file, an entry in `languages.json`, and the
 * code to `Lang` and `messages` here.
 */
export const messages: Record<Lang, Record<string, string>> = {
  en,
  ja,
  'zh-cn': zhCn,
  'zh-tw': zhTw,
  ko,
  es,
  fr,
  de,
  pt,
  it,
  ru,
  id,
};

export type LangInfo = {
  code: Lang;
  htmlLang: string;
  label: string;
  ogLocale: string;
};

export const LANGS = languages as LangInfo[];

export const langInfo = (lang: Lang): LangInfo =>
  LANGS.find((l) => l.code === lang) ?? LANGS[0];
