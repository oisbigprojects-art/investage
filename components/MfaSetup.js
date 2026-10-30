'use client';

import { useEffect, useState } from 'react';
import { browserClient } from '@/lib/supabase/browser';
import { stringsT } from '@/lib/i18n/client';

// Ikki bosqichli kirish (TOTP): QR kod va maxfiy kalit faqat foydalanuvchi brauzerida ko'rinadi
export default function MfaSetup({ strings, lang }) {
  const t = stringsT(strings, lang);
  const [factor, setFactor] = useState(undefined); // undefined: yuklanmoqda, null: yoqilmagan
  const [enroll, setEnroll] = useState(null);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const mfa = browserClient().auth.mfa;

  const load = async () => {
    const { data, error } = await mfa.listFactors();
    if (error) return setErr(t('mfa.err_load'));
    setFactor(data.totp[0] || null);
  };
  useEffect(() => {
    load();
  }, []);

  const start = async () => {
    setBusy(true);
    setErr('');
    // Oldin yakunlanmagan urinish qolgan bo'lsa, tozalaymiz
    const { data: list } = await mfa.listFactors();
    for (const f of list?.all || []) if (f.status === 'unverified') await mfa.unenroll({ factorId: f.id });
    const { data, error } = await mfa.enroll({ factorType: 'totp', friendlyName: `Investage ${Date.now()}` });
    setBusy(false);
    if (error) return setErr(t('mfa.err_load'));
    setEnroll(data);
  };

  const confirm = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const { error } = await mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
    setBusy(false);
    if (error) return setErr(t('mfa.err_code'));
    setEnroll(null);
    setCode('');
    await load();
  };

  const cancel = async () => {
    await mfa.unenroll({ factorId: enroll.id });
    setEnroll(null);
    setCode('');
    setErr('');
  };

  const disable = async () => {
    if (!window.confirm(t('mfa.disable_confirm'))) return;
    setBusy(true);
    setErr('');
    const { error } = await mfa.unenroll({ factorId: factor.id });
    setBusy(false);
    if (error) return setErr(t('mfa.err_disable'));
    await load();
  };

  return (
    <section className="card mfa-card">
      <h2>{t('mfa.title')}</h2>
      {factor === undefined && !err && <p className="muted">…</p>}
      {factor === null && !enroll && (
        <>
          <p className="muted">{t('mfa.off_text')}</p>
          <button className="btn btn-gold" type="button" onClick={start} disabled={busy}>
            {t('mfa.enable')}
          </button>
        </>
      )}
      {enroll && (
        <form className="form" onSubmit={confirm}>
          <p className="muted">{t('mfa.scan')}</p>
          <img className="mfa-qr" src={enroll.totp.qr_code} alt={t('mfa.qr_alt')} width="220" height="220" />
          <details>
            <summary className="small muted">{t('mfa.secret')}</summary>
            <code className="mfa-secret">{enroll.totp.secret}</code>
          </details>
          <label>
            {t('mfa.code')}
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required />
          </label>
          <div className="row">
            <button className="btn btn-gold" type="submit" disabled={busy}>{t('mfa.confirm')}</button>
            <button className="btn btn-ghost" type="button" onClick={cancel}>{t('mfa.cancel')}</button>
          </div>
        </form>
      )}
      {factor && (
        <>
          <p className="muted">{t('mfa.on_text')}</p>
          <button className="btn btn-ghost" type="button" onClick={disable} disabled={busy}>
            {t('mfa.disable')}
          </button>
        </>
      )}
      {err && <p className="flash flash-bad" role="alert">{err}</p>}
    </section>
  );
}
