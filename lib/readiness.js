// "Startapingiz investorga tayyormi?" testi: 10 ta savol, har biri 0-10 ball, jami 100.
// Bu yo'nalish beruvchi o'z-o'zini tekshirish, professional baholash emas (sahifada ham shunday yoziladi).
// Javoblar hech qayerga yuborilmaydi: hisob brauzerda, ulashishda faqat umumiy ball ketadi.

const o = (pts, uz, ru, en) => ({ pts, uz, ru, en });

export const QUESTIONS = [
  {
    id: 'team',
    topic: { uz: 'Jamoa', ru: 'Команда', en: 'Team' },
    q: { uz: 'Loyihada nechta asoschi ishlaydi?', ru: 'Сколько основателей работает над проектом?', en: 'How many founders work on the project?' },
    options: [
      o(0, "Faqat men, bo'sh vaqtimda", 'Только я, в свободное время', 'Just me, in my spare time'),
      o(5, "Faqat men, to'liq vaqt", 'Только я, на полный день', 'Just me, full-time'),
      o(7, "2 va undan ko'p, lekin kimdir qisman", 'Двое и больше, но кто-то частично', 'Two or more, some part-time'),
      o(10, "2 va undan ko'p, hammasi to'liq vaqt", 'Двое и больше, все на полный день', 'Two or more, all full-time'),
    ],
    tip: {
      uz: "Investor avval jamoaga pul tikadi. Yolg'iz asoschi bo'lsangiz, sizni to'ldiradigan sherik toping (texnik yoki savdo tomonidan) va loyihaga to'liq vaqt bering.",
      ru: 'Инвестор прежде всего вкладывает в команду. Если вы один, найдите партнёра, который дополнит вас (технический или по продажам), и уделяйте проекту полный день.',
      en: 'Investors back teams first. If you are a solo founder, find a co-founder who complements you (tech or sales) and go full-time.',
    },
  },
  {
    id: 'product',
    topic: { uz: 'Mahsulot', ru: 'Продукт', en: 'Product' },
    q: { uz: 'Mahsulotingiz hozir qaysi holatda?', ru: 'В каком состоянии ваш продукт?', en: 'What state is your product in?' },
    options: [
      o(0, "Faqat g'oya", 'Только идея', 'Just an idea'),
      o(3, 'Dizayn yoki prototip bor', 'Есть дизайн или прототип', 'Design or prototype'),
      o(7, 'Ishlaydigan birinchi versiya (MVP) bor', 'Есть рабочая первая версия (MVP)', 'Working first version (MVP)'),
      o(10, 'Mijozlar muntazam ishlatyapti', 'Клиенты регулярно пользуются', 'Customers use it regularly'),
    ],
    tip: {
      uz: "G'oyaga emas, ishlaydigan narsaga pul berishadi. Eng oddiy ishlaydigan versiyani 4-8 haftada chiqaring va 10 ta haqiqiy foydalanuvchiga bering.",
      ru: 'Деньги дают не за идею, а за то, что работает. Выпустите простейшую рабочую версию за 4–8 недель и дайте её 10 реальным пользователям.',
      en: 'Money goes to things that work, not ideas. Ship the simplest working version in 4–8 weeks and put it in front of 10 real users.',
    },
  },
  {
    id: 'interviews',
    topic: { uz: 'Muammo', ru: 'Проблема', en: 'Problem' },
    q: { uz: "Nechta bo'lajak mijoz bilan yuzma-yuz gaplashgansiz?", ru: 'Со сколькими потенциальными клиентами вы говорили лично?', en: 'How many potential customers have you talked to in person?' },
    options: [
      o(0, 'Hech kim bilan', 'Ни с кем', 'None'),
      o(4, '1-10 ta', '1–10', '1–10'),
      o(8, '11-50 ta', '11–50', '11–50'),
      o(10, "50 tadan ko'p", 'Больше 50', 'More than 50'),
    ],
    tip: {
      uz: "Muammo haqiqatan borligini isbotlang: 20-30 ta bo'lajak mijoz bilan gaplashing, ularning so'zlarini yozib boring. Investor \"menimcha kerak\" emas, \"mijozlar shunday dedi\" degan gapni eshitmoqchi.",
      ru: 'Докажите, что проблема реальна: поговорите с 20–30 потенциальными клиентами и записывайте их слова. Инвестор хочет услышать не «мне кажется», а «клиенты сказали».',
      en: 'Prove the problem is real: talk to 20–30 potential customers and write down what they say. Investors want "customers told us", not "we think".',
    },
  },
  {
    id: 'paying',
    topic: { uz: 'Mijozlar', ru: 'Клиенты', en: 'Customers' },
    q: { uz: "Nechta mijoz sizga pul to'layapti?", ru: 'Сколько клиентов вам платят?', en: 'How many customers pay you?' },
    options: [
      o(0, 'Hali hech kim', 'Пока никто', 'None yet'),
      o(5, '1-10 ta', '1–10', '1–10'),
      o(8, '11-100 ta', '11–100', '11–100'),
      o(10, "100 tadan ko'p", 'Больше 100', 'More than 100'),
    ],
    tip: {
      uz: "Birinchi to'lovchi mijoz eng kuchli dalil. Kichik narxda bo'lsa ham, 5-10 ta mijozdan pul olishni boshlang: bu mahsulot kerakligini ko'rsatadi.",
      ru: 'Первый платящий клиент — самый сильный аргумент. Начните брать деньги хотя бы с 5–10 клиентов, пусть и недорого: это показывает, что продукт нужен.',
      en: 'A first paying customer is the strongest proof. Start charging 5–10 customers, even a small price: it shows the product is needed.',
    },
  },
  {
    id: 'competitors',
    topic: { uz: 'Bozor', ru: 'Рынок', en: 'Market' },
    q: { uz: 'Raqobatchilaringiz haqida nima deya olasiz?', ru: 'Что вы можете сказать о конкурентах?', en: 'What can you say about your competitors?' },
    options: [
      o(2, "Raqobatchimiz yo'q", 'У нас нет конкурентов', 'We have no competitors'),
      o(5, "Bilaman, lekin farqimizni aniq ayta olmayman", 'Знаю, но не могу чётко сказать, чем мы лучше', "I know them, but can't say clearly how we differ"),
      o(10, 'Bilaman va farqimizni bir gapda ayta olaman', 'Знаю и могу назвать наше отличие одной фразой', 'I know them and can state our difference in one sentence'),
    ],
    tip: {
      uz: "\"Raqobatchimiz yo'q\" investorni cho'chitadi: yo bozor yo'q, yo siz izlamagansiz. 3-5 ta raqobatchini (Excel va qog'oz ham raqobatchi) jadvalga yozing va farqingizni bitta gapga sig'diring.",
      ru: '«У нас нет конкурентов» пугает инвестора: либо нет рынка, либо вы не искали. Выпишите 3–5 конкурентов (Excel и бумага тоже конкуренты) и сформулируйте отличие одной фразой.',
      en: '"No competitors" scares investors: either there is no market or you didn\'t look. List 3–5 competitors (Excel and paper count too) and fit your difference into one sentence.',
    },
  },
  {
    id: 'numbers',
    topic: { uz: 'Raqamlar', ru: 'Цифры', en: 'Numbers' },
    q: { uz: 'Oylik xarajat va daromadingizni bilasizmi?', ru: 'Знаете ли вы свои ежемесячные расходы и доходы?', en: 'Do you know your monthly costs and revenue?' },
    options: [
      o(0, "Yo'q", 'Нет', 'No'),
      o(5, 'Taxminan bilaman', 'Примерно', 'Roughly'),
      o(10, 'Ha, jadvalda har oy yuritaman', 'Да, веду таблицу каждый месяц', 'Yes, I track them monthly in a spreadsheet'),
    ],
    tip: {
      uz: "Oddiy jadval oching: har oy qancha kirdi, qancha chiqdi, nechta mijoz qo'shildi. Investor birinchi uchrashuvdayoq shu raqamlarni so'raydi.",
      ru: 'Заведите простую таблицу: сколько пришло и ушло за месяц, сколько добавилось клиентов. Инвестор спросит эти цифры уже на первой встрече.',
      en: 'Start a simple spreadsheet: money in, money out and new customers each month. Investors ask for these numbers at the first meeting.',
    },
  },
  {
    id: 'ask',
    topic: { uz: "So'raladigan summa", ru: 'Запрашиваемая сумма', en: 'The ask' },
    q: { uz: "Qancha pul kerakligini va nimaga sarflashingizni bilasizmi?", ru: 'Знаете ли вы, сколько денег нужно и на что их потратите?', en: 'Do you know how much you need and what you will spend it on?' },
    options: [
      o(0, "Yo'q, qancha bersa", 'Нет, сколько дадут', 'No, whatever they give'),
      o(5, 'Summani bilaman', 'Знаю сумму', 'I know the amount'),
      o(10, "Summa ham, 12-18 oylik sarf rejasi ham bor", 'Есть и сумма, и план расходов на 12–18 месяцев', 'I have the amount and a 12–18 month spending plan'),
    ],
    tip: {
      uz: "Aniq summa va reja tuzing: \"X ming dollar, 40% jamoaga, 30% marketingga, 18 oyga yetadi, shu vaqtda Y ta mijozga chiqamiz\". Rejasiz so'rov jiddiy qabul qilinmaydi.",
      ru: 'Составьте точную сумму и план: «X тыс. долларов, 40% на команду, 30% на маркетинг, хватит на 18 месяцев, за это время выйдем на Y клиентов». Запрос без плана не воспринимают всерьёз.',
      en: 'Set an exact amount and plan: "$X, 40% team, 30% marketing, lasts 18 months, gets us to Y customers". An ask without a plan is not taken seriously.',
    },
  },
  {
    id: 'equity',
    topic: { uz: 'Ulush', ru: 'Доля', en: 'Equity' },
    q: { uz: 'Birinchi investorga necha foiz ulush berishga tayyorsiz?', ru: 'Какую долю вы готовы отдать первому инвестору?', en: 'How much equity would you give a first investor?' },
    options: [
      o(3, "Bilmayman", 'Не знаю', "I don't know"),
      o(5, '5% dan kam', 'Меньше 5%', 'Less than 5%'),
      o(10, '10-25%', '10–25%', '10–25%'),
      o(2, "50% va undan ko'p", '50% и больше', '50% or more'),
    ],
    tip: {
      uz: "Birinchi bosqichda odatda 10-25% beriladi. Juda ko'p bersangiz (50%+), keyingi investorlar uchun joy qolmaydi va asoschi motivatsiyasi tushadi. Juda kam (5% dan past) bo'lsa, investor qiziqmasligi mumkin.",
      ru: 'На первом этапе обычно отдают 10–25%. Если отдать слишком много (50%+), не останется места для следующих инвесторов и упадёт мотивация основателей. Слишком мало (меньше 5%) может не заинтересовать инвестора.',
      en: 'Early rounds usually give 10–25%. Give too much (50%+) and there is no room for later investors and founder motivation drops. Too little (under 5%) may not interest an investor.',
    },
  },
  {
    id: 'legal',
    topic: { uz: 'Hujjatlar', ru: 'Документы', en: 'Paperwork' },
    q: { uz: "Kompaniyangiz rasmiy ro'yxatdan o'tganmi (MChJ va h.k.)?", ru: 'Ваша компания официально зарегистрирована (ООО и т. п.)?', en: 'Is your company officially registered (LLC etc.)?' },
    options: [
      o(2, "Yo'q", 'Нет', 'No'),
      o(6, 'Jarayonda', 'В процессе', 'In progress'),
      o(10, "Ha, ulushlar ham hujjatda yozilgan", 'Да, и доли закреплены в документах', 'Yes, and equity is documented'),
    ],
    tip: {
      uz: "Investor faqat rasmiy kompaniyaga pul kirita oladi. MChJ oching va asoschilar ulushini hujjatda yozib qo'ying: keyin janjal va kechikish bo'lmaydi.",
      ru: 'Инвестор может вложиться только в официальную компанию. Откройте ООО и закрепите доли основателей в документах: так не будет споров и задержек.',
      en: 'Investors can only fund a registered company. Set up an LLC and document founder equity to avoid disputes and delays later.',
    },
  },
  {
    id: 'deck',
    topic: { uz: 'Taqdimot', ru: 'Презентация', en: 'Pitch deck' },
    q: { uz: 'Investor uchun taqdimot (pitch deck) tayyormi?', ru: 'Готова ли презентация для инвестора (pitch deck)?', en: 'Is your investor pitch deck ready?' },
    options: [
      o(0, "Yo'q", 'Нет', 'No'),
      o(5, 'Qoralama bor', 'Есть черновик', 'A draft'),
      o(10, "Tayyor, kimgadir ko'rsatib fikr olganman", 'Готова, уже показывал и получил отзывы', 'Ready, and I have shown it and got feedback'),
    ],
    tip: {
      uz: "10-12 slayd yetadi: muammo, yechim, bozor, mijozlar va raqamlar, raqobat, jamoa, so'ralgan summa. Uni 3-4 ta tanishga ko'rsatib, savollariga qarab tuzating.",
      ru: 'Достаточно 10–12 слайдов: проблема, решение, рынок, клиенты и цифры, конкуренты, команда, запрашиваемая сумма. Покажите её 3–4 знакомым и доработайте по их вопросам.',
      en: '10–12 slides are enough: problem, solution, market, customers and numbers, competition, team, the ask. Show it to 3–4 people and fix it based on their questions.',
    },
  },
];

