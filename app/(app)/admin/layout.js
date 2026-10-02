import { adminContext } from '@/lib/admin';
import AdminTabs from '@/components/AdminTabs';

export const metadata = { title: 'Admin — Investage', robots: { index: false, follow: false } };

// Faqat adminlar uchun; boshqalarga 404
export default async function AdminLayout({ children }) {
  await adminContext();
  return (
    <>
      <AdminTabs />
      {children}
    </>
  );
}
