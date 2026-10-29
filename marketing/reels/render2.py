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
VOICE = 'uz-UZ-SardorNeural'      # yoki uz-UZ-MadinaNeural; ssenariyda "voice" bilan almashtiriladi
VOICE_LEAD = 0.35                 # sahna boshlangach ovoz shuncha soniyadan keyin kiradi
VOICE_TAIL = 0.7                  # ovoz tugagach sahna yana shuncha davom etadi


def tts(text, voice, rate):
    """Matnni o'zbekcha neyron ovozga aylantiradi; (n, 2) float massiv qaytaradi."""
    mp3 = os.path.join(tempfile.gettempdir(), f'investage_tts_{zlib.crc32((voice + rate + text).encode())}.mp3')
    if not os.path.exists(mp3):
        asyncio.run(edge_tts.Communicate(text, voice, rate=rate).save(mp3))
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-i', mp3, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).reshape(-1, 2).astype(np.float32) / 32768


def prepare_voice(spec):
    """Har sahnadagi "say" matnini ovozlashtiradi va sahna uzunligini ovozga moslaydi."""
    voice, rate = spec.get('voice', VOICE), spec.get('rate', '+6%')
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
