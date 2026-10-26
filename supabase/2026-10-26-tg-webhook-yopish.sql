-- 2026-10-26: tg_webhook endi faqat Edge Function (service_role kaliti) chaqira oladi.
-- FAQAT tg-webhook Edge Function SUPABASE_SERVICE_ROLE_KEY bilan qayta deploy qilingandan va
-- bot /start ga javob berishi tekshirilgandan KEYIN ishga tushiring. Aks holda Telegram bot to'xtaydi.
-- Ichidagi maxfiy kalit (Vault: telegram_webhook_secret) tekshiruvi o'z joyida qoladi.

revoke execute on function public.tg_webhook(text, jsonb) from public, anon, authenticated;
grant execute on function public.tg_webhook(text, jsonb) to service_role;
