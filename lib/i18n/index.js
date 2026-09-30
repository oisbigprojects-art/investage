// Til tizimi (server va brauzerda ishlaydi; next/headers'ga bog'liq emas)
import uz from './uz';
import ru from './ru';
import en from './en';
import { normLang, fill, pluralIndex } from './format';

export { LANGS, DEFAULT_LANG, LANG_NAMES, LOCALES, normLang } from './format';

const DICTS = { uz, ru, en };

export function makeT(langIn) {
  const lang = normLang(langIn);
  const dict = DICTS[lang];
  const raw = (key) => dict[key] ?? uz[key] ?? key;
  const t = (key, vars) => fill(raw(key), vars);
  t.lang = lang;
  // Son bilan: t.n('ago.min', 5) — "{n}" avtomatik to'ldiriladi
  t.n = (key, n, vars) => {
    const forms = raw(key).split('|');
    return fill(forms[Math.min(pluralIndex(lang, n), forms.length - 1)], { n, ...vars });
  };
  return t;
}

// Mijoz komponentlariga faqat kerakli matnlarni uzatish uchun
export function pickStrings(t, keys) {
  return Object.fromEntries(keys.map((k) => [k, t(k)]));
}
