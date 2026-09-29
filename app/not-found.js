import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="empty">
      <h3>Sahifa topilmadi</h3>
      <p>Bu startap o&apos;chirilgan yoki havola noto&apos;g&apos;ri.</p>
      <Link className="btn btn-gold" href="/startaplar">
        Startaplar ro&apos;yxatiga qaytish
      </Link>
    </div>
  );
}
