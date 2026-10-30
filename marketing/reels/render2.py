"""Investage Reels 2.0: JSON ssenariy -> HTML motion-grafika (template.html) + original musiqa -> MP4.

Ishlatish:
    python render2.py scripts/002-....json out/002.mp4
    python render2.py scripts/002-....json --preview out/002/     # har sahnadan 1 kadr (PNG)

Ssenariy formati render.py dagi bilan bir xil (hook, point, stat, quote, cta).
"""
import json
import os
import subprocess
import sys
import tempfile
import zlib

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

import asyncio

import edge_tts
import numpy as np

from music import SR, make_audio

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
VOICE = 'aisha:Gulnoza:Cheerful'  # ssenariyda "voice" bilan almashtiriladi; "rate" — Aisha uchun tezlik (0 = standart, 0.5–2.0)
VOICE_LEAD = 0.35                 # sahna boshlangach ovoz shuncha soniyadan keyin kiradi
VOICE_TAIL = 0.7                  # ovoz tugagach sahna yana shuncha davom etadi


AISHA_URL = 'https://back.aisha.group'


VOICELAB_URL = 'https://api.voicelab.uz'


def aisha_key():
    """API kalit marketing/reels/.env faylidan (VOICELAB_API_KEY=... yoki AISHA_API_KEY=...) yoki muhit o'zgaruvchisidan olinadi.
    Fayl gitga tushmaydi. VoiceLab (Aisha dasturchilar platformasi) kalitlari "vlk_" bilan boshlanadi."""
    names = ('VOICELAB_API_KEY', 'AISHA_API_KEY')
    key = next((os.environ[n] for n in names if os.environ.get(n)), None)
    env = os.path.join(HERE, '.env')
    if not key and os.path.exists(env):
        for line in open(env, encoding='utf-8'):
            name, _, val = line.strip().partition('=')
            if name in names and val.strip():
                key = val.strip().strip('"\'')
    if not key:
        raise SystemExit('Kalit topilmadi: marketing/reels/.env fayliga VOICELAB_API_KEY=vlk_... deb yozing')
    return key


def voicelab_voices(language='uz'):
    """Kalit bilan ochiq ovozlar ro'yxati: [(voice_id, nom, til), ...]."""
    import requests
    r = requests.get(f'{VOICELAB_URL}/v1/voices', headers={'Authorization': 'Bearer ' + aisha_key()}, timeout=60)
    if r.status_code != 200:
        raise SystemExit(f'VoiceLab ovozlar ro\'yxati xatosi {r.status_code}: {r.text[:200]}')
    body = r.json()
    items = body if isinstance(body, list) else next((body[k] for k in ('data', 'voices', 'items', 'results') if isinstance(body.get(k), list)), [])
    out = []
    for v in items:
        langs = v.get('language') or v.get('languages') or ''
        if not language or language in (langs if isinstance(langs, list) else str(langs)):
            out.append((v.get('id') or v.get('voice_id'), v.get('name'), langs))
    return out


def voicelab_tts(text, voice_id, speed, path):
    """VoiceLab TTS: 24 kHz WAV qaytaradi. 202 bo'lsa status_url so'rab kutadi."""
    import time
    import uuid
    import requests
    hdr = {'Authorization': 'Bearer ' + aisha_key(), 'Idempotency-Key': str(uuid.uuid4())}
    body = {'text': text, 'language': 'uz', 'voice_id': voice_id}
    if speed:
        body['speed'] = float(speed)
    r = requests.post(f'{VOICELAB_URL}/v1/tts', headers=hdr, json=body, timeout=180)
    if r.status_code == 202:
        status_url = r.json()['status_url']
        if status_url.startswith('/'):
            status_url = VOICELAB_URL + status_url
        for _ in range(60):
            time.sleep(2)
            r = requests.get(status_url, headers={'Authorization': hdr['Authorization']}, timeout=60)
            if r.status_code == 200 and r.headers.get('content-type', '').startswith('audio'):
                break
    if r.status_code != 200 or not r.headers.get('content-type', '').startswith('audio'):
        raise SystemExit(f'VoiceLab TTS xatosi {r.status_code}: {r.text[:300]}')
    with open(path, 'wb') as fh:
        fh.write(r.content)


