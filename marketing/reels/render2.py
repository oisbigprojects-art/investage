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


def aisha_key():
    """API kalit marketing/reels/.env faylidan (AISHA_API_KEY=...) yoki muhit o'zgaruvchisidan olinadi. Fayl gitga tushmaydi."""
    key = os.environ.get('AISHA_API_KEY')
    env = os.path.join(HERE, '.env')
    if not key and os.path.exists(env):
        for line in open(env, encoding='utf-8'):
            if line.strip().startswith('AISHA_API_KEY='):
                key = line.split('=', 1)[1].strip().strip('"\'')
    if not key:
        raise SystemExit('AISHA_API_KEY topilmadi: marketing/reels/.env fayliga AISHA_API_KEY=... deb yozing')
    return key


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
    if voice.startswith('aisha'):
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


def prepare_voice(spec):
    """Har sahnadagi "say" matnini ovozlashtiradi va sahna uzunligini ovozga moslaydi."""
    voice = spec.get('voice', VOICE)
    rate = spec.get('rate', 0 if voice.startswith('aisha') else '+6%')
    clips = []
    for s in spec['scenes']:
        if s.get('say'):
            sig = tts(s['say'], voice, rate)
            s['dur'] = max(float(s.get('dur', 0) or 0), VOICE_LEAD + len(sig) / SR + VOICE_TAIL)
            clips.append(sig)
        else:
            clips.append(None)
    return clips


def open_page(p, spec):
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
    page.goto('file:///' + os.path.join(HERE, 'template.html').replace('\\', '/'))
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
        voices = [(a + VOICE_LEAD, c) for (a, _), c in zip(bounds, clips) if c is not None]
        make_audio(bounds, dur_ms / 1000, wav, seed, voices)
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
            ms = min(b - 450, a + 2600)
            page.evaluate('ms => window.seek(ms)', ms)
            path = os.path.join(outdir, f'scene{i + 1}.png')
            page.screenshot(path=path)
            print(path)
        browser.close()


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    with open(sys.argv[1], encoding='utf-8') as fh:
        spec = json.load(fh)
    if sys.argv[2] == '--preview':
        preview(spec, sys.argv[3])
    else:
        render(spec, sys.argv[2])
