'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { MenuIcon, CloseIcon } from './icons';

// Telefondagi ochiladigan menyu (pastdan chiqadigan panel). Ichidagi kontent serverda chiziladi va children sifatida keladi.
// variant="tab" — pastki navigatsiya panelidagi "Menyu" tugmasi ko'rinishida; aks holda ☰ tugma.
export default function MobileMenu({ label, closeLabel, title, variant, children }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = usePathname();

  // Panel body ichiga portal orqali chiqadi: sarlavhadagi backdrop-filter "fixed" joylashuvni buzmasin
  useEffect(() => setMounted(true), []);

  // Boshqa sahifaga o'tilganda menyu yopiladi
  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('menu-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('menu-open');
    };
  }, [open]);

  return (
    <>
      {variant === 'tab' ? (
        <button type="button" className={`tab ${open ? 'is-on' : ''}`} aria-expanded={open} onClick={() => setOpen(true)}>
          <span className="tab-ico">
            <MenuIcon size={22} />
          </span>
          <span>{label}</span>
        </button>
      ) : (
        <button type="button" className="icon-btn menu-btn" aria-label={label} aria-expanded={open} onClick={() => setOpen(true)}>
          <MenuIcon size={22} />
        </button>
      )}
      {mounted &&
        createPortal(
          <>
            {open && <div className="sheet-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
            <div
              className={`sheet ${open ? 'is-open' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-label={title || label}
              hidden={!open}
              onClick={(e) => {
                if (e.target.closest('a')) setOpen(false);
              }}
            >
              <div className="sheet-head">
                <b>{title || label}</b>
                <button type="button" className="icon-btn" aria-label={closeLabel} onClick={() => setOpen(false)}>
                  <CloseIcon size={20} />
                </button>
              </div>
              <div className="sheet-body">{children}</div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