def aisha_tts(text, model, mood, speed, path):
    """Aisha AI (o'zbek ona tilidagi ovoz). Sinxron so'rov, javobda audio_path qaytadi; faylni yuklab olamiz."""
    import requests
    hdr = {'X-Api-Key': aisha_key()}
    r = requests.post(f'{AISHA_URL}/api/v1/tts/post/', headers=hdr, timeout=120,
                      data={'transcript': text, 'language': 'uz', 'model': model, 'mood': mood, 'speed': speed})
    if r.status_code == 402:
        raise SystemExit('Aisha: balans yetarli emas (402). aisha.group da hisobni to\'ldiring.')
    if r.status_code not in (200, 201):
        raise SystemExit(f'Aisha TTS xatosi {r.status_code}: {r.text[:300]}')
    audio = r.json()['audio_path']
    url = audio if audio.startswith('http') else AISHA_URL + audio
    a = requests.get(url, headers=hdr, timeout=120)
    a.raise_for_status()
    with open(path, 'wb') as fh:
        fh.write(a.content)


def tts(text, voice, rate):
    """Matnni ovozga aylantiradi; (n, 2) float massiv qaytaradi.
    voice: "aisha:Gulnoza:Cheerful" — Aisha AI (tavsiya); "uz-UZ-...Neural" — Microsoft (aksent bor, faqat sinov uchun)."""
    key = zlib.crc32((voice + str(rate) + text).encode())
    if voice.startswith('voicelab:'):
        src = os.path.join(tempfile.gettempdir(), f'investage_tts_{key}.wav')
        if not os.path.exists(src):
            voicelab_tts(text, voice.split(':', 1)[1], rate if isinstance(rate, (int, float)) else 0, src)
    elif voice.startswith('aisha'):
        _, model, mood = (voice.split(':') + ['Gulnoza', 'Neutral'])[:3]
        src = os.path.join(tempfile.gettempdir(), f'investage_tts_{key}.wav')
        if not os.path.exists(src):
            aisha_tts(text, model or 'Gulnoza', mood or 'Neutral', rate if isinstance(rate, (int, float)) else 0, src)
    else:
        src = os.path.join(tempfile.gettempdir(), f'investage_tts_{key}.mp3')
        if not os.path.exists(src):
            asyncio.run(edge_tts.Communicate(text, voice, rate=rate).save(src))
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-i', src, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).reshape(-1, 2).astype(np.float32) / 32768


def mouth_env(sig):
    """Og'iz harakati uchun: har kadrga (30 fps) 0..1 ovoz balandligi."""
    hop = SR // FPS
    mono = np.abs(sig).mean(axis=1)
    env = np.array([mono[i:i + hop].mean() for i in range(0, len(mono), hop)])
    env = np.clip(env / (np.percentile(env, 92) + 1e-9), 0, 1)
    return [round(float(x), 2) for x in np.convolve(env, [.25, .5, .25], mode='same')]


def prepare_voice(spec):
    """Har sahnadagi "say" matnini ovozlashtiradi va sahna uzunligini ovozga moslaydi."""
    voice = spec.get('voice', VOICE)
    rate = spec.get('rate', 0 if voice.startswith('aisha') else '+6%')
    cast = spec.get('voices', {})   # "Agar...?" seriali: har qahramonga alohida ovoz ("speaker" bo'yicha)
    lead, tail = spec.get('lead', VOICE_LEAD), spec.get('tail', VOICE_TAIL)
    clips = []
    for s in spec['scenes']:
        if s.get('say'):
            sig = tts(s['say'], cast.get(s.get('speaker'), voice), rate)
            if cast:
                sig = sig * (0.1 / (np.sqrt(np.mean(sig ** 2)) + 1e-9))   # ovozlar balandligini tenglash
                s['env'] = mouth_env(sig)
                s['voiceDur'] = len(sig) / SR
                s['lead'] = lead * 1000
            s['dur'] = max(float(s.get('dur', 0) or 0), lead + len(sig) / SR + tail)
            clips.append(sig)
        else:
            clips.append(None)
    return clips


