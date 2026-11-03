"""Topishmoq reels: egasining ovoz yozuvi + 2D qahramonlar (template-riddle.html) + yengil fon musiqasi -> MP4.

Ishlatish:
    python riddle.py scripts/008-....json out/008.mp4
    python riddle.py scripts/008-....json --preview out/008/     # har sahnadan 1 kadr (PNG)

Sahnada "say": diktor matni (ssenariydagi "voice" ovozi bilan, VoiceLab); "clip": [fayl, boshlanish_s, tugash_s] — ovoz
yozuvidan bo'lak; "pause": soniya — ovozsiz sahna.
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import zlib

import imageio_ffmpeg
import numpy as np
from playwright.sync_api import sync_playwright

from music import SR, make_audio
from score import make_cinematic
from sfx import SFX
from render2 import FPS, HERE, open_page, tts
from stick import decode

LEAD, TAIL = 0.15, 0.35
CLEAN = 'highpass=f=85,afftdn=nf=-40,acompressor=threshold=0.12:ratio=2.5:attack=6:release=140:makeup=1.4'
PUNCH = 'highpass=f=70,equalizer=f=3200:t=q:w=1.2:g=3,acompressor=threshold=0.1:ratio=3:attack=4:release=90:makeup=1.6'
TOKEN = re.compile(r'\{([^|}]+)\|([^}]+)\}|(\S+)')
VOWELS = re.compile(r"[aeiou]|o['‘’]", re.I)


def ffilter(sig, af):
    """Mono signalni ffmpeg filtridan o'tkazadi (masalan, atempo — ohangni o'zgartirmay tezlashtirish)."""
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
                          '-af', af, '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-'], input=sig.astype(np.float32).tobytes(),
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def tokens(sub):
    """"{o'ttiz ming|30 000} so'm" -> [(aytiladigan, ekrandagi), ...]. Ekranda apostrof to'g'ri belgiga almashadi."""
    out = []
    for m in TOKEN.finditer(sub):
        said, shown = (m.group(1), m.group(2)) if m.group(1) else (m.group(3), m.group(3))
        shown = re.sub(r"([OoGg])'", '\\1‘', shown).replace("'", '’')
        out.append((said, shown))
    return out


def voiced(sig, frame=0.01):
    fr = int(frame * SR)
    rms = np.sqrt(np.mean(sig[: len(sig) // fr * fr].reshape(-1, fr) ** 2, axis=1))
    return rms > max(0.012, rms.max() * 0.06), fr


def tighten(sig, max_gap, spans=None):
    """Boshi/oxiridagi jimlikni kesadi, ichidagi uzun pauzalarni max_gap gacha qisqartiradi.
    spans ro'yxat bo'lsa, unga qoldirilgan bo'laklar (asl_boshi, asl_oxiri, yangi_boshi) namunalarda yoziladi."""
    on, fr = voiced(sig)
    idx = np.flatnonzero(on)
    if not len(idx):
        return sig
    pad = int(0.03 * SR)
    pieces = [(max(0, idx[0] * fr - pad), idx[0] * fr)]
    i, n = idx[0], len(on)
    while i <= idx[-1]:
        j = i
        while j < n and on[j] == on[i]:
            j += 1
        a, b = i * fr, j * fr
        if not on[i] and (j - i) * fr / SR > max_gap:
            half = int(max_gap * SR / 2)
            pieces += [(a, a + half), (b - half, b)]
        else:
            pieces.append((a, b))
        i = j
    pieces.append(((idx[-1] + 1) * fr, min(len(sig), (idx[-1] + 1) * fr + pad)))
    pos = 0
    for a, b in pieces:
        if spans is not None:
            spans.append((a, b, pos))
        pos += b - a
    return np.concatenate([sig[a:b] for a, b in pieces])


def remap(t, spans):
    """Asl signaldagi vaqt (s) -> tighten dan keyingi vaqt (s); kesilgan pauza ichidagi vaqt keyingi bo'lak boshiga tushadi."""
    x = t * SR
    for a, b, d in spans:
        if x < b:
            return (d + max(0, x - a)) / SR
    a, b, d = spans[-1]
    return (d + b - a) / SR


def align(sig, toks):
    """So'zlar vaqtini topadi: ovozli qismlar bo'g'in soniga qarab bo'linadi, tinish belgisidan keyingi so'z pauzadan keyin boshlanadi."""
    on, fr = voiced(sig)
    w = np.array([max(1, len(VOWELS.findall(said))) for said, _ in toks], float)
    cum = np.concatenate([[0], np.cumsum(w)]) / w.sum()
    vt = np.flatnonzero(on)                          # ovozli kadrlar
    gaps = [(a, b) for a, b in zip(vt[:-1], vt[1:]) if b - a > 6]
    t = [vt[min(len(vt) - 1, int(c * len(vt)))] * fr / SR for c in cum[:-1]] + [(vt[-1] + 1) * fr / SR]
    for k, (said, _) in enumerate(toks[:-1]):
        if re.search(r'[.,:;?!—-]$', said) and gaps:
            a, b = min(gaps, key=lambda g: abs(g[1] * fr / SR - t[k + 1]))
            if abs(b * fr / SR - t[k + 1]) < 0.45:
                t[k + 1] = b * fr / SR
        elif gaps:                                   # so'zlar orasidagi qisqa pauza yaqin bo'lsa, chegarani unga suramiz
            a, b = min(gaps, key=lambda g: abs(g[1] * fr / SR - t[k + 1]))
            if abs(b * fr / SR - t[k + 1]) < 0.12 and t[k] < b * fr / SR:
                t[k + 1] = b * fr / SR
    return [{'t': shown, 'a': round(t[k] * 1000), 'b': round(t[k + 1] * 1000), 'br': bool(re.search(r'[.,:;?!—]$', said))}
            for k, (said, shown) in enumerate(toks)]


