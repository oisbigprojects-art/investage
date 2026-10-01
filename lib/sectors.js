// Bosh sahifadagi soha kartalari uchun qidiruv kalit so'zlari (startap sohasi, nomi va tavsifida qidiriladi).
// Apostrof o'rniga "_" (ilike'da istalgan bitta belgi) — ta'lim/ta’lim/talim hammasi topiladi.
export const SECTOR_KEYWORDS = {
  fintech: ['fintech', 'финтех', 'moliya', 'to_lov', 'hisob-kitob', 'nasiya', 'bank'],
  edu: ['ta_lim', 'talim', 'образован', 'education', 'edtech', 'maktab', 'o_quv'],
  health: ['sog_liq', 'tibbiy', 'shifokor', 'медицин', 'здрав', 'health', 'klinika', 'dori'],
  agro: ['agro', 'qishloq', 'fermer', 'sug_orish', 'hosil', 'сельск'],
  ecom: ['tijorat', 'e-commerce', 'marketpleys', 'marketplace', 'onlayn do_kon', 'торгов'],
  logistics: ['logist', 'логист', 'yuk tashish', 'yetkazib', 'kuryer'],
  it: ['dasturiy', 'sun_iy', 'saas', 'IT xizmat', 'ilova', 'приложен'],
  tourism: ['turizm', 'туризм', 'sayyoh', 'mehmonxona', 'gidlar', 'travel'],
};

export function sectorFilter(key) {
  const kws = SECTOR_KEYWORDS[key];
  if (!kws) return null;
  return kws.flatMap((k) => [`sector.ilike.%${k}%`, `short_desc.ilike.%${k}%`, `name.ilike.%${k}%`]).join(',');
}
