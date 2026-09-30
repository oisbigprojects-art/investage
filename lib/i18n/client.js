import { fill } from './format';

// Serverdan kelgan tayyor matnlar bilan ishlaydigan yengil "t" (mijoz komponentlari uchun)
export function stringsT(strings, lang) {
  const t = (key, vars) => fill(strings[key] ?? key, vars);
  t.lang = lang;
  return t;
}
