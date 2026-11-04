// Tayyorlik testi matn kalitlari ('use client' faylidan chiqarib bo'lmaydi, shuning uchun alohida modulda)
export const RT_KEYS = ['title', 'sub', 'private', 'start', 'back', 'result', 'steps', 'perfect', 'share', 'story', 'copied', 'retry', 'cta_title', 'cta_text', 'cta_btn', 'note', 'share_text', 'home_kicker'].map((k) => `rt.${k}`);

// { 'rt.title': ... } -> { title: ... }
export const shortKeys = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.slice(3), v]));
