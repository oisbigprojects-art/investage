// Yordamchi bot uchun savol-javob bazasi. Hech qanday tashqi xizmat ishlatilmaydi:
// bot shu yerdagi javoblardan eng mosini topib beradi, o'zidan javob to'qimaydi.
//
// keys — foydalanuvchi yozishi mumkin bo'lgan so'zlar (o'zak holida: "profil" "profilni"ga ham mos keladi).
// Har bir auditoriya uchun alohida ro'yxat — startap va investor mavzulari aralashmaydi.

const COMMON = [
  {
    id: 'what',
    keys: {
      uz: ['investage nima', 'qanday ishlay', 'platforma nima', 'sayt nima', 'nima qiladi', 'maqsad'],
      ru: ['что такое investage', 'как работает', 'что за платформа', 'что за сайт', 'зачем'],
      en: ['what is investage', 'how does it work', 'what is this platform', 'what is this site', 'purpose'],
    },
    uz: {
      q: 'Investage nima va qanday ishlaydi?',
      a: "Investage — O'zbekiston startaplari va investorlarini bog'laydigan platforma. Startap o'zini tanishtiradi, investor qiziqsa so'rov yuboradi, ma'lumotni ochish yoki ochmaslikni startapning o'zi hal qiladi.\n\nStartapning nomi, sohasi, bosqichi va bahosi hammaga ochiq. Summa, ulush, jamoa va kontaktlar esa faqat startap ruxsat bergan investorga ko'rinadi.",
    },
    ru: {
      q: 'Что такое Investage и как это работает?',
      a: 'Investage — платформа, которая связывает стартапы и инвесторов Узбекистана. Стартап рассказывает о себе, инвестор отправляет запрос, а решение открывать данные или нет принимает сам стартап.\n\nНазвание, сфера, стадия и оценка стартапа открыты всем. Сумма, доля, команда и контакты видны только инвестору, которому стартап дал доступ.',
    },
    en: {
      q: 'What is Investage and how does it work?',
      a: 'Investage connects startups and investors in Uzbekistan. A startup introduces itself, an interested investor sends a request, and the startup alone decides whether to open its private details.\n\nName, sector, stage and score are public. Funding amount, equity, team and contacts are visible only to investors the startup has approved.',
    },
  },
  {
    id: 'private',
    keys: {
      uz: ['yopiq malumot', 'kim koradi', 'maxfiy', 'summa korinad', 'ulush korinad', 'kontakt korinad'],
      ru: ['закрытые данные', 'кто видит', 'конфиденц', 'видна сумма', 'видна доля', 'видны контакты'],
      en: ['private details', 'who can see', 'confidential', 'see the amount', 'see equity', 'see contacts'],
    },
    uz: {
      q: "Yopiq ma'lumotni kim ko'radi?",
      a: "Yopiq qism — kerakli mablag', ulush foizi, jamoa va kontaktlar. Buni faqat startapning o'zi va u ruxsat bergan investorlar ko'radi.\n\nBoshqa hamma — mehmonlar, ruxsat olmagan investorlar — faqat ochiq tanishtiruvni ko'radi. Startap ruxsatni istalgan payt yopishi mumkin, shunda ma'lumot yana berkiladi.",
    },
    ru: {
      q: 'Кто видит закрытые данные?',
      a: 'Закрытая часть — нужная сумма, доля, команда и контакты. Их видят только сам стартап и инвесторы, которым он открыл доступ.\n\nВсе остальные — гости и инвесторы без доступа — видят только открытое описание. Стартап может закрыть доступ в любой момент, и данные снова скроются.',
    },
    en: {
      q: 'Who can see the private details?',
      a: 'The private part is the funding amount, equity share, team and contacts. Only the startup itself and investors it has approved can see them.\n\nEveryone else — guests and investors without access — sees only the public introduction. The startup can revoke access at any time, and the details are hidden again.',
    },
  },
  {
    id: 'payments',
    keys: {
      uz: ['tolov', 'pul otkaz', 'komissiya', 'narx', 'pullikmi', 'bepulmi', 'qancha tur'],
      ru: ['оплат', 'перевод денег', 'комисси', 'цена', 'платно', 'бесплатно', 'сколько стоит'],
      en: ['payment', 'transfer money', 'commission', 'price', 'paid', 'free', 'how much'],
    },
    uz: {
      q: "To'lovlar qanday amalga oshiriladi?",
      a: "To'lovlar Investage orqali o'tmaydi. Startap va investor o'zaro bevosita hisob-kitob qiladi, platforma hech qanday pul o'tkazmasida vositachi emas va komissiya olmaydi.\n\nSaytdan foydalanish hozircha bepul.",
    },
    ru: {
      q: 'Как происходят платежи?',
      a: 'Платежи не проходят через Investage. Стартап и инвестор рассчитываются напрямую между собой; платформа не является посредником в переводах и не берёт комиссию.\n\nПользование сайтом пока бесплатное.',
    },
    en: {
      q: 'How do payments work?',
      a: 'Payments do not go through Investage. The startup and investor settle directly between themselves; the platform is not an intermediary in any transfer and takes no commission.\n\nUsing the site is free for now.',
    },
  },
  {
    id: 'score',
    keys: {
      uz: ['baho', 'ball', 'reyting', 'tasdiqlangan belgi', 'tasdiq belgisi', 'verified'],
      ru: ['оценка', 'балл', 'рейтинг', 'знак подтверж', 'верифик'],
      en: ['score', 'rating', 'verified badge', 'verification'],
    },
    uz: {
      q: "Baho va tasdiq belgisi nima?",
      a: "Baho — startapning 0 dan 100 gacha bo'lgan ko'rsatkichi. Tasdiq belgisi esa Investage jamoasi tekshirgan startaplarga beriladi.\n\nIkkalasini ham Investage jamoasi qo'yadi; startap o'zi o'zgartira olmaydi.",
    },
    ru: {
      q: 'Что такое оценка и знак подтверждения?',
      a: 'Оценка — показатель стартапа от 0 до 100. Знак подтверждения получают стартапы, проверенные командой Investage.\n\nИ то, и другое выставляет команда Investage; сам стартап это изменить не может.',
    },
    en: {
      q: 'What are the score and the verified badge?',
      a: 'The score is a 0–100 indicator for a startup. The verified badge is given to startups the Investage team has checked.\n\nBoth are set by the Investage team; a startup cannot change them itself.',
    },
  },
  {
    id: 'stages',
    keys: {
      uz: ['bosqich', 'goya', 'mvp', 'daromad bosqich'],
      ru: ['стади', 'иде', 'mvp', 'выручк'],
      en: ['stage', 'idea stage', 'mvp', 'revenue stage'],
    },
    uz: {
      q: 'Startap bosqichlari qanday?',
      a: "Uchta bosqich bor: G'oya (hali mahsulot yo'q), MVP (dastlabki ishlaydigan mahsulot bor) va Daromad (mahsulot daromad keltirmoqda).\n\nBosqichni startap o'z profilida tanlaydi.",
    },
    ru: {
      q: 'Какие бывают стадии стартапа?',
      a: 'Три стадии: Идея (продукта ещё нет), MVP (есть первая рабочая версия) и Выручка (продукт приносит доход).\n\nСтадию стартап выбирает в своём профиле.',
    },
    en: {
      q: 'What startup stages are there?',
      a: 'Three stages: Idea (no product yet), MVP (a first working version exists) and Revenue (the product earns money).\n\nThe startup picks its stage in its own profile.',
    },
  },
  {
    id: 'password',
    keys: {
      uz: ['parol unut', 'parolni tikla', 'parol ozgartir', 'kirolmayap', 'kira olmay'],
      ru: ['забыл пароль', 'восстановить пароль', 'сменить пароль', 'не могу войти'],
      en: ['forgot password', 'reset password', 'change password', 'cannot sign in'],
    },
    uz: {
      q: "Parolni unutdim yoki o'zgartirmoqchiman",
      a: "Parolni unutgan bo'lsangiz: /kirish sahifasidagi «Parolni unutdingizmi?» havolasini bosing, pochtangizga tiklash havolasi keladi.\n\nParolni bilsangiz va almashtirmoqchi bo'lsangiz: /kabinet/sozlamalar sahifasida.",
    },
    ru: {
      q: 'Забыл пароль или хочу его сменить',
      a: 'Если забыли: на странице /kirish нажмите «Parolni unutdingizmi?», на почту придёт ссылка для восстановления.\n\nЕсли помните и хотите сменить: на странице /kabinet/sozlamalar.',
    },
    en: {
      q: 'I forgot my password or want to change it',
      a: 'If you forgot it: on the /kirish page click “Parolni unutdingizmi?” and a reset link will be emailed to you.\n\nIf you know it and want to change it: on the /kabinet/sozlamalar page.',
    },
  },
  {
    id: 'lang-theme',
    keys: {
      uz: ['til ozgartir', 'rus tili', 'ingliz tili', 'qorongi', 'tungi rejim', 'rang'],
      ru: ['сменить язык', 'русский язык', 'английский', 'тёмн', 'темн', 'ночной режим'],
      en: ['change language', 'russian', 'english', 'dark mode', 'night mode', 'theme'],
    },
    uz: {
      q: "Tilni yoki qorong'i rejimni qanday o'zgartiraman?",
      a: "Ikkalasi ham sahifaning yuqori qismida: UZ / RU / EN tugmalari tilni almashtiradi, yonidagi quyosh–oy belgisi yorug' va qorong'i ko'rinishni almashtiradi.\n\nTanlovingiz brauzeringizda eslab qolinadi.",
    },
    ru: {
      q: 'Как сменить язык или включить тёмный режим?',
      a: 'И то, и другое вверху страницы: кнопки UZ / RU / EN меняют язык, значок солнца–луны рядом переключает светлый и тёмный вид.\n\nВыбор запоминается в вашем браузере.',
    },
    en: {
      q: 'How do I change the language or switch to dark mode?',
      a: 'Both are at the top of the page: the UZ / RU / EN buttons change the language, and the sun–moon icon next to them switches between light and dark.\n\nYour choice is remembered in your browser.',
    },
  },
  {
    id: 'contact',
    keys: {
      uz: ['bogla', 'yordam kerak', 'jamoa bilan', 'murojaat', 'shikoyat', 'taklif yoz', 'xatolik'],
      ru: ['связаться', 'нужна помощь', 'с командой', 'обращен', 'жалоб', 'ошибк'],
      en: ['contact', 'need help', 'the team', 'complaint', 'report a bug', 'error'],
    },
    uz: {
      q: 'Jamoa bilan qanday bog‘lanaman?',
      a: "/yordam sahifasidagi forma orqali yozing: savol, xatolik yoki taklif. Javob olish uchun email manzilingizni qoldiring.\n\nXabaringiz to'g'ridan-to'g'ri Investage jamoasiga boradi.",
    },
    ru: {
      q: 'Как связаться с командой?',
      a: 'Напишите через форму на странице /yordam: вопрос, ошибка или предложение. Оставьте email, чтобы получить ответ.\n\nСообщение уходит напрямую команде Investage.',
    },
    en: {
      q: 'How do I contact the team?',
      a: 'Write through the form on the /yordam page: a question, a bug or a suggestion. Leave your email so we can reply.\n\nYour message goes straight to the Investage team.',
    },
  },
];

