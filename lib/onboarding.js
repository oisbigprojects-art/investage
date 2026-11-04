// Ro'yxatdan o'tishdagi majburiy anketa: hudud, pochta indeksi va rolga qarab 3-4 ta qisqa savol.
// Sahifa, server action va admin ko'rinishi shu bitta fayldan foydalanadi. Bazaga faqat qiymat kodlari yoziladi.
//
// Pochta indeksi: O'zbekistonda 6 xonali, birinchi ikki raqami viloyatni bildiradi
// (Toshkent shahri 100xxx, Toshkent viloyati 11xxxx, ... Qoraqalpog'iston 23xxxx).
// Indeks tanlangan viloyatga mos kelmasa, anketa qabul qilinmaydi: soxta yoki tasodifiy ma'lumot kamayadi.
// Xuddi shu tekshiruv bazadagi finish_onboarding funksiyasida ham bor.

export const REGIONS = [
  { v: 'toshkent_sh', p: ['10', '11'], uz: 'Toshkent shahri', ru: 'город Ташкент', en: 'Tashkent city' },
  { v: 'toshkent_v', p: ['10', '11'], uz: 'Toshkent viloyati', ru: 'Ташкентская область', en: 'Tashkent region' },
  { v: 'andijon', p: ['17'], uz: 'Andijon viloyati', ru: 'Андижанская область', en: 'Andijan region' },
  { v: 'buxoro', p: ['20'], uz: 'Buxoro viloyati', ru: 'Бухарская область', en: 'Bukhara region' },
  { v: 'fargona', p: ['15'], uz: "Farg'ona viloyati", ru: 'Ферганская область', en: 'Fergana region' },
  { v: 'jizzax', p: ['13'], uz: 'Jizzax viloyati', ru: 'Джизакская область', en: 'Jizzakh region' },
  { v: 'xorazm', p: ['22'], uz: 'Xorazm viloyati', ru: 'Хорезмская область', en: 'Khorezm region' },
  { v: 'namangan', p: ['16'], uz: 'Namangan viloyati', ru: 'Наманганская область', en: 'Namangan region' },
  { v: 'navoiy', p: ['21'], uz: 'Navoiy viloyati', ru: 'Навоийская область', en: 'Navoi region' },
  { v: 'qashqadaryo', p: ['18'], uz: 'Qashqadaryo viloyati', ru: 'Кашкадарьинская область', en: 'Kashkadarya region' },
  { v: 'qoraqalpogiston', p: ['23'], uz: "Qoraqalpog'iston Respublikasi", ru: 'Республика Каракалпакстан', en: 'Karakalpakstan' },
  { v: 'samarqand', p: ['14'], uz: 'Samarqand viloyati', ru: 'Самаркандская область', en: 'Samarkand region' },
  { v: 'sirdaryo', p: ['12'], uz: 'Sirdaryo viloyati', ru: 'Сырдарьинская область', en: 'Syrdarya region' },
  { v: 'surxondaryo', p: ['19'], uz: 'Surxondaryo viloyati', ru: 'Сурхандарьинская область', en: 'Surkhandarya region' },
  { v: 'chet', p: null, uz: 'Chet elda yashayman', ru: 'Живу за рубежом', en: 'I live abroad' },
];

// Indeks formati va viloyatga mosligi. Natija: '' (to'g'ri) yoki xato kaliti
export function postalError(region, raw) {
  const r = REGIONS.find((x) => x.v === region);
  if (!r) return 'ob.err_region';
  const code = String(raw || '').trim().toUpperCase();
  if (!r.p) return /^[A-Z0-9][A-Z0-9 -]{1,8}[A-Z0-9]$/.test(code) ? '' : 'ob.err_postal_abroad';
  if (!/^\d{6}$/.test(code)) return 'ob.err_postal';
  return r.p.includes(code.slice(0, 2)) ? '' : 'ob.err_postal_region';
}

const MONEY = [
  { v: 'lt10', uz: '10 ming $ gacha', ru: 'до $10 тыс.', en: 'under $10k' },
  { v: '10_50', uz: '10–50 ming $', ru: '$10–50 тыс.', en: '$10–50k' },
  { v: '50_100', uz: '50–100 ming $', ru: '$50–100 тыс.', en: '$50–100k' },
  { v: '100_300', uz: '100–300 ming $', ru: '$100–300 тыс.', en: '$100–300k' },
  { v: 'gt300', uz: "300 ming $ dan ko'p", ru: 'более $300 тыс.', en: 'over $300k' },
];

const SECTORS = [
  { v: 'it', uz: "IT / dasturiy ta'minot", ru: 'IT / софт', en: 'IT / software' },
  { v: 'fintech', uz: 'Fintech', ru: 'Финтех', en: 'Fintech' },
  { v: 'edu', uz: "Ta'lim", ru: 'Образование', en: 'Education' },
  { v: 'health', uz: "Sog'liqni saqlash", ru: 'Здравоохранение', en: 'Healthcare' },
  { v: 'agro', uz: "Qishloq xo'jaligi", ru: 'Агро', en: 'Agriculture' },
  { v: 'ecom', uz: 'Savdo / e-commerce', ru: 'Торговля / e-commerce', en: 'Retail / e-commerce' },
  { v: 'logistics', uz: 'Logistika', ru: 'Логистика', en: 'Logistics' },
  { v: 'tourism', uz: 'Turizm', ru: 'Туризм', en: 'Tourism' },
  { v: 'other', uz: 'Boshqa', ru: 'Другое', en: 'Other' },
];

