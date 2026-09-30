// Kalkulyator matn kalitlari: 'use client' faylidan chiqarib bo'lmaydi, shuning uchun alohida modulda
export const CALC_KEYS = ['title', 'sub', 'amount', 'equity', 'pre', 'post', 'err', 'note'].map((k) => `calc.${k}`);