const GUEST = [
  {
    id: 'roles',
    keys: {
      uz: ['rol', 'startap yoki investor', 'farq', 'qaysi birini tanla', 'kim bolib'],
      ru: ['роль', 'стартап или инвестор', 'отлич', 'разниц', 'что выбрать'],
      en: ['role', 'startup or investor', 'difference', 'which to choose'],
    },
    uz: {
      q: 'Startap va investor roli nimasi bilan farq qiladi?',
      a: "STARTAP o'z loyihasini joylaydi, investorlardan kelgan so'rovlarni ko'radi va kimga ruxsat berishni o'zi hal qiladi.\n\nINVESTOR startaplar katalogini ko'radi, qiziqqaniga so'rov yuboradi va ruxsat olsa yopiq ma'lumotni ko'radi.\n\nRol ro'yxatdan o'tishda tanlanadi.",
    },
    ru: {
      q: 'Чем отличаются роли стартапа и инвестора?',
      a: 'СТАРТАП размещает свой проект, видит запросы от инвесторов и сам решает, кому открыть доступ.\n\nИНВЕСТОР смотрит каталог стартапов, отправляет запрос заинтересовавшему и после одобрения видит закрытые данные.\n\nРоль выбирается при регистрации.',
    },
    en: {
      q: 'How do the startup and investor roles differ?',
      a: 'A STARTUP posts its project, sees incoming requests from investors and decides who gets access.\n\nAn INVESTOR browses the startup catalogue, sends a request to one it likes, and sees the private details once approved.\n\nThe role is chosen when you sign up.',
    },
  },
  {
    id: 'signup',
    keys: {
      uz: ['royxatdan ot', 'ruyxatdan', 'registrat', 'hisob och', 'akkaunt', 'qanday boshlay'],
      ru: ['регистрац', 'зарегистр', 'создать аккаунт', 'как начать'],
      en: ['sign up', 'register', 'create an account', 'how do i start'],
    },
    uz: {
      q: "Qanday ro'yxatdan o'taman?",
      a: "/royxat sahifasiga o'ting, rolni (startap yoki investor) tanlang, ism, email va parolni kiriting.\n\nSo'ng pochtangizga kelgan havola orqali emailni tasdiqlang — shundan keyin kabinetingiz ochiladi.",
    },
    ru: {
      q: 'Как зарегистрироваться?',
      a: 'Перейдите на /royxat, выберите роль (стартап или инвестор), укажите имя, email и пароль.\n\nЗатем подтвердите почту по ссылке из письма — после этого откроется ваш кабинет.',
    },
    en: {
      q: 'How do I sign up?',
      a: 'Go to /royxat, choose your role (startup or investor), and enter your name, email and password.\n\nThen confirm your email through the link we send — after that your cabinet opens.',
    },
  },
  {
    id: 'change-role',
    keys: {
      uz: ['rolni ozgartir', 'rol almash', 'boshqa rol', 'notogri rol'],
      ru: ['сменить роль', 'поменять роль', 'не ту роль'],
      en: ['change role', 'switch role', 'wrong role'],
    },
    uz: {
      q: "Rolni keyinchalik o'zgartira olamanmi?",
      a: "Rolni o'zingiz almashtira olmaysiz — u ro'yxatdan o'tishda tanlanadi.\n\nNoto'g'ri rol tanlab qo'ygan bo'lsangiz, /yordam sahifasi orqali jamoaga yozing, ular yordam beradi.",
    },
    ru: {
      q: 'Могу ли я потом сменить роль?',
      a: 'Самостоятельно роль сменить нельзя — она выбирается при регистрации.\n\nЕсли выбрали не ту роль, напишите команде через страницу /yordam, вам помогут.',
    },
    en: {
      q: 'Can I change my role later?',
      a: 'You cannot change the role yourself — it is chosen at sign-up.\n\nIf you picked the wrong one, write to the team through the /yordam page and they will help.',
    },
  },
  {
    id: 'guest-can',
    keys: {
      uz: ['royxatdan otmasdan', 'mehmon', 'kirmasdan kora', 'startaplarni kor'],
      ru: ['без регистрации', 'гость', 'посмотреть без входа', 'посмотреть стартапы'],
      en: ['without signing up', 'guest', 'browse without an account', 'see startups'],
    },
    uz: {
      q: "Ro'yxatdan o'tmasdan nima ko'ra olaman?",
      a: "Startaplar katalogini (/startaplar) va har bir startapning ochiq tanishtiruvini: nomi, sohasi, bosqichi, qisqa tavsifi, bahosi.\n\nYopiq ma'lumot, investorlar ro'yxati va so'rov yuborish uchun ro'yxatdan o'tish kerak.",
    },
    ru: {
      q: 'Что можно посмотреть без регистрации?',
      a: 'Каталог стартапов (/startaplar) и открытое описание каждого: название, сферу, стадию, краткое описание, оценку.\n\nДля закрытых данных, списка инвесторов и отправки запросов нужна регистрация.',
    },
    en: {
      q: 'What can I see without an account?',
      a: 'The startup catalogue (/startaplar) and each startup’s public introduction: name, sector, stage, short description and score.\n\nPrivate details, the investor list and sending requests all require an account.',
    },
  },
  {
    id: 'guest-privacy',
    keys: {
      uz: ['malumotim xavfsiz', 'maxfiylik siyosat', 'shartlar', 'malumot saqla'],
      ru: ['данные в безопасности', 'политика конфиденц', 'условия использ', 'хранение данных'],
      en: ['is my data safe', 'privacy policy', 'terms of use', 'data storage'],
    },
    uz: {
      q: "Ma'lumotlarim xavfsizmi?",
      a: "Startapning yopiq qismi faqat siz ruxsat bergan odamga ochiladi — buni ma'lumotlar bazasining o'zi nazorat qiladi, nafaqat sayt ko'rinishi.\n\nBatafsil: /maxfiylik (maxfiylik siyosati) va /shartlar (foydalanish shartlari).",
    },
    ru: {
      q: 'Мои данные в безопасности?',
      a: 'Закрытая часть стартапа открывается только тем, кому вы дали доступ — это контролирует сама база данных, а не только внешний вид сайта.\n\nПодробнее: /maxfiylik (политика конфиденциальности) и /shartlar (условия использования).',
    },
    en: {
      q: 'Is my data safe?',
      a: 'A startup’s private section opens only to those it has approved — this is enforced by the database itself, not just by the page you see.\n\nMore detail: /maxfiylik (privacy policy) and /shartlar (terms of use).',
    },
  },
];

