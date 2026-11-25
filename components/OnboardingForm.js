'use client';

import { useActionState, useState } from 'react';
import { finishOnboarding } from '@/app/auth-actions';
import { normalizePostal, postalError, postalRegions } from '@/lib/onboarding';

// Birinchi kirishdagi anketa. Xato bo'lsa kiritilganlar o'chib ketmaydi (server action holat qaytaradi).
export default function OnboardingForm({ s, regions, questions, chooseRole, roleLabel, agree }) {
  const [state, action, pending] = useActionState(finishOnboarding, null);
  const [role, setRole] = useState('');
  const [region, setRegion] = useState('');
  const [postal, setPostal] = useState('');
  const abroad = region === 'chet';
  const code = normalizePostal(region, postal);
  const cur = regions.find((r) => r.v === region);
  // Yozish davomida qisqa izoh: indeks qaysi viloyatniki yoki nimasi noto'g'ri (yuborishdan oldin ko'rinadi)
  const full = abroad ? code.length >= 3 : code.length >= 6;
  const perr = region && full ? postalError(region, code) : '';
  const owner = regions.find((r) => r.v === postalRegions(code)[0]);
  const live = !perr ? '' : perr === 'ob.err_postal_region' ? s.err_postal_region_is.replace('{r}', owner?.label || '') : s[perr.slice(3)] || '';

  // Indeks kiritilganda viloyat hali tanlanmagan bo'lsa, indeksga qarab tanlab qo'yamiz
  const onPostal = (v) => {
    setPostal(v);
    if (region) return;
    const match = postalRegions(normalizePostal('', v));
    if (match.length) setRegion(match[0]);
  };
  const qs = chooseRole ? questions[role] || [] : questions.fixed;

  return (
    <form action={action} className="card form onboarding">
      {state?.error && <p className="flash flash-bad" role="alert">{state.error}</p>}
      {chooseRole ? (
        <fieldset className="role-radio">
          <legend>{s.who}</legend>
          {['startup', 'investor'].map((r) => (
            <label key={r} className="radio-card">
              <input type="radio" name="role" value={r} required checked={role === r} onChange={() => setRole(r)} />
              <span>
                <strong>{s[r]}</strong>
                <small>{s[r + '_sub']}</small>
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="muted small">
          {s.role_fixed}: <strong>{roleLabel}</strong>
        </p>
      )}

      <label>
        {s.region}
        <select name="region" required value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="" disabled>{s.region_pick}</option>
          {regions.map((r) => (
            <option key={r.v} value={r.v}>{r.label}</option>
          ))}
        </select>
      </label>
      <label>
        {s.postal}
        <input
          name="postal"
          required
          value={postal}
          onChange={(e) => onPostal(e.target.value)}
          autoComplete="postal-code"
          inputMode={abroad ? 'text' : 'numeric'}
          maxLength={14}
          placeholder={abroad ? '' : cur?.p ? `${cur.p[0]}0100` : '100100'}
          aria-invalid={live ? 'true' : undefined}
        />
        {/* pattern yo'q: "100 100" kabi yozilsa ham qabul qilinadi, bo'shliq va chiziqcha shu yerda va serverda tozalanadi */}
        {live ? (
          <small className="postal-err" role="status">{live}</small>
        ) : (
          <small className="muted">{abroad ? s.postal_hint_abroad : cur?.p ? s.postal_hint_region.replace('{p}', cur.p.join(' / ')) : s.postal_hint}</small>
        )}
      </label>

      {qs.map((q) => (
        <fieldset
          key={q.id}
          className="ob-q"
          onChange={q.max ? (e) => { if (e.currentTarget.querySelectorAll('input:checked').length > q.max) e.target.checked = false; } : undefined}
        >
          <legend>{q.q}</legend>
          <div className="ob-opts">
            {q.options.map((o) => (
              <label key={o.v} className="ob-opt">
                <input type={q.type === 'multi' ? 'checkbox' : 'radio'} name={q.id} value={o.v} required={q.type !== 'multi'} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <label className="agree small">
        <input type="checkbox" name="agree" required />
        <span>{agree}</span>
      </label>
      <button className="btn btn-gold" type="submit" disabled={pending || (chooseRole && !role)}>
        {s.submit}
      </button>
    </form>
  );
}