def open_page(p, spec):
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
    page.goto('file:///' + os.path.join(HERE, spec.get('template', 'template.html')).replace('\\', '/'))
    page.evaluate('document.fonts.ready')
    info = page.evaluate('spec => window.build(spec)', spec)
    page.evaluate('document.fonts.ready')
    return browser, page, info


def render(spec, out):
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    clips = prepare_voice(spec)
    with sync_playwright() as p:
        browser, page, info = open_page(p, spec)
        dur_ms = info['duration']
        bounds = [(a / 1000, b / 1000) for a, b in info['bounds']]
        wav = os.path.join(tempfile.gettempdir(), 'investage_reel_audio.wav')
        seed = zlib.crc32(json.dumps(spec, ensure_ascii=False).encode()) % 1000
        lead = spec.get('lead', VOICE_LEAD)
        voices = [(a + lead, c) for (a, _), c in zip(bounds, clips) if c is not None]
        hits = [a + s.get('dropAt', 700) / 1000 for (a, _), s in zip(bounds, spec['scenes']) if s.get('share') is not None]
        make_audio(bounds, dur_ms / 1000, wav, seed, voices, spec.get('music', 1.0), hits)
        cmd = [ff, '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
               '-i', wav, '-vf', 'scale=out_range=tv,format=yuv420p', '-color_range', 'tv', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
               '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        frames = int(dur_ms / 1000 * FPS)
        for i in range(frames):
            page.evaluate('ms => window.seek(ms)', i * 1000 / FPS)
            proc.stdin.write(page.screenshot(type='jpeg', quality=92))
        proc.stdin.close()
        rc = proc.wait()
        browser.close()
    if rc != 0:
        raise SystemExit('ffmpeg xato bilan tugadi')
    print(f'{out}: {dur_ms / 1000:.1f}s, {os.path.getsize(out) // 1024} KB')


def preview(spec, outdir):
    os.makedirs(outdir, exist_ok=True)
    prepare_voice(spec)
    with sync_playwright() as p:
        browser, page, info = open_page(p, spec)
        for i, (a, b) in enumerate(info['bounds']):
            ms = min(b - 300, a + 2600)
            page.evaluate('ms => window.seek(ms)', ms)
            path = os.path.join(outdir, f'scene{i + 1}.png')
            page.screenshot(path=path)
            print(path)
        browser.close()


if __name__ == '__main__':
    if len(sys.argv) >= 2 and sys.argv[1] == '--voices':
        # Kalit bilan ochiq o'zbekcha ovozlar (ssenariyda "voice": "voicelab:<id>" deb ishlatiladi)
        for vid, name, langs in voicelab_voices(sys.argv[2] if len(sys.argv) > 2 else 'uz'):
            print(vid, '|', name, '|', langs)
        sys.exit(0)
    if len(sys.argv) >= 3 and sys.argv[1] == '--say':
        # Bitta jumlani ovozlashtirib WAV ga yozadi (ovozni tanlash uchun): --say voicelab:<id> "matn" chiqish.wav
        voice, text, out = sys.argv[2], sys.argv[3], sys.argv[4]
        sig = tts(text, voice, 0)
        import wave
        with wave.open(out, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(sig, -1, 1) * 32767).astype(np.int16).tobytes())
        print(out, f'{len(sig) / SR:.1f}s')
        sys.exit(0)
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    with open(sys.argv[1], encoding='utf-8') as fh:
        spec = json.load(fh)
    if sys.argv[2] == '--preview':
        preview(spec, sys.argv[3])
    else:
        render(spec, sys.argv[2])