const STARTUP = [
  {
    id: 's-profile',
    keys: {
      uz: ['profil told', 'profilni tahrir', 'malumot kirit', 'tavsif yoz', 'profilim'],
      ru: ['заполнить профиль', 'редактировать профиль', 'ввести данные', 'описание'],
      en: ['fill in profile', 'edit profile', 'enter details', 'description'],
    },
    uz: {
      q: 'Profilni qanday to‘ldiraman?',
      a: "/kabinet/startap/profil sahifasida. U ikki qismdan iborat:\n\nOchiq qism (hammaga ko'rinadi): nom, soha, bosqich, qisqa tavsif, logotip.\nYopiq qism (faqat ruxsat berganingizga): kerakli mablag', ulush foizi, jamoa, kontaktlar.\n\nIkkalasini ham to'ldirgan startap investorlarda ko'proq ishonch uyg'otadi.",
    },
    ru: {
      q: 'Как заполнить профиль?',
      a: 'На странице /kabinet/startap/profil. Он состоит из двух частей:\n\nОткрытая (видна всем): название, сфера, стадия, краткое описание, логотип.\nЗакрытая (только тем, кому вы дали доступ): нужная сумма, доля, команда, контакты.\n\nЗаполненные обе части вызывают у инвесторов больше доверия.',
    },
    en: {
      q: 'How do I fill in my profile?',
      a: 'On the /kabinet/startap/profil page. It has two parts:\n\nPublic (visible to everyone): name, sector, stage, short description, logo.\nPrivate (only for those you approve): funding amount, equity share, team, contacts.\n\nFilling in both earns more trust from investors.',
    },
  },
  {
    id: 's-requests',
    keys: {
      uz: ['sorov keldi', 'sorovni tasdiq', 'rad et', 'ruxsat ber', 'kim sorov'],
      ru: ['пришёл запрос', 'одобрить запрос', 'отклонить', 'дать доступ'],
      en: ['incoming request', 'approve request', 'reject', 'grant access'],
    },
    uz: {
      q: "Investor so'rovini qanday tasdiqlayman?",
      a: "/kabinet/startap/sorovlar sahifasida barcha so'rovlar turadi. Har birida investorning ismi, kompaniyasi va xabari ko'rinadi — avval uning profilini ko'rib chiqing.\n\nTasdiqlasangiz, yopiq ma'lumotingiz va hujjatlaringiz faqat o'sha investorga ochiladi va suhbat boshlanadi. Rad etsangiz, hech narsa ochilmaydi.",
    },
    ru: {
      q: 'Как одобрить запрос инвестора?',
      a: 'Все запросы — на странице /kabinet/startap/sorovlar. В каждом видно имя инвестора, компанию и сообщение — сначала посмотрите его профиль.\n\nЕсли одобрите, ваши закрытые данные и документы откроются только этому инвестору и начнётся диалог. Если отклоните, не откроется ничего.',
    },
    en: {
      q: 'How do I approve an investor’s request?',
      a: 'All requests are on the /kabinet/startap/sorovlar page. Each shows the investor’s name, company and message — look at their profile first.\n\nIf you approve, your private details and documents open to that investor only, and a conversation starts. If you reject, nothing is opened.',
    },
  },
  {
    id: 's-revoke',
    keys: {
      uz: ['ruxsatni yop', 'ruxsatni bekor', 'orqaga qaytar', 'yopib qoy'],
      ru: ['закрыть доступ', 'отозвать доступ', 'отменить доступ'],
      en: ['revoke access', 'close access', 'take back access'],
    },
    uz: {
      q: 'Berilgan ruxsatni qanday yopaman?',
      a: "/kabinet/startap/sorovlar sahifasida «Ruxsat berilgan» ro'yxatidan kerakli investorni toping va «Ruxsatni yopish» tugmasini bosing.\n\nShundan keyin u yopiq ma'lumotingizni ham, hujjatlaringizni ham ko'rmaydi va yangi xabar yoza olmaydi. Buni istalgan payt qila olasiz.",
    },
    ru: {
      q: 'Как закрыть выданный доступ?',
      a: 'На странице /kabinet/startap/sorovlar в списке «Ruxsat berilgan» найдите нужного инвестора и нажмите «Ruxsatni yopish».\n\nПосле этого он не увидит ни закрытых данных, ни документов и не сможет писать новые сообщения. Сделать это можно в любой момент.',
    },
    en: {
      q: 'How do I revoke access I granted?',
      a: 'On the /kabinet/startap/sorovlar page, find the investor under “Ruxsat berilgan” and press “Ruxsatni yopish”.\n\nAfter that they see neither your private details nor your documents, and cannot send new messages. You can do this at any time.',
    },
  },
  {
    id: 's-docs',
    keys: {
      uz: ['hujjat yukla', 'pitch deck', 'fayl yukla', 'prezentatsiya', 'moliyaviy model'],
      ru: ['загрузить документ', 'питч', 'загрузить файл', 'презентац', 'финансовая модель'],
      en: ['upload document', 'pitch deck', 'upload file', 'presentation', 'financial model'],
    },
    uz: {
      q: 'Hujjat (pitch deck) qanday yuklayman?',
      a: "/kabinet/startap/hujjatlar sahifasida. Faylni tanlang, turini belgilang (pitch deck, moliyaviy model, huquqiy hujjat yoki boshqa) va nom bering.\n\nPDF, PowerPoint, Excel, Word va rasm qabul qilinadi. Har bir fayl 10 MB gacha, jami 15 tagacha hujjat.",
    },
    ru: {
      q: 'Как загрузить документ (питч-дек)?',
      a: 'На странице /kabinet/startap/hujjatlar. Выберите файл, укажите тип (питч-дек, финансовая модель, юридический документ или другое) и название.\n\nПринимаются PDF, PowerPoint, Excel, Word и изображения. До 10 МБ на файл, всего до 15 документов.',
    },
    en: {
      q: 'How do I upload a document (pitch deck)?',
      a: 'On the /kabinet/startap/hujjatlar page. Pick the file, choose its type (pitch deck, financial model, legal document or other) and give it a title.\n\nPDF, PowerPoint, Excel, Word and images are accepted. Up to 10 MB per file, 15 documents in total.',
    },
  },
  {
    id: 's-docs-who',
    keys: {
      uz: ['hujjatni kim kor', 'deck kim kor', 'fayl xavfsiz', 'hujjat maxfiy'],
      ru: ['кто видит документ', 'кто видит питч', 'файл безопас', 'документ конфиденц'],
      en: ['who sees my documents', 'who sees the deck', 'are files safe'],
    },
    uz: {
      q: "Hujjatlarimni kim ko'ra oladi?",
      a: "Faqat siz va yopiq ma'lumotingizga ruxsat bergan investorlar. Fayllar yopiq omborda saqlanadi, ularga havola vaqtinchalik beriladi.\n\nRuxsatni yopsangiz, o'sha investor uchun havola ham ishlamay qoladi.",
    },
    ru: {
      q: 'Кто может увидеть мои документы?',
      a: 'Только вы и инвесторы, которым вы открыли доступ к закрытым данным. Файлы хранятся в закрытом хранилище, ссылки на них выдаются временные.\n\nЕсли закрыть доступ, ссылка для этого инвестора перестанет работать.',
    },
    en: {
      q: 'Who can see my documents?',
      a: 'Only you and the investors you granted access to your private details. Files are kept in private storage and links to them are temporary.\n\nIf you revoke access, the link stops working for that investor.',
    },
  },
  {
    id: 's-offer',
    keys: {
      uz: ['taklif yubor', 'investorga yoz', 'ozim murojaat', 'investor top'],
      ru: ['отправить предложение', 'написать инвестору', 'самому обратиться', 'найти инвестора'],
      en: ['send an offer', 'write to an investor', 'reach out first', 'find an investor'],
    },
    uz: {
      q: "Investorga o'zim taklif yubora olamanmi?",
      a: "Ha. /investorlar ro'yxatidan investorni oching va «Taklif yuborish» formasini to'ldiring.\n\nTaklif yuborilishi bilan yopiq ma'lumotingiz va hujjatlaringiz o'sha investorga darhol ochiladi va suhbat boshlanadi. Investor taklifni rad etishi mumkin; siz esa ruxsatni istalgan payt yopa olasiz. Kuniga 20 tagacha taklif yuborish mumkin.",
    },
    ru: {
      q: 'Могу ли я сам написать инвестору?',
      a: 'Да. Откройте инвестора из списка /investorlar и заполните форму «Taklif yuborish».\n\nКак только предложение отправлено, ваши закрытые данные и документы сразу открываются этому инвестору и начинается диалог. Инвестор может отклонить предложение, а вы можете закрыть доступ в любой момент. В день можно отправить до 20 предложений.',
    },
    en: {
      q: 'Can I reach out to an investor myself?',
      a: 'Yes. Open an investor from the /investorlar list and fill in the “Taklif yuborish” form.\n\nAs soon as the offer is sent, your private details and documents open to that investor and a conversation starts. The investor can decline; you can revoke access at any time. Up to 20 offers per day.',
    },
  },
  {
    id: 's-chat',
    keys: {
      uz: ['xabar yoz', 'chat', 'suhbat', 'yozish', 'gaplash', 'aloqa boglan'],
      ru: ['написать сообщение', 'чат', 'переписк', 'диалог'],
      en: ['send a message', 'chat', 'conversation', 'messaging'],
    },
    uz: {
      q: 'Investor bilan qanday yozishaman?',
      a: "/kabinet/xabarlar sahifasida. Suhbat ruxsat ochilgandan keyin paydo bo'ladi: siz so'rovni tasdiqlasangiz yoki o'zingiz taklif yuborsangiz.\n\nRuxsat yopilsa, eski yozishmalar qoladi, lekin yangi xabar yozib bo'lmaydi.",
    },
    ru: {
      q: 'Как переписываться с инвестором?',
      a: 'На странице /kabinet/xabarlar. Диалог появляется после открытия доступа: когда вы одобрили запрос или сами отправили предложение.\n\nЕсли доступ закрыть, прежняя переписка сохранится, но новые сообщения писать нельзя.',
    },
    en: {
      q: 'How do I message an investor?',
      a: 'On the /kabinet/xabarlar page. A conversation appears once access is open: when you approve a request or send an offer yourself.\n\nIf access is revoked, past messages stay but no new ones can be sent.',
    },
  },
  {
    id: 's-hide',
    keys: {
      uz: ['yashir', 'katalogdan olib', 'vaqtincha ochir', 'korinmasin'],
      ru: ['скрыть', 'убрать из каталога', 'временно отключ'],
      en: ['hide my startup', 'remove from catalogue', 'temporarily hide'],
    },
    uz: {
      q: 'Startapimni vaqtincha yashira olamanmi?',
      a: "Ha, /kabinet/startap/profil sahifasidagi yashirish sozlamasi orqali. Shunda startapingiz katalogda ko'rinmaydi.\n\nAvval ruxsat bergan investorlar bilan aloqangiz saqlanib qoladi.",
    },
    ru: {
      q: 'Можно ли временно скрыть мой стартап?',
      a: 'Да, через настройку скрытия на странице /kabinet/startap/profil. Тогда стартап не будет виден в каталоге.\n\nСвязь с инвесторами, которым вы уже дали доступ, сохранится.',
    },
    en: {
      q: 'Can I hide my startup temporarily?',
      a: 'Yes, through the hide setting on the /kabinet/startap/profil page. Your startup then no longer appears in the catalogue.\n\nYour existing connections with approved investors stay in place.',
    },
  },
  {
    id: 's-telegram',
    keys: {
      uz: ['telegram', 'xabarnoma', 'bildirishnoma', 'ogohlantir'],
      ru: ['телеграм', 'уведомлен', 'оповещен'],
      en: ['telegram', 'notification', 'alerts'],
    },
    uz: {
      q: 'Telegram xabarnomalarini qanday ulayman?',
      a: "/kabinet/sozlamalar sahifasida «Telegram xabarnomalari» bo'limidagi ulash tugmasini bosing — bot ochiladi va hisobingizga bog'lanadi.\n\nShundan keyin yangi so'rov va xabarlar Telegram'ga keladi. Istalgan payt o'chirib qo'yish mumkin.",
    },
    ru: {
      q: 'Как подключить уведомления в Telegram?',
      a: 'На странице /kabinet/sozlamalar в разделе «Telegram xabarnomalari» нажмите кнопку подключения — откроется бот и привяжется к вашему аккаунту.\n\nПосле этого новые запросы и сообщения будут приходить в Telegram. Отключить можно в любой момент.',
    },
    en: {
      q: 'How do I turn on Telegram notifications?',
      a: 'On the /kabinet/sozlamalar page, press the connect button in the “Telegram xabarnomalari” section — the bot opens and links to your account.\n\nAfter that, new requests and messages arrive in Telegram. You can turn it off at any time.',
    },
  },
  {
    id: 's-score',
    keys: {
      uz: ['bahoni oshir', 'tasdiq olish', 'verified qanday', 'ballni kotar'],
      ru: ['поднять оценку', 'получить подтверж', 'как верифиц'],
      en: ['improve my score', 'get verified', 'how to be verified'],
    },
    uz: {
      q: "Bahoni oshirish yoki tasdiq belgisini olish uchun nima qilay?",
      a: "Baho va tasdiq belgisini Investage jamoasi qo'yadi, startap o'zi o'zgartira olmaydi.\n\nTo'liq to'ldirilgan profil, aniq tavsif va yuklangan hujjatlar jamoaga startapingizni baholashda yordam beradi. Savol bo'lsa /yordam orqali yozing.",
    },
    ru: {
      q: 'Что сделать, чтобы поднять оценку или получить знак подтверждения?',
      a: 'Оценку и знак подтверждения выставляет команда Investage, сам стартап их изменить не может.\n\nПолностью заполненный профиль, понятное описание и загруженные документы помогают команде оценить ваш стартап. С вопросами пишите через /yordam.',
    },
    en: {
      q: 'What can I do to raise my score or get verified?',
      a: 'The score and the verified badge are set by the Investage team; a startup cannot change them itself.\n\nA fully completed profile, a clear description and uploaded documents help the team assess your startup. For questions, write via /yordam.',
    },
  },
];

