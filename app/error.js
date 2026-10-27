'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Kutilmagan xato (500) sahifasi. Klient komponenti bo'lgani uchun matnlar shu yerda, til <html lang> dan olinadi.
const TEXT = {
  uz: { title: 'Nimadir noto‘g‘ri ketdi', text: 'Sahifani ochishda xato yuz berdi. Qayta urinib ko‘ring yoki birozdan keyin qayting.', retry: 'Qayta urinish', home: 'Bosh sahifa' },
  ru: { title: 'Что-то пошло не так', text: 'При открытии страницы произошла ошибка. Попробуйте ещё раз или вернитесь чуть позже.', retry: 'Повторить', home: 'На главную' },
  en: { title: 'Something went wrong', text: 'An error occurred while opening this page. Please try again or come back a little later.', retry: 'Try again', home: 'Home' },
};

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'uz';
  const t = TEXT[lang] || TEXT.uz;
  return (
    <div className="empty" role="alert" style={{ margin: '12vh auto', maxWidth: 520 }}>
      <h3>{t.title}</h3>
      <p>{t.text}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-gold" onClick={() => reset()}>
          {t.retry}
        </button>
        <Link className="btn btn-ghost" href="/">
          {t.home}
        </Link>
      </div>
    </div>
  );
}
