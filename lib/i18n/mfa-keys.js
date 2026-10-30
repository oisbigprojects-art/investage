// Ikki bosqichli kirish matn kalitlari: 'use client' faylidan chiqarib bo'lmaydi, shuning uchun alohida modulda
export const MFA_KEYS = ['title', 'off_text', 'on_text', 'enable', 'scan', 'secret', 'qr_alt', 'code', 'confirm', 'cancel', 'disable', 'disable_confirm', 'err_code', 'err_load', 'err_disable'].map((k) => `mfa.${k}`);