def prepare(spec):
    """Har sahna uchun ovoz bo'lagini kesadi va sahna uzunligini ovozga moslaydi."""
    cache, clips = {}, []
    for s in spec['scenes']:
        if s.get('say') and s.get('sub'):
            toks = tokens(s['sub'])
            assert ' '.join(a for a, _ in toks) == s['say'], f"sub va say mos emas: {s['say']}"
            sig = tts(s['say'], spec['voice'], spec.get('rate', 1)).mean(axis=1)
            sig = ffilter(sig, f"atempo={spec.get('tempo', 1)},{PUNCH}")
            sig = tighten(sig, spec.get('maxGap', 0.16))
            words = align(sig, toks)
            if s.get('fromWord'):
                cut = max(0, words[s['fromWord']]['a'] - 40)
                sig = sig[int(cut * SR / 1000):]
                words = [dict(x, a=x['a'] - cut, b=x['b'] - cut) for x in words[s['fromWord']:]]
            s['words'] = words
        elif s.get('say'):
            sig = tts(s['say'], spec['voice'], spec.get('rate', 1)).mean(axis=1)
        elif s.get('clip'):
            f, a, b = s['clip']
            if f not in cache:
                cache[f] = decode(os.path.join(HERE, f), CLEAN)
            sig = cache[f][int(a * SR): int(b * SR)].copy()
            if s.get('sub'):                     # odam yozuvi: biroz tezlashtirib, pauzalarni qisqartirib, so'z vaqtlarini topamiz
                if spec.get('clipTempo', 1) != 1:
                    sig = ffilter(sig, f"atempo={spec['clipTempo']}")
                spans = []
                sig = tighten(sig, spec.get('clipGap', 0.25), spans)
                if s.get('wordsAt'):             # Whisper aniqlagan so'z vaqtlari (asl fayl soniyalarida)
                    k = spec.get('clipTempo', 1)
                    s['words'] = [{'t': w, 'a': round(remap((wa - a) / k, spans) * 1000), 'b': round(remap((wb - a) / k, spans) * 1000),
                                   'br': bool(re.search(r'[.,:;?!—]$', w))} for w, wa, wb in s['wordsAt']]
                else:
                    s['words'] = align(sig, tokens(s['sub']))
        if s.get('say') or s.get('clip'):
            n = min(len(sig) // 2, 600)
            sig[:n] *= np.linspace(0, 1, n)
            sig[-n:] *= np.linspace(1, 0, n)
            lead, tail = spec.get('lead', LEAD), spec.get('tail', TAIL)
            s['voiceDur'] = len(sig) / SR
            s['lead'] = lead * 1000
            s['dur'] = max(float(s.get('dur', 0) or 0), lead + len(sig) / SR + tail)
            clips.append(np.stack([sig, sig], axis=1))
        else:
            s['dur'] = float(s.get('pause', s.get('dur', 3)))
            clips.append(None)
    return clips


def audio(spec, clips, bounds, duration):
    wav = os.path.join(tempfile.gettempdir(), 'investage_riddle_audio.wav')
    voices = [(a / 1000 + s.get('lead', LEAD * 1000) / 1000, c) for (a, _), c, s in zip(bounds, clips, spec['scenes']) if c is not None]
    hits = [a / 1000 + 0.1 for (a, _), s in zip(bounds, spec['scenes']) if s.get('hit')]
    # "sfx": [[nom, vaqt, balandlik], ...] — vaqt soniyada sahna boshidan yoki "w3" (3-so'z aytilgan payt)
    extra = []
    for (a, _), s in zip(bounds, spec['scenes']):
        for name, at, gain in s.get('sfx', []):
            if isinstance(at, str):
                at = (s.get('lead', 0) + s['words'][int(at[1:])]['a']) / 1000
            extra.append((a / 1000 + at, SFX[name]() * gain))
    secs, seed = [(a / 1000, b / 1000) for a, b in bounds], spec.get('seed', zlib.crc32(b'riddle') % 1000)
    if spec.get('score') == 'cinematic':
        make_cinematic(spec['scenes'], secs, duration, wav, seed, voices, spec.get('music', 0.35), hits, extra, spec.get('whoosh', 1.0))
    else:
        make_audio(secs, duration, wav, seed, voices, spec.get('music', 0.35), hits, extra, spec.get('whoosh', 1.0))
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
