import Link from 'next/link';
import { startupContext } from '@/lib/cabinet';
import { Flash, Monogram } from '@/components/ui';
import { saveStartup } from '../../actions';
import { STAGES, EXTRA_FIELDS } from '@/lib/labels';

export const metadata = { title: 'Profil — Startap kabineti — Investage' };

export default async function StartupProfile({ searchParams }) {
  const sp = await searchParams;
  const { s, p } = await startupContext({ requireProfile: false, withPrivate: true });
  const extra = p?.extra || {};

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Startap kabineti</span>
        <h1>{s ? 'Profil' : 'Startap profilini yarating'}</h1>
        <p className="muted">
          {s ? (
            <>
              Bu yerda ochiq tanishtiruv va yopiq ma&apos;lumotni tahrirlaysiz.{' '}
              <Link href={`/startaplar/${s.id}`}>Investorlar ko&apos;radigan sahifa</Link>
            </>
          ) : (
            "Avval ochiq tanishtiruvni to'ldiring, keyin yopiq ma'lumotni kiriting."
          )}
        </p>
      </div>
      <Flash searchParams={sp} />

      <form action={saveStartup} className="card form">
        <div className="form-block">
          <div className="form-block-head">
            <h3>Ochiq tanishtiruv</h3>
            <span className="chip chip-muted">Hamma ko&apos;radi</span>
          </div>

          <div className="logo-field">
            <Monogram name={s?.name || '?'} logo={s?.logo_url} size={72} />
            <div className="logo-field-body">
              <label>
                Logotip
                <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
              </label>
              <span className="muted small">PNG, JPG yoki WebP, 1 MB gacha. Kvadrat rasm yaxshi ko&apos;rinadi.</span>
              {s?.logo_url && (
                <label className="check-inline">
                  <input name="remove_logo" type="checkbox" />
                  Joriy logotipni olib tashlash
                </label>
              )}
            </div>
          </div>

          <label>
            Startap nomi
            <input name="name" defaultValue={s?.name || ''} required />
          </label>
          <label>
            Soha
            <input name="sector" defaultValue={s?.sector || ''} placeholder="Masalan: FinTech, EdTech, AgroTech" />
          </label>
          <label>
            Qisqa tavsif
            <textarea name="short_desc" rows={3} maxLength={300} defaultValue={s?.short_desc || ''} />
          </label>
          <label>
            Bosqich
            <select name="stage" defaultValue={s?.stage || 'goya'}>
              {Object.entries(STAGES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <p className="muted small">
            Baho va &laquo;Tasdiqlangan&raquo; belgisini Investage jamoasi qo&apos;yadi, ularni o&apos;zgartirib bo&apos;lmaydi.
          </p>
        </div>

        <div className="form-block form-block-locked">
          <div className="form-block-head">
            <h3>Yopiq ma&apos;lumot</h3>
            <span className="chip chip-ok">
              <i aria-hidden="true" />
              Faqat ruxsat bergan investorlarga
            </span>
          </div>
          <div className="two">
            <label>
              Kerakli mablag&apos; (USD, $)
              <input
                name="funding_amount"
                inputMode="numeric"
                defaultValue={p?.funding_amount ?? ''}
                placeholder="Masalan: 50000"
              />
            </label>
            <label>
              Taklif qilinayotgan ulush (%)
              <input name="equity_percent" inputMode="decimal" defaultValue={p?.equity_percent ?? ''} />
            </label>
          </div>
          <label>
            Jamoa
            <textarea name="team" rows={3} defaultValue={p?.team || ''} placeholder="Asoschilar, rollari, tajribasi" />
          </label>
          <div className="two">
            <label>
              Kontakt email
              <input name="contact_email" type="email" defaultValue={p?.contact_email || ''} />
            </label>
            <label>
              Telefon
              <input name="contact_phone" defaultValue={p?.contact_phone || ''} placeholder="+998 90 123 45 67" />
            </label>
          </div>
          <label>
            Telegram
            <input name="contact_telegram" defaultValue={p?.contact_telegram || ''} placeholder="@username" />
          </label>

          <div className="placeholder-box">
            <span className="muted small">
              Namunaviy maydonlar. Yakuniy ro&apos;yxat tayyor bo&apos;lgach shu yerda almashtiriladi.
            </span>
            <div className="two">
              {EXTRA_FIELDS.map((f) => (
                <label key={f.key}>
                  {f.label}
                  <input name={`extra_${f.key}`} defaultValue={extra[f.key] || ''} />
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-gold" type="submit">
          {s ? 'Saqlash' : 'Profilni yaratish'}
        </button>
      </form>
    </>
  );
}
