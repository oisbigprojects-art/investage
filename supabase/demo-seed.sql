-- NAMUNA (demo) ma'lumotlar: sayt to'la ko'rinishi uchun. Hammasi to'qilgan, haqiqiy shaxs yoki kompaniya emas.
-- Barcha demo hisoblar email manzili @demo.investage.invalid bilan tugaydi (kirib bo'lmaydi: parol yo'q).
-- O'chirish (hammasi birga ketadi, bog'liq startap, so'rov va saqlashlar ham):
--   delete from auth.users where email like '%@demo.investage.invalid';

do $seed$
declare
  r record;
  uid uuid;
  sid uuid;
begin
  -- 7 ta namuna startap
  for r in select * from (values
    ('suvchi','Suvchi',$q$Agrotexnologiya$q$,$q$Tomchilatib sug'orishni datchiklar va telefon ilovasi orqali avtomatik boshqaradigan tizim. Fermer suv va elektr sarfini kamaytiradi.$q$,'mvp',74,60000,12,$q$3 kishi: muhandis, agronom va dasturchi. Samarqand viloyatidagi 4 ta fermer xo'jaligida sinovdan o'tkazilmoqda.$q$,1800,4),
    ('bilimbox','Bilimbox',$q$Ta'lim texnologiyalari$q$,$q$5–9-sinf o'quvchilari uchun matematika va ingliz tili bo'yicha moslashuvchan onlayn mashqlar hamda ota-onalar uchun kuzatuv paneli.$q$,'goya',58,25000,8,$q$2 kishi: o'qituvchi va dasturchi. Birinchi versiya 30 ta oila bilan sinovdan o'tkazilyapti.$q$,0,30),
    ('yukla','Yukla',$q$Logistika$q$,$q$Kichik va o'rta biznesni mahalliy yuk mashinalari egalari bilan bog'laydigan yuk tashish maydoni. Narx bir daqiqada hisoblanadi.$q$,'daromad',81,150000,10,$q$6 kishi: logistika mutaxassisi, 3 dasturchi, sotuv va mijozlar bilan ishlash menejeri.$q$,9500,620),
    ('shifo24','Shifo24',$q$Sog'liqni saqlash$q$,$q$Chekka tumanlardagi aholi uchun shifokor bilan video maslahat va dori-darmon buyurtma qilish xizmati.$q$,'mvp',69,90000,15,$q$5 kishi: amaliyotchi shifokor, dasturchi, dizayner va 2 hamkorlik menejeri. 3 ta tuman poliklinikasi bilan kelishuv bor.$q$,2400,310),
    ('savdohisob','Savdo Hisob',$q$Fintech$q$,$q$Bozor va do'kon sotuvchilari uchun telefon orqali kunlik savdo, nasiya va ombor hisobini yuritish ilovasi.$q$,'daromad',76,120000,9,$q$5 kishi: buxgalter, 2 dasturchi, dizayner va sotuv menejeri. Oylik to'lovli obuna asosida ishlaydi.$q$,6200,1400),
    ('safargo','SafarGo',$q$Turizm$q$,$q$Buyuk Ipak yo'li shaharlarida mahalliy gidlar va kichik mehmonxonalarni xorijiy sayyohlar bilan to'g'ridan-to'g'ri bog'laydigan bron xizmati.$q$,'mvp',62,45000,14,$q$4 kishi: turizm mutaxassisi, dasturchi, kontent menejeri va tarjimon. Buxoro va Samarqandda 25 ta gid ro'yxatdan o'tgan.$q$,900,85),
    ('quyoshservis','Quyosh Servis',$q$Toza energiya$q$,$q$Uy va fermer xo'jaliklari uchun quyosh panellarini o'rnatuvchi ustalar bozori va kredit hisob-kitob kalkulyatori.$q$,'goya',51,70000,20,$q$3 kishi: energetik muhandis, dasturchi va marketolog. Prototip tayyor, 2 ta o'rnatuvchi kompaniya bilan suhbatlar bor.$q$,0,0)
  ) as v(slug, name, sector, descr, stage, score, funding, equity, team, revenue, users)
  loop
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'demo.' || r.slug || '@demo.investage.invalid', '', now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('role','startup','full_name', r.name || ' jamoasi'), now(), now(), '', '', '', '');
    update public.profiles set is_demo = true where id = uid;
    insert into public.startups (owner_id, name, sector, short_desc, stage, score, verified, logo_url, hidden, is_demo)
    values (uid, r.name, r.sector, r.descr, r.stage, r.score, false, '/demo-logos/' || r.slug || '.svg', false, true)
    returning id into sid;
    insert into public.startup_private (startup_id, funding_amount, equity_percent, team, contact_email, contact_phone, contact_telegram, extra)
    values (sid, r.funding, r.equity, r.team,
      'demo.' || r.slug || '@demo.investage.invalid', '+998 00 000 00 0' || (1 + (r.funding::int % 7)), '@demo_' || r.slug,
      jsonb_build_object('monthly_revenue', r.revenue, 'users_count', r.users));
  end loop;

  -- 7 ta namuna investor (ochiq katalogda ko'rinadi)
  for r in select * from (values
    ('navruz','Bekzod Yo''ldoshev','Navruz Capital','Toshkent, Yunusobod tumani','Fintech, Elektron tijorat, Logistika',$q$Toshkentlik angel-investor, sobiq bank menejeri. 2019-yildan beri erta bosqichdagi texnologik startaplarga investitsiya kiritadi. Odatiy chek: $20 000 – $100 000. Jamoa kuchi va tushunarli daromad modeliga e'tibor beradi.$q$),
    ('registon','Malika Karimova','Registon Ventures','Samarqand','Turizm, Ta''lim, Elektron tijorat',$q$Samarqanddagi mehmonxona biznesi egasi, turizm va ta'lim startaplarini qo'llab-quvvatlaydi. Chek: $10 000 – $60 000. Mahalliy bozorni yaxshi biladigan jamoalarni afzal ko'radi.$q$),
    ('chirchiq','Sardor Ergashev','Chirchiq Agro Fund','Toshkent viloyati, Chirchiq','Agrotexnologiya, Qishloq xo''jaligi, Logistika',$q$Agrobiznes bilan 12 yildan beri shug'ullanadi, o'z fermer xo'jaliklari va qayta ishlash sexi bor. Suv tejash va hosildorlikni oshiruvchi yechimlarga $30 000 – $150 000 gacha kiritadi.$q$),
    ('fargona','Dilnoza Rahmonova','Farg''ona Tech Angels','Farg''ona','IT, Ta''lim, Fintech',$q$Dasturiy ta'minot kompaniyasi asoschisi, hozir angel-investor sifatida faol. Dasturchi jamoalarga mentorlik ham qiladi. Chek: $10 000 – $80 000.$q$),
    ('buxoro','Otabek Murodov','Buxoro Growth Partners','Buxoro','Turizm, Savdo, Xizmatlar',$q$Savdo va mehmonxona xizmatlari sohasida 15 yillik tajriba. Tez daromad keltiradigan kichik biznes modellarga qiziqadi. Chek: $15 000 – $70 000.$q$),
    ('xorazm','Nodira Qodirova','Xorazm Impact Capital','Urganch, Xorazm viloyati','Sog''liqni saqlash, Ta''lim, Ijtimoiy ta''sir',$q$Sobiq shifokor, hozir sog'liqni saqlash va ta'lim sohasidagi ijtimoiy loyihalarga sarmoya kiritadi. Viloyatlarga xizmat ko'rsatadigan startaplarni afzal ko'radi. Chek: $10 000 – $50 000.$q$),
    ('nukus','Jasur Abdullayev','Nukus Green Fund','Nukus, Qoraqalpog''iston','Toza energiya, Suv xo''jaligi, Qishloq xo''jaligi',$q$Energetika muhandisi va tadbirkor. Orol bo'yi hududlarida suv va energiyani tejaydigan texnologiyalarga investitsiya kiritadi. Chek: $20 000 – $120 000.$q$)
  ) as v(slug, full_name, company, city, interests, bio)
  loop
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'demo.inv.' || r.slug || '@demo.investage.invalid', '', now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('role','investor','full_name', r.full_name), now(), now(), '', '', '', '');
    update public.profiles set is_demo = true, public_profile = true, company = r.company, city = r.city,
      interests = r.interests, bio = r.bio where id = uid;
  end loop;
end
$seed$;
