// So'rovnoma savollari. UI, server tekshiruvi va admin natijalari shu bitta fayldan foydalanadi.
// Savollar o'tgan tajribaga qaratilgan (kelajak va'dalari emas), shunda javoblar ishonchliroq bo'ladi.

export const SLUGS = { startap: 'startup', investor: 'investor' };

export const KINDS = {
  startup: {
    slug: 'startap',
    title: "Startaplar uchun so'rovnoma",
    short: 'Men startapman',
    blurb: "Investor izlash tajribangiz va platformadan nimani kutishingiz haqida. Taxminan 4 daqiqa.",
  },
  investor: {
    slug: 'investor',
    title: "Investorlar uchun so'rovnoma",
    short: 'Men investorman',
    blurb: "Startaplarni qanday topishingiz va qaror qilishda nima muhimligi haqida. Taxminan 4 daqiqa.",
  },
};

const SECTORS = ['IT/AI', 'Fintech', 'Edtech', 'Agro', 'Savdo/E-commerce', "Sog'liqni saqlash", 'Boshqa'];
const CHECKS = ["10 ming dollardan kam", '10-50 ming dollar', '50-100 ming dollar', '100-300 ming dollar', "300 ming dollardan ko'p"];
const CONSENT_Q = "Javoblaringiz maxfiy saqlanadi va faqat Investage jamoasi tomonidan tadqiqot uchun ishlatiladi.";

export const QUESTIONS = {
  startup: [
    { id: 'name', type: 'text', q: 'Loyiha yoki jamoa nomi', required: true, max: 100 },
    { id: 'sector', type: 'single', q: 'Loyihangiz qaysi sohada?', required: true, options: SECTORS },
    { id: 'stage', type: 'single', q: 'Loyiha hozir qaysi bosqichda?', required: true, options: ['Faqat g\'oya', 'MVP bor', 'Birinchi mijozlar bor', 'Daromad bor'] },
    { id: 'searched', type: 'single', q: 'Hozirgacha investitsiya izlaganmisiz?', required: true, options: ['Ha, topdim', 'Ha, topa olmadim', 'Hozir izlayapman', "Yo'q"] },
    { id: 'methods', type: 'multi', q: 'Qanday usullar bilan izlagansiz?', hint: 'Bir nechtasini tanlashingiz mumkin.', options: ['Tanishlar orqali', 'Tadbirlar', 'IT Park / akseleratorlar', 'Onlayn platformalar', 'Bank / kredit', 'Boshqa'] },
    { id: 'hardest', type: 'long', q: "Oxirgi marta investor izlaganingizda eng qiyin narsa nima bo'ldi?", hint: "Aniq voqeani yozing. Izlamagan bo'lsangiz, bu savolni o'tkazib yuboring." },
    { id: 'time', type: 'single', q: 'Investor topishga qancha vaqt sarfladingiz?', options: ['1 oydan kam', '1-3 oy', '3-6 oy', "6 oydan ko'p"] },
    { id: 'amount', type: 'single', q: 'Sizga qancha mablag\' kerak?', required: true, options: CHECKS },
    { id: 'equity', type: 'single', q: 'Buning evaziga qancha ulush berishga tayyorsiz?', required: true, options: ['5% gacha', '5-10%', '10-20%', '20-30%', "30% dan ko'p"] },
    { id: 'badge', type: 'single', q: "\"Tasdiqlangan\" belgisi uchun hujjat topshirishga tayyormisiz?", required: true, options: ['Ha', 'Ehtimol', "Yo'q"] },
    { id: 'expect', type: 'single', q: 'Platformadan eng avval nimani kutasiz?', required: true, options: ['Investorga chiqish', 'Ishonch va obro\'', 'Baholash (scoring)', 'Fikr-mulohaza', 'Boshqa'] },
    { id: 'pay', type: 'single', q: "Real investor bilan uchrashuv ta'minlansa, oyiga qancha to'lash oqilona?", hint: "Bu faqat taxmin, hech narsa majburlamaydi.", options: ['0', '20 dollargacha', '20-50 dollar', '50-100 dollar', "100 dollardan ko'p"] },
    { id: 'contact', type: 'contact', q: "Aloqa uchun Telegram yoki email", hint: "Ixtiyoriy. Faqat qo'shimcha savol yoki pilot taklifi uchun yozamiz.", placeholder: '@username yoki email', max: 120 },
    { id: 'consent', type: 'consent', q: CONSENT_Q, label: 'Javoblarim tadqiqot uchun ishlatilishiga roziman', required: true },
  ],
  investor: [
    { id: 'name', type: 'text', q: 'Ismingiz', hint: 'Ixtiyoriy.', max: 100 },
    { id: 'type', type: 'single', q: 'Siz qanday investorsiz?', required: true, options: ['Biznesmen / angel', 'Venchur fond', 'Korporativ investor', 'Oilaviy ofis', 'Boshqa'] },
    { id: 'invested', type: 'single', q: "Oxirgi 12 oyda startapga investitsiya qilganmisiz?", required: true, options: ['Ha', "Yo'q"] },
    { id: 'found', type: 'long', q: 'Qilgan bo\'lsangiz, startapni qanday topdingiz?', hint: "Aniq voqeani yozing. Qilmagan bo'lsangiz, o'tkazib yuboring." },
    { id: 'check', type: 'single', q: 'Odatiy investitsiya (chek) hajmingiz qancha?', required: true, options: CHECKS },
    { id: 'sectors', type: 'multi', q: 'Qaysi sohalar qiziq?', hint: 'Bir nechtasini tanlashingiz mumkin.', options: SECTORS },
    { id: 'stages', type: 'multi', q: 'Qaysi bosqichdagi startaplar qiziq?', hint: 'Bir nechtasini tanlashingiz mumkin.', options: ["G'oya", 'MVP', 'Birinchi mijozlar', 'Daromadli'] },
    { id: 'criteria', type: 'multi', q: 'Startap tanlashda eng muhim 3 narsa nima?', hint: '3 tagacha tanlang.', required: true, max: 3, options: ['Jamoa', 'Bozor hajmi', 'Mijozlar / daromad', 'Hujjatlar va moliyaviy ochiqlik', 'Mahsulot', 'Tavsiya va ishonch', 'Ulush shartlari'] },
    { id: 'barrier', type: 'long', q: 'Startapga pul tikishdan oldin sizni eng ko\'p nima to\'xtatadi?', hint: 'Eng katta to\'siq yoki xavfni yozing.' },
    { id: 'badge_effect', type: 'scale', q: "\"Tasdiqlangan\" belgisi (hujjatlar ko'rib chiqilgan) qaroringizga qanchalik ta'sir qiladi?", required: true, low: "Umuman ta'sir qilmaydi", high: 'Hal qiluvchi' },
    { id: 'score_trust', type: 'long', q: "Startapning scoring (baho) balliga ishonishingiz uchun nima kerak?" },
    { id: 'deep_ok', type: 'single', q: "Startapning chuqur ma'lumoti faqat so'rov va tasdiqdan keyin ochilsa, bu sizga qulaymi?", required: true, options: ['Ha', "Yo'q", 'Bilmayman'] },
    { id: 'volume', type: 'single', q: "Oyiga nechta yangi startapni ko'rib chiqishga tayyorsiz?", options: ['1-2', '3-5', '6-10', "10 dan ko'p"] },
    { id: 'need', type: 'long', q: "Bunday platformadan foydalanish uchun sizga nima kerak bo'lardi?" },
    { id: 'contact', type: 'contact', q: 'Aloqa uchun Telegram yoki email', hint: "Ixtiyoriy. Faqat qo'shimcha savol yoki pilot taklifi uchun yozamiz.", placeholder: '@username yoki email', max: 120 },
    { id: 'consent', type: 'consent', q: CONSENT_Q, label: 'Javoblarim tadqiqot uchun ishlatilishiga roziman', required: true },
  ],
};