export const MAX = QUESTIONS.reduce((s, q) => s + Math.max(...q.options.map((x) => x.pts)), 0);

export const LEVELS = [
  {
    min: 70,
    key: 'ready',
    title: { uz: 'Investorga tayyorsiz', ru: 'Вы готовы к инвестору', en: 'You are investor-ready' },
    text: {
      uz: "Asosiy narsalar joyida. Endi profil to'ldirib, investorlarga o'zingizni ko'rsatish vaqti keldi.",
      ru: 'Основное на месте. Пора заполнить профиль и показать себя инвесторам.',
      en: 'The basics are in place. Time to fill in your profile and get in front of investors.',
    },
  },
  {
    min: 40,
    key: 'half',
    title: { uz: "Yo'lning yarmidasiz", ru: 'Вы на полпути', en: 'You are halfway there' },
    text: {
      uz: "Poydevor bor, lekin investor savol beradigan joylar hali ochiq. Quyidagi 3 qadam ballingizni tez ko'taradi.",
      ru: 'Фундамент есть, но остались места, где инвестор начнёт задавать вопросы. Три шага ниже быстро поднимут ваш балл.',
      en: 'There is a foundation, but gaps remain where investors will ask questions. The 3 steps below will raise your score fast.',
    },
  },
  {
    min: 0,
    key: 'early',
    title: { uz: "Hali erta, lekin yo'l aniq", ru: 'Пока рано, но путь ясен', en: 'Still early, but the path is clear' },
    text: {
      uz: "Investorga borishdan oldin bir necha oy poydevor qurish kerak. Quyidagi 3 qadamdan boshlang va 2-3 oydan keyin testni qayta topshiring.",
      ru: 'Прежде чем идти к инвестору, нужно несколько месяцев строить фундамент. Начните с трёх шагов ниже и пройдите тест снова через 2–3 месяца.',
      en: 'You need a few months of groundwork before approaching investors. Start with the 3 steps below and retake the test in 2–3 months.',
    },
  },
];

export const clampScore = (v) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
};

export const levelOf = (score) => LEVELS.find((l) => score >= l.min);

// answers: { [id]: optionIndex }. Natija: ball va eng past ballli 3 ta mavzu bo'yicha maslahat
export function evaluate(answers) {
  const rows = QUESTIONS.map((q) => {
    const opt = q.options[answers[q.id]];
    const max = Math.max(...q.options.map((x) => x.pts));
    return { q, pts: opt ? opt.pts : 0, gap: max - (opt ? opt.pts : 0) };
  });
  const score = clampScore((rows.reduce((s, r) => s + r.pts, 0) / MAX) * 100);
  const tips = rows.filter((r) => r.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 3).map((r) => r.q);
  return { score, tips };
}

// Brauzerga yuboriladigan, tanlangan tildagi ko'rinish
export function localize(lang) {
  const pick = (x) => x[lang] || x.uz;
  return {
    questions: QUESTIONS.map((q) => ({ id: q.id, topic: pick(q.topic), q: pick(q.q), tip: pick(q.tip), options: q.options.map((x) => pick(x)) })),
    levels: LEVELS.map((l) => ({ min: l.min, key: l.key, title: pick(l.title), text: pick(l.text) })),
  };
}
