import { Suspense } from 'react';
import { Sidebar, SidebarFallback, TopActions, TopFallback } from '@/components/AppShell';

// Startaplar katalogi va kabinetlar: hamma uchun (mehmon, startap, investor) yon menyuli panel
export default function AppLayout({ children }) {
  return (
    <div className="app">
      <a className="skip" href="#main">
        Asosiy qismga o&apos;tish
      </a>
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
      </Suspense>
      <div className="app-main">
        <header className="app-top">
          <Suspense fallback={<TopFallback />}>
            <TopActions />
          </Suspense>
        </header>
        <main id="main" className="app-content">
          {children}
        </main>
        <footer className="app-foot small muted">
          © {new Date().getFullYear()} Investage · platforma orqali pul o&apos;tkazilmaydi, kelishuv tomonlar o&apos;rtasida.
        </footer>
      </div>
    </div>
  );
}
