import Link from 'next/link';
import SiteChrome from '@/components/SiteChrome';

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="empty">
        <h3>Sahifa topilmadi</h3>
        <p>Bu sahifa o&apos;chirilgan yoki havola noto&apos;g&apos;ri.</p>
        <Link className="btn btn-gold" href="/startaplar">
          Startaplar ro&apos;yxatiga qaytish
        </Link>
      </div>
    </SiteChrome>
  );
}
