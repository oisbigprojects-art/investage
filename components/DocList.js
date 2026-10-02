import { FileIcon, DownloadIcon } from './icons';
import { fileSize, fileExt } from '@/lib/docs';
import { formatDate } from '@/lib/labels';
import { deleteDocument } from '@/app/connect-actions';

// Hujjatlar ro'yxati: startap egasiga o'chirish tugmasi bilan, investorga faqat ochish
export default function DocList({ docs, t, canDelete = false, empty }) {
  if (!docs.length) return <p className="muted small">{empty}</p>;
  return (
    <ul className="docs">
      {docs.map((d) => (
        <li key={d.id} className="doc">
          <span className={`doc-ico doc-${d.kind}`} aria-hidden="true">
            <FileIcon size={20} />
            {fileExt(d) && <em>{fileExt(d)}</em>}
          </span>
          <div className="doc-main">
            {d.url ? (
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="doc-title">{d.title}</a>
            ) : (
              <span className="doc-title">{d.title}</span>
            )}
            <span className="muted small">
              {t(`doc.kind_${d.kind}`)}
              {d.size ? <> · {fileSize(d.size, t)}</> : null} · {formatDate(d.created_at, t)}
            </span>
          </div>
          <div className="doc-actions">
            {d.url && (
              <a className="btn btn-ghost btn-sm" href={d.url} target="_blank" rel="noopener noreferrer" aria-label={`${t('doc.open')}: ${d.title}`}>
                <DownloadIcon size={16} /> <span>{t('doc.open')}</span>
              </a>
            )}
            {canDelete && (
              <form action={deleteDocument}>
                <input type="hidden" name="doc_id" value={d.id} />
                <button className="btn btn-danger btn-sm" type="submit">{t('doc.delete')}</button>
              </form>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
