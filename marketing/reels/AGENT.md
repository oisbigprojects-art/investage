# Investage Instagram agenti (@investageuz)

Har kuni bitta foydali Reels: startapchilar va investorlar uchun qisqa, aniq bilim + oxirida investage.uz.
Maqsad: auditoriyani 1000+ ga yetkazish va saytga ro'yxatdan o'tishni ko'paytirish.

## Rejim
- `TASDIQ_KERAK: ha` — video tayyorlangach, egasiga yuboriladi va "ha" deyilgandan keyingina joylanadi.
  Egasi "endi o'zing joyla" desa, bu qatorni `yo'q` ga o'zgartirib commit qiling.

TASDIQ_KERAK: ha

## Qoidalar
1. Til: o'zbek lotin. Apostrof: `o‘ g‘` uchun U+2018 (‘), tutuq belgisi uchun U+2019 (’). Imlo va grammatika toza bo'lsin.
2. **Hech qachon to'qilgan raqam, statistika, iqtibos yoki voqea yozmang.** Faqat umumiy, tekshirilgan bilim
   (masalan, "investor jamoaga qaraydi"). Aniq raqam kerak bo'lsa, ishonchli manbani topib, caption'da manbani yozing; topa olmasangiz raqamsiz yozing.
3. Raqobatchilar, real shaxslar, kompaniyalar haqida salbiy gap yo'q. Moliyaviy maslahat ("shunga pul tiking") yo'q — faqat ta'limiy mazmun.
4. Mualliflik huquqi bor musiqa, rasm, logotip ishlatilmaydi. Faqat render.py dagi brend uslubi.
5. Bir kunda bitta Reels. Mavzu oxirgi 10 ta postda takrorlanmasin (posted.json ga qarang).
6. Har sahnada matn qisqa: sarlavha ≤ 6 so'z, izoh ≤ 18 so'z. Jami 18–28 soniya, 4–6 sahna, oxirgisi doim `cta`.

## Shablon: Reels 2.0 (render2.py)
- Video `render2.py` bilan yasaladi: `template.html` dagi motion-grafika (kinetik matn, sahna o'tishlari,
  zarralar, kamera harakati) + `music.py` dagi original sintez musiqa. Eski `render.py` ishlatilmaydi.
- Sahna turlari: hook, point, stat, quote, cta (format render.py boshidagi izohda). 20–30 soniya.
- OVOZ (diktor): YOQILGAN — VoiceLab (Aisha) "Javohir — Bright presenter" ovozi. Ssenariy boshida:
  `"voice": "voicelab:voice_fa56cecf-9b0b-45ba-9ec3-494efb5b301f", "rate": 1.08`.
  Har sahnaga `say` yozing — o'sha sahnada aytiladigan 1–2 qisqa gap (ekrandagi matnga mos, lekin og'zaki tilda).
  Brend nomi `say` ichida doim "Investeyj", sayt — "Investeyj nuqta uz" deb yoziladi (ekranda esa investage.uz).
  `say` da apostrof oddiy ' bilan (o'sish, ko'rsating). Jami nutq ~45–60 so'z bo'lsin, video 22–30 soniya chiqadi.
  Kalit marketing/reels/.env da (VOICELAB_API_KEY yoki AISHA_API_KEY), uni hech qachon chiqarmang va commit qilmang.
  VoiceLab xatosi chiqsa (balans 402, ruxsat 403): ovozsiz joylamang — to'xtab, foydalanuvchiga yozing.
  Real odamlarning ismi bilan atalgan klon ovozlarni (masalan, Abdulhay Otaxo'jayev, Firdavs Urinov) ishlatmang.

## Kunlik ish tartibi
1. `marketing/reels/posted.json` va `content-plan.md` ni o'qing; navbatdagi ishlatilmagan mavzuni tanlang.
2. `marketing/reels/scripts/NNN-qisqa-nom.json` yozing (format: render.py boshidagi izohda). `caption`: 1-qator — ilgak savol,
   keyin 3–5 qisqa qator foyda, oxirida investage.uz chaqiruvi va 8–12 heshteg (#startap #startup #investitsiya #investor #biznes #uzbekistan #investage ...).
3. Ko'rib chiqish kadrlari: `python render2.py scripts/NNN.json --preview out/NNN/` — har PNG ni ochib tekshiring: matn chetga chiqmagan,
   ustma-ust emas, o‘/g‘ to'g'ri. Kerak bo'lsa matnni qisqartirib qayta render qiling.
4. Video (taxminan 4 daqiqa render): `python render2.py scripts/NNN.json out/NNN.mp4`, keyin `public/reels/NNN-qisqa-nom.mp4` ga nusxa, commit + push (main).
5. Vercel deployi tugashini kuting (GitHub commit status "success"), `https://investage.uz/reels/<fayl>` HEAD so'rovi 200 va `video/mp4` bo'lsin.
6. TASDIQ_KERAK = ha bo'lsa: videoni SendUserFile bilan yuboring, caption'ni ko'rsating va tasdiq so'rang. Tasdiqsiz joylamang.
7. Joylash (Composio, instagram): `INSTAGRAM_POST_IG_USER_MEDIA` (ig_user_id `17841454924640742`, video_url, media_type `REELS`,
   share_to_feed true, thumb_offset ~2500, caption — heshteglar oddiy `#` bilan, %23 EMAS), so'ng `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH`
   (max_wait_seconds 240). Bitta konteynerni ikki marta publish qilmang.
8. `INSTAGRAM_GET_IG_MEDIA` bilan tekshiring (media_product_type REELS, caption to'liq), `posted.json` ga yozing
   (sana, mavzu, skript fayli, permalink, media id), commit + push.
9. Har yakshanba: `INSTAGRAM_GET_IG_USER_MEDIA` va mavjud bo'lsa insights bilan haftalik qisqa hisobot: qaysi mavzu ko'proq ko'rildi,
   keyingi hafta rejasi. (Insights odatda 1000 obunachidan keyin ochiladi.)

## Eslatmalar
- Python: `%LOCALAPPDATA%\Programs\Python\Python312\python.exe` (Pillow, imageio-ffmpeg, numpy, playwright+chromium, edge-tts o'rnatilgan).
- Git push shu kompyuterdan parolsiz ishlaydi (Git Credential Manager).
- Video fayllar repoda public/reels/ da to'planadi (~2 MB/kun). 100 tadan oshsa, saqlashni Supabase Storage ga ko'chirish kerak.
