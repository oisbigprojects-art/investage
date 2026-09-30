// Serverdan uzatiladigan matn kalitlari (client faqat shularni oladi)
// 'use client' faylidan chiqarib bo'lmaydi (server komponent uni massiv sifatida o'qiy olmaydi), shuning uchun alohida modulda
export const DEMO_KEYS = [
  'stage.mvp',
  'ui.verified',
  'ui.verified_title',
  'ui.score_label',
  'ui.score_none',
  ...[1, 2, 3].flatMap((i) => ['name', 'sector', 'desc'].map((f) => `demo.s${i}_${f}`)),
  ...['aria', 'name', 'sector', 'desc', 'badge', 'sealed', 'opened', 'waiting', 'closed', 'funding', 'equity', 'contact', 'cap_pending', 'cap_locked', 'again', 'send', 'sent', 'st_none', 'st_wait', 'st_ok'].map((k) => `demo.${k}`),
];

