import { Suspense } from 'react';
import { Sidebar, SidebarFallback, TopActions, TopFallback } from '@/components/AppShell';
import { getT } from '@/lib/i18n/server';

// Startaplar katalogi va kabinetlar: hamma uchun (mehmon, startap, investor) yon menyuli panel
export default async function AppLayout({ children }) {
  const t = await getT();
  return (
    <div className="app">
      <a className="skip" href="#main">
        {t('skip')}
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
          © {new Date().getFullYear()} Investage · {t('footer.short')}
        </footer>
      </div>
    </div>
  );
}
