// Hujjatlar uchun umumiy yordamchilar (server)
export const DOC_KINDS = ['pitch', 'finance', 'legal', 'other'];
export const DOC_LIMIT = 15;
export const DOC_MAX_BYTES = 10 * 1024 * 1024;

// Yopiq "docs" omboridagi fayllar uchun 1 soatlik havolalar (RLS: egasi yoki ruxsat olgan investor).
// "/demo-docs/..." — namuna startaplarning ochiq fayllari.
export async function withLinks(supabase, docs) {
  const stored = docs.filter((d) => !d.path.startsWith('/')).map((d) => d.path);
  const urls = {};
  if (stored.length) {
    const { data } = await supabase.storage.from('docs').createSignedUrls(stored, 3600);
    for (const row of data || []) if (row.signedUrl) urls[row.path] = row.signedUrl;
  }
  return docs.map((d) => ({ ...d, url: d.path.startsWith('/') ? d.path : urls[d.path] || null }));
}

export function fileSize(bytes, t) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return t('doc.kb', { n: Math.max(1, Math.round(bytes / 1024)) });
  return t('doc.mb', { n: (bytes / 1024 / 1024).toFixed(1) });
}

export function fileExt(d) {
  const m = /\.([a-z0-9]{2,5})$/i.exec(d.path || '');
  return m ? m[1].toUpperCase() : '';
}
