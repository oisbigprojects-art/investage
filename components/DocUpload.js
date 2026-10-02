'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserClient } from '@/lib/supabase/browser';

const KINDS = ['pitch', 'finance', 'legal', 'other'];
const MAX = 10 * 1024 * 1024;
const ACCEPT = '.pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx,.png,.jpg,.jpeg';
const OK_EXT = /\.(pdf|pptx?|xlsx?|docx?|png|jpe?g)$/i;

// Hujjat yuklash: fayl to'g'ridan-to'g'ri yopiq omborga ketadi (startapning o'z papkasi), keyin ro'yxatga yoziladi
export default function DocUpload({ startupId, labels: L, full }) {
  const router = useRouter();
  const fileRef = useRef(null);
  const [kind, setKind] = useState('pitch');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  function pick(f) {
    setMsg(null);
    if (!f) return setFile(null);
    if (!OK_EXT.test(f.name)) {
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      return setMsg({ bad: true, text: L['doc.err_type'] });
    }
    if (f.size > MAX) {
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      return setMsg({ bad: true, text: L['doc.err_size'] });
    }
    setFile(f);
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 120));
  }

  async function submit(e) {
    e.preventDefault();
    if (!file || busy || full) return;
    const name = title.trim().slice(0, 120);
    if (!name) return setMsg({ bad: true, text: L['doc.err_title'] });
    setBusy(true);
    setMsg(null);
    const supabase = browserClient();
    const ext = (/\.([a-z0-9]{2,5})$/i.exec(file.name)?.[1] || 'bin').toLowerCase();
    const path = `${startupId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const up = await supabase.storage.from('docs').upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (up.error) {
      setBusy(false);
      return setMsg({ bad: true, text: /mime|type/i.test(up.error.message) ? L['doc.err_type'] : /size|large/i.test(up.error.message) ? L['doc.err_size'] : L['doc.err_upload'] });
    }
    const { error } = await supabase.from('startup_documents').insert({ startup_id: startupId, kind, title: name, path, size: file.size, mime: file.type || null });
    if (error) {
      await supabase.storage.from('docs').remove([path]);
      setBusy(false);
      return setMsg({ bad: true, text: /chegara/i.test(error.message) ? L['doc.err_limit'] : L['doc.err_upload'] });
    }
    setBusy(false);
    setFile(null);
    setTitle('');
    if (fileRef.current) fileRef.current.value = '';
    setMsg({ bad: false, text: L['doc.uploaded'] });
    router.refresh();
  }

  return (
    <form className="form doc-upload" onSubmit={submit}>
      <label className={`drop ${file ? 'has-file' : ''}`}>
        <input ref={fileRef} type="file" accept={ACCEPT} onChange={(e) => pick(e.target.files?.[0])} disabled={busy || full} />
        <strong>{file ? file.name : L['doc.choose']}</strong>
        <span className="muted small">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : L['doc.formats']}</span>
      </label>
      <div className="two">
        <label>
          {L['doc.kind']}
          <select value={kind} onChange={(e) => setKind(e.target.value)} disabled={busy}>
            {KINDS.map((k) => (
              <option key={k} value={k}>{L[`doc.kind_${k}`]}</option>
            ))}
          </select>
        </label>
        <label>
          {L['doc.title_label']}
          <input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder={L['doc.title_ph']} disabled={busy} />
        </label>
      </div>
      {msg && <div className={`flash ${msg.bad ? 'flash-bad' : 'flash-ok'}`} role={msg.bad ? 'alert' : 'status'}>{msg.text}</div>}
      <button className="btn btn-gold" type="submit" disabled={!file || busy || full}>
        {busy ? L['doc.uploading'] : L['doc.upload']}
      </button>
    </form>
  );
}
