'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserClient } from '@/lib/supabase/browser';
import { stringsT } from '@/lib/i18n/client';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';

const MAX = 50 * 1024 * 1024;
const TYPES = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
const PREFIX = '/storage/v1/object/public/videos/';
const pathOf = (url) => (url && url.includes(PREFIX) ? url.split(PREFIX)[1] : null);

// supabase-js yuklash foizini bermaydi, shuning uchun XHR bilan to'g'ridan-to'g'ri Storage'ga yuboramiz
function send(path, file, token, onProgress) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/videos/${path}`);
    xhr.setRequestHeader('authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('content-type', file.type);
    xhr.setRequestHeader('cache-control', 'max-age=31536000');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(file);
  });
}

// Video pitch: fayl to'g'ridan-to'g'ri omborga ketadi (server orqali o'tmaydi), keyin startapga yoziladi
export default function VideoPitch({ startupId, userId, url, strings, lang }) {
  const t = stringsT(strings, lang);
  const router = useRouter();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pct, setPct] = useState(0);

  const save = async (videoUrl) => {
    const { error } = await browserClient().from('startups').update({ video_url: videoUrl }).eq('id', startupId);
    return error;
  };

  async function pick(file) {
    if (!file) return;
    setMsg(null);
    const ext = TYPES[file.type];
    if (!ext) return setMsg({ bad: true, text: t('vid.err_type') });
    if (file.size > MAX) return setMsg({ bad: true, text: t('vid.err_size') });
    setBusy(true);
    setPct(0);
    const storage = browserClient().storage.from('videos');
    const path = `${userId}/pitch-${Date.now()}.${ext}`;
    const { data: auth } = await browserClient().auth.getSession();
    const ok = auth.session && (await send(path, file, auth.session.access_token, setPct));
    if (!ok) {
      setBusy(false);
      return setMsg({ bad: true, text: t('vid.err_upload') });
    }
    const { data } = storage.getPublicUrl(path);
    const error = await save(data.publicUrl);
    if (error) {
      await storage.remove([path]);
      setBusy(false);
      return setMsg({ bad: true, text: t('vid.err_upload') });
    }
    const old = pathOf(url);
    if (old) await storage.remove([old]);
    setBusy(false);
    setMsg({ bad: false, text: t('vid.saved') });
    if (input.current) input.current.value = '';
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(t('vid.remove_confirm'))) return;
    setBusy(true);
    setMsg(null);
    const error = await save(null);
    const old = pathOf(url);
    if (!error && old) await browserClient().storage.from('videos').remove([old]);
    setBusy(false);
    if (error) return setMsg({ bad: true, text: t('vid.err_upload') });
    router.refresh();
  }

  return (
    <section className="card video-card">
      <div className="form-block-head">
        <h3>{t('vid.title')}</h3>
        <span className="chip chip-muted">{t('vid.public')}</span>
      </div>
      <p className="muted small">{t('vid.hint')}</p>
      {url && <video className="pitch-video" src={url} controls playsInline preload="metadata" />}
      <label className="drop">
        <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => pick(e.target.files?.[0])} disabled={busy} />
        <strong>{busy ? `${t('vid.uploading')} ${pct}%` : url ? t('vid.replace') : t('vid.choose')}</strong>
        <span className="muted small">{t('vid.formats')}</span>
      </label>
      {busy && <progress className="pitch-progress" max="100" value={pct} />}
      {url && !busy && (
        <button className="btn btn-ghost btn-sm" type="button" onClick={remove}>{t('vid.remove')}</button>
      )}
      {msg && <div className={`flash ${msg.bad ? 'flash-bad' : 'flash-ok'}`} role={msg.bad ? 'alert' : 'status'}>{msg.text}</div>}
    </section>
  );
}
