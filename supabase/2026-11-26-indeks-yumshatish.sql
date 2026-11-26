-- Pochta indeksi tekshiruvini yumshatish (lib/onboarding.js dagi postalError bilan bir xil).
-- Eski (sovet davridagi, 7 bilan boshlanadigan) 6 xonali indekslar ham qabul qilinadi: ko'pchilik hali shuni biladi.
-- Yangi indekslar avvalgidek viloyatga mos bo'lishi kerak (sayt viloyatni indeksga qarab o'zi to'g'rilaydi).
-- Supabase → SQL Editor'da bir marta ishga tushiriladi.

create or replace function private.postal_ok(p_region text, p_postal text)
returns boolean
language sql immutable
set search_path to ''
as $function$
  select case
    when p_region = 'chet' then p_postal ~ '^[A-Z0-9][A-Z0-9 -]{1,8}[A-Z0-9]$'
    when p_postal !~ '^\d{6}$' then false
    when p_region not in ('toshkent_sh','toshkent_v','sirdaryo','jizzax','samarqand','fargona','namangan','andijon',
                          'qashqadaryo','surxondaryo','buxoro','navoiy','xorazm','qoraqalpogiston') then false
    when left(p_postal, 1) = '7' then true
    else left(p_postal, 2) = any (case p_region
      when 'toshkent_sh' then array['10','11'] when 'toshkent_v' then array['10','11']
      when 'sirdaryo' then array['12'] when 'jizzax' then array['13'] when 'samarqand' then array['14']
      when 'fargona' then array['15'] when 'namangan' then array['16'] when 'andijon' then array['17']
      when 'qashqadaryo' then array['18'] when 'surxondaryo' then array['19'] when 'buxoro' then array['20']
      when 'navoiy' then array['21'] when 'xorazm' then array['22'] when 'qoraqalpogiston' then array['23']
      else array[]::text[] end)
  end
$function$;