const SOURCE = {
  id: 'source',
  type: 'single',
  q: { uz: 'Investage haqida qayerdan eshitdingiz?', ru: 'Откуда вы узнали об Investage?', en: 'How did you hear about Investage?' },
  options: [
    { v: 'instagram', uz: 'Instagram', ru: 'Instagram', en: 'Instagram' },
    { v: 'telegram', uz: 'Telegram', ru: 'Telegram', en: 'Telegram' },
    { v: 'friend', uz: 'Tanishlardan', ru: 'От знакомых', en: 'From someone I know' },
    { v: 'search', uz: 'Google / qidiruv', ru: 'Google / поиск', en: 'Google / search' },
    { v: 'event', uz: 'Tadbirda', ru: 'На мероприятии', en: 'At an event' },
    { v: 'other', uz: 'Boshqa', ru: 'Другое', en: 'Other' },
  ],
};

export const QUESTIONS = {
  startup: [
    { id: 'sector', type: 'single', q: { uz: 'Loyihangiz qaysi sohada?', ru: 'В какой сфере ваш проект?', en: 'What sector is your project in?' }, options: SECTORS },
    {
      id: 'stage',
      type: 'single',
      q: { uz: 'Loyiha qaysi bosqichda?', ru: 'На какой стадии проект?', en: 'What stage is the project at?' },
      options: [
        { v: 'goya', uz: "G'oya", ru: 'Идея', en: 'Idea' },
        { v: 'mvp', uz: 'MVP bor', ru: 'Есть MVP', en: 'MVP ready' },
        { v: 'clients', uz: 'Birinchi mijozlar bor', ru: 'Есть первые клиенты', en: 'First customers' },
        { v: 'daromad', uz: 'Daromad bor', ru: 'Есть выручка', en: 'Generating revenue' },
      ],
    },
    { id: 'amount', type: 'single', q: { uz: "Qancha mablag' kerak?", ru: 'Сколько нужно инвестиций?', en: 'How much funding do you need?' }, options: MONEY },
    SOURCE,
  ],
  investor: [
    {
      id: 'type',
      type: 'single',
      q: { uz: 'Siz qanday investorsiz?', ru: 'Какой вы инвестор?', en: 'What kind of investor are you?' },
      options: [
        { v: 'angel', uz: 'Biznesmen / angel', ru: 'Предприниматель / ангел', en: 'Business owner / angel' },
        { v: 'fund', uz: 'Venchur fond', ru: 'Венчурный фонд', en: 'Venture fund' },
        { v: 'corporate', uz: 'Kompaniya nomidan', ru: 'От имени компании', en: 'On behalf of a company' },
        { v: 'first', uz: 'Birinchi marta sarmoya kiritmoqchiman', ru: 'Инвестирую впервые', en: 'First-time investor' },
      ],
    },
    { id: 'check', type: 'single', q: { uz: 'Bitta loyihaga qancha kiritishga tayyorsiz?', ru: 'Сколько готовы вложить в один проект?', en: 'How much would you put into one project?' }, options: MONEY },
    { id: 'sectors', type: 'multi', max: 3, q: { uz: 'Qaysi sohalar qiziq? (3 tagacha)', ru: 'Какие сферы интересны? (до 3)', en: 'Which sectors interest you? (up to 3)' }, options: SECTORS },
    SOURCE,
  ],
};

// Brauzerga yuboriladigan, tanlangan tildagi ko'rinish
export function localize(role, lang) {
  const pick = (o) => o[lang] || o.uz;
  return {
    regions: REGIONS.map((r) => ({ v: r.v, label: pick(r) })),
    questions: (QUESTIONS[role] || []).map((q) => ({ id: q.id, type: q.type, max: q.max, q: pick(q.q), options: q.options.map((o) => ({ v: o.v, label: pick(o) })) })),
  };
}

// Admin uchun kodni o'zbekcha matnga aylantiradi
export function describe(role, answers) {
  const out = [];
  for (const q of QUESTIONS[role] || []) {
    const v = answers?.[q.id];
    if (v === undefined) continue;
    const name = (code) => q.options.find((o) => o.v === code)?.uz || code;
    out.push([q.q.uz, Array.isArray(v) ? v.map(name).join(', ') : name(v)]);
  }
  return out;
}

export const regionName = (v) => REGIONS.find((r) => r.v === v)?.uz || v || '—';

// Server tomonida: faqat ma'lum savollar va ruxsat etilgan variantlar o'tadi, hammasi majburiy
export function sanitize(role, raw) {
  const answers = {};
  for (const q of QUESTIONS[role] || []) {
    const allowed = q.options.map((o) => o.v);
    if (q.type === 'multi') {
      const arr = [...new Set((raw[q.id] || []).filter((x) => allowed.includes(x)))];
      if (!arr.length || arr.length > (q.max || allowed.length)) return null;
      answers[q.id] = arr;
    } else {
      if (!allowed.includes(raw[q.id])) return null;
      answers[q.id] = raw[q.id];
    }
  }
  return answers;
}
