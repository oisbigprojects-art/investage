'use client';

import { useActionState, useState } from 'react';
import { finishOnboarding } from '@/app/auth-actions';

// Birinchi kirishdagi anketa. Xato bo'lsa kiritilganlar o'chib ketmaydi (server action holat qaytaradi).
export default function OnboardingForm({ s, regions, questions, chooseRole, roleLabel, agree }) {
  const [state, action, pending] = useActionState(finishOnboarding, null);
  const [role, setRole] = useState('');
  const [region, setRegion] = useState('');
  const abroad = region === 'chet';
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
          autoComplete="postal-code"
          inputMode={abroad ? 'text' : 'numeric'}
          pattern={abroad ? '[A-Za-z0-9][A-Za-z0-9 \\-]{1,8}[A-Za-z0-9]' : '\\d{6}'}
          maxLength={abroad ? 10 : 6}
          placeholder={abroad ? '' : '100100'}
        />
        <small className="muted">{abroad ? s.postal_hint_abroad : s.postal_hint}</small>
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