const clip = (v, n) => String(v ?? '').replace(/\r/g, '').trim().slice(0, n);

// Server tomonida javoblarni qat'iy tekshiradi: faqat ma'lum savollar, ruxsat etilgan variantlar va uzunliklar o'tadi
export function sanitize(kind, raw) {
  const qs = QUESTIONS[kind];
  if (!qs || !raw || typeof raw !== 'object') return { ok: false, error: "So'rovnoma topilmadi" };
  const out = {};
  for (const q of qs) {
    const v = raw[q.id];
    let val = '';
    if (q.type === 'text' || q.type === 'contact') val = clip(v, q.max || 120);
    else if (q.type === 'long') val = clip(v, q.max || 1500);
    else if (q.type === 'single') val = q.options.includes(v) ? v : '';
    else if (q.type === 'multi') {
      const arr = Array.isArray(v) ? v.filter((x) => q.options.includes(x)) : [];
      val = [...new Set(arr)].slice(0, q.max || q.options.length);
    } else if (q.type === 'scale') {
      const n = Number(v);
      val = Number.isInteger(n) && n >= 1 && n <= 5 ? n : 0;
    } else if (q.type === 'consent') val = v === true;
    const empty = val === '' || val === 0 || val === false || (Array.isArray(val) && !val.length);
    if (q.required && empty) return { ok: false, error: 'Majburiy savolga javob berilmagan' };
    if (!empty) out[q.id] = val;
  }
  return { ok: true, answers: out };
}
