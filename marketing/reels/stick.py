"""Stickman reels: ovoz + tovush effektlari + qo'lda chizilgandek animatsiya (musiqasiz) -> MP4.

Ishlatish:
    python stick.py scripts/005-....json out/005.mp4
    python stick.py scripts/005-....json --sheet out/005/          # har 1.5 soniyadan kadrlar varag'i (PNG)
    python stick.py scripts/005-....json out/005-ru.mp4 --lang ru  # ruscha yozuvlar bilan (caption: "caption_ru")

Ssenariy: {"episode": "yoq", "caption": "...", "lines": {nom: manba}}. Manba turlari:
    {"voice": "voicelab:<id>", "text": "..."}                  VoiceLab, yo'q bo'lsa "fallback" ishlatiladi
    {"fallback": {"edge": "uz-UZ-SardorNeural", "text": "...", "pitch": "-20Hz", "rate": "-5%"}}
    {"clip": {"voice": "...", "rate": 1.05, "text": "...", "part": 0}}   oldin yaratilgan ovozdan bitta gapni qirqib oladi
    {"file": "out/voice/x.ogg", "from": 1.2, "to": 3.4}                  haqiqiy ovoz yozuvidan bo'lak (shovqin tozalanadi)
    {"silent": 0.5, "sound": "buzz", "rate": 1}                          ovozsiz qator: pufakcha turadi, sfx.py dagi tovush chalinadi
"""
import asyncio
import json
import os
import subprocess
import sys
import tempfile
import wave
import zlib

import edge_tts
import imageio_ffmpeg
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

from music import SR
from render2 import FPS, HERE, mouth_env, tts
from sfx import mix


def decode(src, af=None):
    filt = ['-af', af] if af else []
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-i', src, *filt, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768


def edge(spec):
    key = zlib.crc32(json.dumps(spec, sort_keys=True).encode())
    src = os.path.join(tempfile.gettempdir(), f'investage_edge_{key}.mp3')
    if not os.path.exists(src):
        asyncio.run(edge_tts.Communicate(spec['text'], spec['edge'], rate=spec.get('rate', '+0%'), pitch=spec.get('pitch', '+0Hz')).save(src))
    return decode(src)


def parts(sig, gap=0.16):
    """Ovozni jimlik bo'yicha gaplarga bo'ladi: [(boshlanish, tugash), ...] namunalarda."""
    hop = SR // 100
    env = np.array([np.abs(sig[i:i + hop]).mean() for i in range(0, len(sig), hop)])
    on = env > env.max() * 0.04
    out, start, quiet = [], None, 0
    for i, v in enumerate(on):
        if v:
            start = i if start is None else start
            quiet = 0
        elif start is not None:
            quiet += 1
            if quiet >= gap * 100:
                out.append((start * hop, (i - quiet + 1) * hop))
                start = None
    if start is not None:
        out.append((start * hop, len(sig)))
    return out


def trim(sig):
    idx = np.nonzero(np.abs(sig) > np.abs(sig).max() * 0.03)[0]
    return sig[max(0, idx[0] - 400): idx[-1] + 2400]


def line(src):
    if 'silent' in src:
        return np.zeros(int(src['silent'] * SR), dtype=np.float32)
    if 'file' in src:
        sig = decode(os.path.join(HERE, src['file']), 'highpass=f=85,afftdn=nf=-40,acompressor=threshold=0.12:ratio=2.5:attack=6:release=140:makeup=1.4')
        sig = sig[int(src['from'] * SR): int(src['to'] * SR)]
        f = np.minimum(1, np.minimum(np.arange(len(sig)), np.arange(len(sig))[::-1]) / 500)
        return sig * f * (src.get('gain', 1) * 0.17 / (np.sqrt(np.mean(sig ** 2)) + 1e-9))
    if 'clip' in src:
        c = src['clip']
        sig = tts(c['text'], c['voice'], c.get('rate', 1)).mean(axis=1)
        chunks = parts(sig, c.get('gap', 0.16))
        a, b = chunks[c.get('part', 0)]
        if c.get('to') is not None:
            b = chunks[c['to']][1]
        sig = sig[max(0, a - 500): b + 2000]
    else:
        sig = None
        if src.get('voice'):
            try:
                sig = tts(src['text'], src['voice'], src.get('rate', 1)).mean(axis=1)
            except (SystemExit, OSError) as e:
                print('VoiceLab ishlamadi, zaxira ovoz:', str(e)[:80])
        if sig is None:
            sig = edge(src['fallback'])
    sig = trim(sig)
    fade = np.minimum(1, (len(sig) - np.arange(len(sig))) / 1200)
    sig = sig * fade * (src.get('gain', 1) * 0.2 / (np.sqrt(np.mean(sig ** 2)) + 1e-9))
    return sig


def prepare(spec):
    spec.setdefault('lines', {})
    clips = {k: line(v) for k, v in spec['lines'].items()}
    info = {}
    for k, sig in clips.items():
        info[k] = {'dur': len(sig) / SR, 'env': mouth_env(np.stack([sig, sig], axis=1)), 'sound': spec['lines'][k].get('sound'), 'rate': spec['lines'][k].get('rate', 1)}
        print(k, round(info[k]['dur'], 2))
    return clips, info


def open_page(p, spec, info):
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
    page.on('pageerror', lambda e: print('JS xato:', e))
    page.goto('file:///' + os.path.join(HERE, spec.get('template', 'template-stick.html')).replace('\\', '/'))
    page.evaluate('document.fonts.load("800 80px Manrope")')
    page.evaluate('document.fonts.ready')
    return browser, page, page.evaluate('spec => window.build(spec)', {'episode': spec.get('episode'), 'lines': info, 'lang': spec.get('lang', 'uz'), 'timing': spec.get('timing'), 'durations': spec.get('durations')})


