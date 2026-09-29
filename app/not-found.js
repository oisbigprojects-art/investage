import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="empty">
      <h2>Sahifa topilmadi</h2>
      <p>Bu startap o&apos;chirilgan yoki havola noto&apos;g&apos;ri.</p>
      <Link href="/startaplar">Startaplar ro&apos;yxatiga qaytish</Link>
    </div>
  );
}
