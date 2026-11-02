"""Topishmoq reels: egasining ovoz yozuvi + 2D qahramonlar (template-riddle.html) + yengil fon musiqasi -> MP4.

Ishlatish:
    python riddle.py scripts/008-....json out/008.mp4
    python riddle.py scripts/008-....json --preview out/008/     # har sahnadan 1 kadr (PNG)

Sahnada "say": diktor matni (ssenariydagi "voice" ovozi bilan, VoiceLab); "clip": [fayl, boshlanish_s, tugash_s] — ovoz
yozuvidan bo'lak; "pause": soniya — ovozsiz sahna.
"""
import json
import os
import subprocess
import sys
import tempfile
import zlib

import imageio_ffmpeg
import numpy as np
from playwright.sync_api import sync_playwright

from music import SR, make_audio
from render2 import FPS, HERE, open_page, tts
from stick import decode

LEAD, TAIL = 0.15, 0.35
CLEAN = 'highpass=f=85,afftdn=nf=-40,acompressor=threshold=0.12:ratio=2.5:attack=6:release=140:makeup=1.4'


def prepare(spec):
    """Har sahna uchun ovoz bo'lagini kesadi va sahna uzunligini ovozga moslaydi."""
    cache, clips = {}, []
    for s in spec['scenes']:
        if s.get('say'):
            sig = tts(s['say'], spec['voice'], spec.get('rate', 1)).mean(axis=1)
        elif s.get('clip'):
            f, a, b = s['clip']
            if f not in cache:
                cache[f] = decode(os.path.join(HERE, f), CLEAN)
            sig = cache[f][int(a * SR): int(b * SR)].copy()
        if s.get('say') or s.get('clip'):
            n = min(len(sig) // 2, 600)
            sig[:n] *= np.linspace(0, 1, n)
            sig[-n:] *= np.linspace(1, 0, n)
            s['voiceDur'] = len(sig) / SR
            s['lead'] = LEAD * 1000
            s['dur'] = max(float(s.get('dur', 0) or 0), LEAD + len(sig) / SR + TAIL)
            clips.append(np.stack([sig, sig], axis=1))
        else:
            s['dur'] = float(s.get('pause', s.get('dur', 3)))
            clips.append(None)
    return clips


def audio(spec, clips, bounds, duration):
    wav = os.path.join(tempfile.gettempdir(), 'investage_riddle_audio.wav')
    voices = [(a / 1000 + LEAD, c) for (a, _), c in zip(bounds, clips) if c is not None]
    hits = [a / 1000 + 0.1 for (a, _), s in zip(bounds, spec['scenes']) if s.get('hit')]
    make_audio([(a / 1000, b / 1000) for a, b in bounds], duration, wav, zlib.crc32(b'riddle') % 1000, voices, spec.get('music', 0.35), hits)
    return wav


def render(spec, out):
    clips = prepare(spec)
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    with sync_playwright() as p:
        browser, page, info = open_page(p, spec)
        dur = info['duration'] / 1000
        wav = audio(spec, clips, info['bounds'], dur)
        cmd = [ff, '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
               '-i', wav, '-vf', 'scale=out_range=tv,format=yuv420p', '-color_range', 'tv', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
               '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for i in range(int(dur * FPS)):
            page.evaluate('ms => window.seek(ms)', i * 1000 / FPS)
            proc.stdin.write(page.screenshot(type='jpeg', quality=92))
        proc.stdin.close()
        rc = proc.wait()
        browser.close()
    if rc != 0:
        raise SystemExit('ffmpeg xato bilan tugadi')
    print(f'{out}: {dur:.1f}s, {os.path.getsize(out) // 1024} KB')


def preview(spec, outdir):
    os.makedirs(outdir, exist_ok=True)
    prepare(spec)
    with sync_playwright() as p:
        browser, page, info = open_page(p, spec)
        for i, (a, b) in enumerate(info['bounds']):
            page.evaluate('ms => window.seek(ms)', min(b - 250, a + 1800))
            path = os.path.join(outdir, f'scene{i + 1:02d}.png')
            page.screenshot(path=path)
            print(path, round(a / 1000, 1))
        browser.close()


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    with open(sys.argv[1], encoding='utf-8') as fh:
        data = json.load(fh)
    if sys.argv[2] == '--preview':
        preview(data, sys.argv[3])
    else:
        render(data, sys.argv[2])
