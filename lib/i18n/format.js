// Yengil yordamchilar (lug'atlarsiz): mijoz komponentlari ham ishlata oladi
export const LANGS = ['uz', 'ru', 'en'];
export const DEFAULT_LANG = 'uz';
export const LANG_NAMES = { uz: "O'zbekcha", ru: 'Русский', en: 'English' };
export const LOCALES = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };

export function normLang(v) {
  return LANGS.includes(v) ? v : DEFAULT_LANG;
}

export const fill = (s, vars) =>
  vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined || vars[k] === null ? '' : String(vars[k]))) : s;

// "a|b|c" ko'rinishidagi ko'plik shakllaridan songa mosini tanlash uchun indeks
export function pluralIndex(lang, n) {
  if (lang === 'ru') {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 0;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 1;
    return 2;
  }
  if (lang === 'en') return n === 1 ? 0 : 1;
  return 0;
}