def with_score(spec, meta, fx, dur):
    """Fon musiqasi (score.make_cinematic: pianino va torli, lift dan keyin major) + tovush effektlari ustidan."""
    from score import make_cinematic
    tmp = os.path.join(tempfile.gettempdir(), 'investage_stick_score.wav')
    bounds = [(a / 1000, b / 1000) for a, b in meta['bounds']]
    make_cinematic(meta['flags'], bounds, dur, tmp, spec.get('seed', 1), None, 1.0, (), (), spec.get('whoosh', 0.25))
    with wave.open(tmp, 'rb') as w:
        music = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, 2) / 32767
    n = min(len(music), len(fx))
    out = music[:n] * spec.get('music', 0.55) + fx[:n] * spec.get('sfx', 0.9)
    return np.tanh(out * 1.1) * 0.95


def load_samples(cues):
    """'s:nom' cue'lari uchun out/sfx/nom.mp3 yozuvini SFX lug'atiga qo'shadi (cho'qqisi 0.6 ga normallanadi)."""
    from sfx import SFX
    for name in {c['name'] for c in cues if c.get('name', '').startswith('s:')}:
        if name in SFX:
            continue
        sig = decode(os.path.join(HERE, 'out', 'sfx', name[2:] + '.mp3'))
        sig = sig * (0.6 / (np.max(np.abs(sig)) + 1e-9))
        SFX[name] = (lambda x=sig: x.copy())


def with_track(spec, fx, dur, meta=None):
    """Tayyor musiqa trek (litsenziyasi tekshirilgan fayl): track_from soniyadan boshlab, oxirida so'nadi, effektlar ustida."""
    t = spec['track']
    start, delay = t.get('from', 0), 0.0
    if t.get('align') and meta:
        # musiqaning avj nuqtasi (hit) ko'rsatilgan sahna boshiga + offset ga tushsin
        a = t['align']
        want = meta['bounds'][a['scene']][0] / 1000 + a.get('offset', 0)
        start = a['hit'] - want
        if start < 0:
            start, delay = 0.0, -start
    music = decode_stereo(os.path.join(HERE, t['file']), start, dur)
    if delay:
        music = np.concatenate([np.zeros((int(delay * SR), 2), np.float32), music])[: len(music)]
    fade = int(t.get('fade', 1.5) * SR)
    music[-fade:] *= np.linspace(1, 0, fade)[:, None]
    music *= t.get('gain', 0.8) / (np.max(np.abs(music)) + 1e-9)
    n = min(len(music), len(fx))
    out = music[:n] + fx[:n] * spec.get('sfx', 0.7)
    if spec.get('voice_track'):
        # diktor yo'lagi: musiqa uning ostida silliq pasayadi (ducking)
        vo = decode(os.path.join(HERE, spec['voice_track']))[:n]
        vo = np.pad(vo, (0, n - len(vo)))
        vo *= spec.get('voice', 0.9) / (np.max(np.abs(vo)) + 1e-9)
        env = np.convolve((np.abs(vo) > 0.02).astype(np.float32), np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')
        duck = 1 - spec.get('duck', 0.55) * np.clip(env * 3, 0, 1)
        out = music[:n] * duck[:, None] + fx[:n] * spec.get('sfx', 0.7) + vo[:, None]
    return np.tanh(out * 1.05) * 0.96


def decode_stereo(src, start, dur):
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-ss', str(start), '-t', str(dur), '-i', src,
                          '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32).reshape(-1, 2) / 32768
    need = int(dur * SR)
    return np.pad(x, ((0, max(0, need - len(x))), (0, 0)))[:need].copy()


def render(spec, out):
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    clips, info = prepare(spec)
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    with sync_playwright() as p:
        browser, page, meta = open_page(p, spec, info)
        dur = meta['duration'] / 1000
        load_samples(meta['cues'])
        audio = mix(meta['cues'], clips, dur)
        if spec.get('score') == 'cinematic':
            audio = with_score(spec, meta, audio, dur)
        elif spec.get('track'):
            audio = with_track(spec, audio, dur, meta)
        wav = os.path.join(tempfile.gettempdir(), 'investage_stick_audio.wav')
        with wave.open(wav, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((audio * 32767).astype(np.int16).tobytes())
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


def sheet(spec, outdir, step=1.0, per=8):
    os.makedirs(outdir, exist_ok=True)
    clips, info = prepare(spec)
    with sync_playwright() as p:
        browser, page, meta = open_page(p, spec, info)
        dur = meta['duration'] / 1000
        print('davomiylik', round(dur, 2), 'sahnalar', [round(a / 1000, 2) for a, _ in meta['bounds']])
        times = np.arange(0.1, dur, step)
        for s in range(0, len(times), per):
            box = Image.new('RGB', (per * 280, 498), '#888')
            for k, t in enumerate(times[s:s + per]):
                page.evaluate('ms => window.seek(ms)', float(t) * 1000)
                f = os.path.join(outdir, 'f.png')
                page.screenshot(path=f)
                box.paste(Image.open(f).convert('RGB').resize((270, 480)), (k * 280, 9))
            path = os.path.join(outdir, f'sheet{s // per}.png')
            box.save(path)
            print(path, [round(float(x), 1) for x in times[s:s + per]])
        browser.close()


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    with open(sys.argv[1], encoding='utf-8') as fh:
        data = json.load(fh)
    if '--lang' in sys.argv:
        data['lang'] = sys.argv[sys.argv.index('--lang') + 1]
    if sys.argv[2] == '--sheet':
        sheet(data, sys.argv[3])
    else:
        render(data, sys.argv[2])
