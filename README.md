# Investage — kirish so'rovi va rollar (1-bosqich)

Next.js 15 + Supabase + Netlify. Hammasi bepul tariflarda ishlaydi.

## Hozirgi holat

| Nima | Qayerda |
|---|---|
| Jonli sayt | https://investage-j3av.netlify.app |
| Kod | https://github.com/oisbigprojects-art/investage (`main` ga push → sayt avtomatik yangilanadi) |
| Baza | Supabase loyihasi `investage` (Frankfurt, bepul), ref `fuklumjbymmkaflzndxp` |
| Hosting | Netlify loyihasi `investage-j3av` (bepul) |

**Email tasdiqlash vaqtincha o'chiq.** Supabase'ning bepul email xizmati faqat jamoa a'zolariga xat yuboradi. Ommaga ochishdan oldin alohida email xizmati (SMTP, masalan Resend) ulanib, Authentication → Sign In / Providers → "Confirm email" qayta yoqilishi kerak. Shunda Authentication → URL Configuration → Site URL ga sayt manzilini yozing.

## Nima bor

| Sahifa | Kim ko'radi | Nima qiladi |
|---|---|---|
| `/` | Hamma | Bosh sahifa, "Startapman / Investorman" tanlovi, yangi startaplar |
| `/startaplar` | Hamma | Startaplar ro'yxati (faqat ochiq qism), bosqich bo'yicha filtr |
| `/startaplar/[id]` | Hamma | Ochiq teaser + yopiq qism (qulf yoki ochilgan ma'lumot) |
| `/royxat`, `/kirish` | Mehmon | Ro'yxatdan o'tish (rol tanlanadi, keyin o'zgarmaydi), kirish |
| `/kabinet/startap` | Faqat startap | Profil (ochiq + yopiq qism), so'rovlarni tasdiqlash / rad etish / ruxsatni yopish |
| `/kabinet/investor` | Faqat investor | Yuborilgan so'rovlar va ularning holati, ochilgan startaplar |

**Ochiq qism (teaser):** nomi, soha, qisqa tavsif, bosqich, scoring bali, "Tasdiqlangan" belgisi.
**Yopiq qism:** summa, ulush %, jamoa, kontaktlar (email, telefon, Telegram) + Mirkomil uchun namunaviy maydonlar.

**So'rov holatlari:** `pending` (kutilmoqda) → `approved` (ruxsat) yoki `rejected` (rad). `approved` → `revoked` (startap yopdi). Rad etilgan yoki yopilgan bo'lsa, investor qayta so'rov yubora oladi.

**Xavfsizlik bazada:** yopiq ma'lumotlar Supabase RLS orqali himoyalangan — kod xato qilsa ham, ruxsatsiz investor ularni API orqali ham ololmaydi. Startap o'z bahosi (score) va tasdiq belgisini o'zgartira olmaydi.

---

## Noldan o'rnatish (boshqa hisobda qayta qurish kerak bo'lsa)

### 1. Supabase
1. [supabase.com](https://supabase.com) → **New project** (bepul tarif).
2. Chap menyu → **SQL Editor** → `supabase/schema.sql` faylini to'liq nusxalab qo'ying → **Run**.
3. **Authentication → Sign In / Providers → Email**: sinov paytida **"Confirm email"** ni o'chirib qo'ying (aks holda har bir test akkaunt uchun email tasdiqlash kerak bo'ladi).
4. **Project Settings → API** dan `Project URL` va `anon public` kalitni oling.

### 2. Kompyuterda ishga tushirish
```bash
npm install
cp .env.example .env.local     # ichiga URL va kalitni yozing
npm run dev                    # http://localhost:3000
```

### 3. Vercel'ga chiqarish
1. Loyihani GitHub'ga yuklang.
2. [vercel.com](https://vercel.com) → **Add New → Project** → repozitoriyni tanlang.
3. **Environment Variables** ga `NEXT_PUBLIC_SUPABASE_URL` va `NEXT_PUBLIC_SUPABASE_ANON_KEY` ni qo'shing → **Deploy**.
4. Supabase → **Authentication → URL Configuration → Site URL** ga Vercel manzilini yozing.
5. Keyin `investage.uz` domenini Vercel → **Settings → Domains** orqali ulash mumkin (sayt.uz'da DNS yozuvlarini o'zgartirasiz).

---

## Sinab ko'rish ssenariysi
1. Oddiy brauzerda **startap** akkaunt oching → kabinetda profilni to'ldiring.
2. Inkognito oynada **investor** akkaunt oching → `/startaplar` → startapni oching → yopiq qism qulflangan → "Kirish so'rovini yuborish".
3. Startap oynasida kabinetni yangilang → so'rov ko'rinadi → **Tasdiqlash**.
4. Investor oynasida startap sahifasini yangilang → summa, ulush, kontaktlar ochildi.
5. Startap **Ruxsatni yopish** ni bossa → investorda yana qulf, qayta so'rov tugmasi chiqadi.

## Scoring va "Tasdiqlangan" belgisini qo'yish
Hozircha admin panel yo'q: Supabase → **Table Editor → startups** → kerakli qatorda `score` (0–100) va `verified` ni qo'lda o'zgartiring.

## Keyingi o'zgarishlar qayerda
- **Mirkomil maydonlari:** `lib/labels.js` → `EXTRA_FIELDS` ro'yxati (bazani o'zgartirish shart emas, `extra` jsonb ustunida saqlanadi).
- **Teaser/yopiq qismni ko'chirish:** ustunni `startups` ↔ `startup_private` jadvallari orasida ko'chiring.
- **Ranglar va shrift:** `app/globals.css` → `:root` o'zgaruvchilari.
- **Valyuta:** `lib/labels.js` → `formatMoney` (hozir AQSH dollari, $).

## Kabinet funksiyalari

- **Startap:** umumiy ko'rinish (profil to'liqligi), so'rovlar (filtr bilan), profil (logotip yuklash), katalogdan yashirish.
- **Investor:** umumiy ko'rinish, qidiruv va filtr (nom, soha, bosqich), saqlanganlar, so'rovni qaytarib olish, o'z profili.
- Baza o'zgarishlari `supabase/schema.sql` 8-bo'limida. Logotiplar `logos` bucket'ida (1 MB, PNG/JPG/WebP).
