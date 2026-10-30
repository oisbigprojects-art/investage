'use client';

import { Children, useState } from 'react';

// Startapchi yoki investor: bitta tugma bilan bo'lim o'zgaradi. Ikkala panel ham serverda chiziladi (qidiruv tizimlari uchun)
export default function RoleSwitch({ tabs, children }) {
  const [on, setOn] = useState(0);
  const panels = Children.toArray(children);
  return (
    <div className="role-switch">
      <div className="role-tabs" role="tablist">
        {tabs.map((label, i) => (
          <button key={label} type="button" role="tab" aria-selected={on === i} className={on === i ? 'is-on' : ''} onClick={() => setOn(i)}>
            {label}
          </button>
        ))}
      </div>
      {panels.map((p, i) => (
        <div key={i} role="tabpanel" hidden={on !== i} className="role-panel">
          {p}
        </div>
      ))}
    </div>
  );
}