const INVESTOR = [
  {
    id: 'i-request',
    keys: {
      uz: ['sorov yubor', 'kirish sorovi', 'ruxsat sora', 'qanday kora'],
      ru: ['отправить запрос', 'запросить доступ', 'как увидеть'],
      en: ['send a request', 'request access', 'how do i see'],
    },
    uz: {
      q: "Startapga qanday so'rov yuboraman?",
      a: "/startaplar katalogidan qiziqqan startapni oching va «Kirish so'rovini yuborish» tugmasini bosing. Qisqa xabar yozing — o'zingizni tanishtirsangiz, tasdiqlanish ehtimoli ortadi.\n\nSo'ngra startapning javobini kutasiz. Qaror faqat startapga tegishli.",
    },
    ru: {
      q: 'Как отправить запрос стартапу?',
      a: 'Откройте интересующий стартап из каталога /startaplar и нажмите «Kirish so‘rovini yuborish». Напишите короткое сообщение — если представитесь, шансов на одобрение больше.\n\nДальше ждёте ответа стартапа. Решение принимает только он.',
    },
    en: {
      q: 'How do I request access to a startup?',
      a: 'Open a startup you like from the /startaplar catalogue and press “Kirish so‘rovini yuborish”. Write a short message — introducing yourself improves your chances.\n\nThen you wait for the startup’s answer. The decision is theirs alone.',
    },
  },
  {
    id: 'i-approved',
    keys: {
      uz: ['ruxsat olsam', 'tasdiqlangandan keyin', 'nima korinad', 'ochilsa'],
      ru: ['после одобрения', 'что увижу', 'когда откроют'],
      en: ['once approved', 'what will i see', 'after access'],
    },
    uz: {
      q: "Ruxsat olsam nima ko'rinadi?",
      a: "Startapning yopiq qismi: kerakli mablag', ulush foizi, jamoa haqida ma'lumot va bog'lanish uchun kontaktlar. Shuningdek yuklangan hujjatlar — pitch deck, moliyaviy model va boshqalar.\n\nShu bilan birga suhbat ochiladi: /kabinet/xabarlar orqali to'g'ridan-to'g'ri yozishingiz mumkin.",
    },
    ru: {
      q: 'Что я увижу после одобрения?',
      a: 'Закрытую часть стартапа: нужную сумму, долю, информацию о команде и контакты. А также загруженные документы — питч-дек, финансовую модель и прочее.\n\nОдновременно открывается диалог: писать можно напрямую через /kabinet/xabarlar.',
    },
    en: {
      q: 'What do I see once I am approved?',
      a: 'The startup’s private section: funding amount, equity share, team information and contacts. Plus any uploaded documents — pitch deck, financial model and so on.\n\nA conversation opens at the same time: you can write directly via /kabinet/xabarlar.',
    },
  },
  {
    id: 'i-rejected',
    keys: {
      uz: ['rad etildi', 'tasdiqlamadi', 'javob bermay', 'qayta yubor', 'kutilmoqda'],
      ru: ['отклонил', 'не одобрил', 'не отвечает', 'отправить снова', 'в ожидании'],
      en: ['rejected', 'declined', 'no answer', 'send again', 'pending'],
    },
    uz: {
      q: "So'rovim rad etilsa yoki javobsiz qolsa nima qilay?",
      a: "Rad etilgan bo'lsa, o'sha startapga keyinroq yangi so'rov yubora olasiz — xabaringizni aniqroq yozib ko'ring.\n\nJavob kutilayotgan bo'lsa, so'rov holati /kabinet/investor/sorovlar sahifasida ko'rinadi. Startap javob berishga majbur emas.",
    },
    ru: {
      q: 'Что делать, если запрос отклонили или не ответили?',
      a: 'Если отклонили, позже можно отправить новый запрос этому же стартапу — попробуйте написать сообщение конкретнее.\n\nЕсли ответ ещё не пришёл, статус запроса виден на странице /kabinet/investor/sorovlar. Стартап не обязан отвечать.',
    },
    en: {
      q: 'What if my request is rejected or unanswered?',
      a: 'If it was rejected, you can send a new request to the same startup later — try writing a more specific message.\n\nIf you are still waiting, the status is on the /kabinet/investor/sorovlar page. A startup is not obliged to reply.',
    },
  },
  {
    id: 'i-saved',
    keys: {
      uz: ['saqla', 'belgilab qoy', 'keyin korish', 'saqlangan'],
      ru: ['сохранить', 'в избранное', 'посмотреть позже', 'сохранённые'],
      en: ['save a startup', 'bookmark', 'look at later', 'saved'],
    },
    uz: {
      q: 'Startapni qanday saqlab qo‘yaman?',
      a: "Startap sahifasidagi yoki ro'yxatdagi saqlash belgisini bosing. Saqlanganlar /kabinet/investor/saqlangan sahifasida to'planadi.\n\nBu startapga bildirilmaydi va ruxsat bermaydi — faqat sizning shaxsiy ro'yxatingiz.",
    },
    ru: {
      q: 'Как сохранить стартап?',
      a: 'Нажмите значок сохранения на странице стартапа или в списке. Сохранённые собираются на /kabinet/investor/saqlangan.\n\nСтартап об этом не узнаёт и доступа это не даёт — это просто ваш личный список.',
    },
    en: {
      q: 'How do I save a startup?',
      a: 'Press the save icon on the startup’s page or in the list. Saved ones collect on /kabinet/investor/saqlangan.\n\nThe startup is not notified and this grants no access — it is simply your own private list.',
    },
  },
  {
    id: 'i-profile',
    keys: {
      uz: ['profilimni told', 'investor profil', 'ozim haqimda', 'nega profil'],
      ru: ['заполнить свой профиль', 'профиль инвестора', 'о себе', 'зачем профиль'],
      en: ['fill in my profile', 'investor profile', 'about me', 'why a profile'],
    },
    uz: {
      q: 'Nega o‘z profilimni to‘ldirishim kerak?',
      a: "Startap so'rovingizni ko'rganda avval sizning profilingizni ochadi. Kompaniya, qiziqish sohalari, investitsiya oralig'i, tajriba va portfel ko'rsatilgan bo'lsa, tasdiqlash ehtimoli ancha yuqori.\n\nProfil: /kabinet/investor/profil.",
    },
    ru: {
      q: 'Зачем заполнять свой профиль?',
      a: 'Увидев ваш запрос, стартап первым делом открывает ваш профиль. Если указаны компания, сферы интересов, диапазон инвестиций, опыт и портфель, шансы на одобрение заметно выше.\n\nПрофиль: /kabinet/investor/profil.',
    },
    en: {
      q: 'Why should I fill in my profile?',
      a: 'When a startup sees your request, the first thing it opens is your profile. With your company, areas of interest, investment range, experience and portfolio filled in, approval is far more likely.\n\nProfile: /kabinet/investor/profil.',
    },
  },
  {
    id: 'i-offer',
    keys: {
      uz: ['startap taklif yubor', 'menga taklif', 'taklifni rad', 'taklif keldi'],
      ru: ['стартап прислал предложение', 'мне предложение', 'отклонить предложение'],
      en: ['startup sent me an offer', 'received an offer', 'decline an offer'],
    },
    uz: {
      q: 'Startap menga taklif yuborsa nima bo‘ladi?',
      a: "Startap o'zi taklif yuborsa, uning yopiq ma'lumotlari va hujjatlari sizga darhol ochiladi va suhbat boshlanadi — so'rov yuborishingiz shart emas.\n\nQiziqmasangiz, /kabinet/investor/sorovlar sahifasida taklifni rad etishingiz mumkin, shunda ma'lumot yana berkiladi.",
    },
    ru: {
      q: 'Что будет, если стартап сам пришлёт предложение?',
      a: 'Если стартап отправит предложение, его закрытые данные и документы сразу откроются вам и начнётся диалог — запрос отправлять не нужно.\n\nЕсли неинтересно, предложение можно отклонить на странице /kabinet/investor/sorovlar, и данные снова скроются.',
    },
    en: {
      q: 'What happens if a startup sends me an offer?',
      a: 'If a startup sends you an offer, its private details and documents open to you immediately and a conversation starts — no request needed from you.\n\nIf you are not interested, you can decline it on the /kabinet/investor/sorovlar page, and the details are hidden again.',
    },
  },
  {
    id: 'i-chat',
    keys: {
      uz: ['xabar yoz', 'chat', 'suhbat', 'yozish', 'bogla startap'],
      ru: ['написать сообщение', 'чат', 'переписк', 'диалог', 'связаться со стартап'],
      en: ['send a message', 'chat', 'conversation', 'contact the startup'],
    },
    uz: {
      q: 'Startap bilan qanday yozishaman?',
      a: "/kabinet/xabarlar sahifasida. Suhbat ruxsat ochilgandan keyin paydo bo'ladi: startap so'rovingizni tasdiqlasa yoki o'zi taklif yuborsa.\n\nRuxsat yopilsa, eski yozishmalar qoladi, lekin yangi xabar yozib bo'lmaydi.",
    },
    ru: {
      q: 'Как переписываться со стартапом?',
      a: 'На странице /kabinet/xabarlar. Диалог появляется после открытия доступа: когда стартап одобрил ваш запрос или сам прислал предложение.\n\nЕсли доступ закроют, прежняя переписка сохранится, но новые сообщения писать нельзя.',
    },
    en: {
      q: 'How do I message a startup?',
      a: 'On the /kabinet/xabarlar page. A conversation appears once access is open: when the startup approves your request or sends you an offer.\n\nIf access is revoked, past messages stay but no new ones can be sent.',
    },
  },
  {
    id: 'i-search',
    keys: {
      uz: ['qidir', 'filtr', 'soha boyicha', 'saralash', 'katalog'],
      ru: ['поиск', 'фильтр', 'по сфере', 'сортировк', 'каталог'],
      en: ['search', 'filter', 'by sector', 'sorting', 'catalogue'],
    },
    uz: {
      q: 'Startaplarni qanday qidiraman?',
      a: "/startaplar sahifasida qidiruv maydoni va soha bo'yicha filtrlar bor. Yuqoridagi qidiruv qatoridan ham startap nomi bo'yicha qidirish mumkin.\n\nHar bir kartada soha, bosqich, baho va tasdiq belgisi ko'rinadi.",
    },
    ru: {
      q: 'Как искать стартапы?',
      a: 'На странице /startaplar есть поле поиска и фильтры по сферам. Искать по названию можно и через строку поиска вверху.\n\nНа каждой карточке видны сфера, стадия, оценка и знак подтверждения.',
    },
    en: {
      q: 'How do I search for startups?',
      a: 'The /startaplar page has a search field and sector filters. You can also search by name from the search bar at the top.\n\nEach card shows the sector, stage, score and verified badge.',
    },
  },
  {
    id: 'i-telegram',
    keys: {
      uz: ['telegram', 'xabarnoma', 'bildirishnoma', 'ogohlantir'],
      ru: ['телеграм', 'уведомлен', 'оповещен'],
      en: ['telegram', 'notification', 'alerts'],
    },
    uz: {
      q: 'Telegram xabarnomalarini qanday ulayman?',
      a: "/kabinet/sozlamalar sahifasida «Telegram xabarnomalari» bo'limidagi ulash tugmasini bosing — bot ochiladi va hisobingizga bog'lanadi.\n\nShundan keyin startap ruxsat berganda, taklif yuborganda yoki yozganda Telegram'ga xabar keladi.",
    },
    ru: {
      q: 'Как подключить уведомления в Telegram?',
      a: 'На странице /kabinet/sozlamalar в разделе «Telegram xabarnomalari» нажмите кнопку подключения — откроется бот и привяжется к вашему аккаунту.\n\nПосле этого уведомления будут приходить, когда стартап откроет доступ, пришлёт предложение или напишет.',
    },
    en: {
      q: 'How do I turn on Telegram notifications?',
      a: 'On the /kabinet/sozlamalar page, press the connect button in the “Telegram xabarnomalari” section — the bot opens and links to your account.\n\nAfter that you get a Telegram alert when a startup grants access, sends an offer or writes to you.',
    },
  },
  {
    id: 'i-advice',
    keys: {
      uz: ['qaysi startap', 'maslahat ber', 'qaysiga sarmoya', 'tavsiya qil', 'foydalimi'],
      ru: ['какой стартап', 'посоветуй', 'куда вложить', 'рекоменд', 'выгодно ли'],
      en: ['which startup', 'advise me', 'where to invest', 'recommend', 'is it worth it'],
    },
    uz: {
      q: 'Qaysi startapga sarmoya kiritganim yaxshi?',
      a: "Bunga men javob bera olmayman — bu moliyaviy maslahat bo'ladi.\n\nPlatforma sizga ma'lumot yetkazadi: profil, hujjatlar va startap bilan bevosita suhbat. Qaror esa sizning va maslahatchilaringizning ishi.",
    },
    ru: {
      q: 'В какой стартап лучше вложиться?',
      a: 'На это я ответить не могу — это была бы финансовая консультация.\n\nПлатформа даёт вам информацию: профиль, документы и прямой диалог со стартапом. Решение — за вами и вашими консультантами.',
    },
    en: {
      q: 'Which startup should I invest in?',
      a: 'I cannot answer that — it would be financial advice.\n\nThe platform gives you the information: the profile, the documents and a direct conversation with the startup. The decision is yours and your advisers’.',
    },
  },
];

const BY_AUDIENCE = { guest: [...GUEST, ...COMMON], startup: [...STARTUP, ...COMMON], investor: [...INVESTOR, ...COMMON] };

// Mijozga faqat kerakli auditoriya va til bo'yicha ro'yxat yuboriladi
export function faqFor(audience, lang) {
  const own = { guest: GUEST, startup: STARTUP, investor: INVESTOR }[audience] || GUEST;
  const list = BY_AUDIENCE[audience] || BY_AUDIENCE.guest;
  return list.map((e) => ({
    id: e.id,
    q: (e[lang] || e.uz).q,
    a: (e[lang] || e.uz).a,
    // Rolga xos javob umumiy javobdan ustun turadi
    own: own.includes(e),
    keys: [...(e.keys[lang] || []), ...(lang === 'uz' ? [] : e.keys.uz || [])],
  }));
}

// Suhbat boshida ko'rsatiladigan savollar (har auditoriya uchun birinchi uchtasi)
export const STARTERS = { guest: ['what', 'roles', 'signup'], startup: ['s-profile', 's-requests', 's-offer'], investor: ['i-request', 'i-approved', 'i-profile'] };
