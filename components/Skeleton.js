// Sahifa ma'lumoti kelguncha ko'rinadigan skelet
export default function PageSkeleton({ cards = 6, label = 'Yuklanmoqda…' }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="skel skel-title" />
      <span className="skel skel-line" />
      <div className="skel-row">
        {Array.from({ length: Math.min(cards, 3) }).map((_, i) => (
          <span key={i} className="skel skel-block" />
        ))}
      </div>
      <div className="skel-row">
        {Array.from({ length: cards }).map((_, i) => (
          <span key={i} className="skel skel-card" />
        ))}
      </div>
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
