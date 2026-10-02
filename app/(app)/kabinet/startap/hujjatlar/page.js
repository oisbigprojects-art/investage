import Link from 'next/link';
import { startupContext } from '@/lib/cabinet';
import { getDocuments } from '@/lib/data';
import { withLinks, DOC_LIMIT } from '@/lib/docs';
import { getT } from '@/lib/i18n/server';
import { pickStrings } from '@/lib/i18n';
import { Flash } from '@/components/ui';
import DocList from '@/components/DocList';
import DocUpload from '@/components/DocUpload';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.documents') };
}

const KEYS = [
  'doc.choose', 'doc.formats', 'doc.kind', 'doc.title_label', 'doc.title_ph', 'doc.upload', 'doc.uploading', 'doc.uploaded',
  'doc.err_type', 'doc.err_size', 'doc.err_title', 'doc.err_upload', 'doc.err_limit',
  'doc.kind_pitch', 'doc.kind_finance', 'doc.kind_legal', 'doc.kind_other',
];

// Startap hujjatlari: pitch deck, moliyaviy model va boshqalar. Faqat ruxsat olgan investorlar ko'radi.
export default async function DocumentsPage({ searchParams }) {
  const sp = await searchParams;
  const [{ supabase, s }, t] = await Promise.all([startupContext(), getT()]);
  const docs = await withLinks(supabase, await getDocuments(s.id));
  const full = docs.length >= DOC_LIMIT;

  return (
    <>
      <div className="page-head">
        <span className="role-tag">{t('cab.startup')}</span>
        <h1>{t('doc.title')}</h1>
        <p className="muted">{t('doc.sub')}</p>
      </div>
      <Flash searchParams={sp} />

      <div className="cab-cols docs-cols">
        <section className="card">
          <div className="section-head sm">
            <h2>{t('doc.list_title')}</h2>
            <span className="chip chip-muted">{docs.length} / {DOC_LIMIT}</span>
          </div>
          <DocList docs={docs} t={t} canDelete empty={t('doc.empty')} />
        </section>

        <section className="card">
          <h2>{t('doc.add_title')}</h2>
          {full && <div className="flash flash-warn">{t('doc.err_limit')}</div>}
          <DocUpload startupId={s.id} labels={pickStrings(t, KEYS)} full={full} />
          <div className="doc-privacy small">
            <strong>{t('doc.who_title')}</strong>
            <p className="muted">{t('doc.who_text')}</p>
            <Link href="/kabinet/startap/sorovlar?holat=ruxsat">{t('doc.who_link')} →</Link>
          </div>
        </section>
      </div>
    </>
  );
}
