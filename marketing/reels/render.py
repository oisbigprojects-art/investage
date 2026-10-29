"""Investage Reels: JSON ssenariydan 1080x1920 motion-grafika video yasaydi.

Ishlatish:
    python render.py scripts/001-investor-nimaga-qaraydi.json out/001.mp4
    python render.py scripts/001-....json --preview out/   # faqat har sahnadan bitta kadr (PNG)

Ssenariy formati (scripts/*.json):
{
  "caption": "Instagram matni ...",
  "scenes": [
    {"type": "hook",  "eyebrow": "STARTAPCHILAR UCHUN", "title": "Investor ... nimaga qaraydi?", "highlight": ["nimaga"], "dur": 3.4},
    {"type": "point", "num": "01", "title": "Jamoa", "body": "Kim quryapti? ...", "dur": 4.4},
    {"type": "stat",  "value": "73%", "title": "...", "body": "...", "dur": 4.4},
    {"type": "quote", "title": "...", "body": "...", "dur": 4.4},
    {"type": "cta",   "title": "Startapingizni investorlarga ko‘rsating", "highlight": ["investorlarga"],
     "body": "Investage — ...", "button": "investage.uz", "note": "Ro‘yxatdan o‘tish bepul", "dur": 4.9}
  ]
}
"""
import json
import math
import os
import subprocess
import sys

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, '..', '..', 'public', 'logo.webp')
W, H, FPS = 1080, 1920, 30
BG = (14, 14, 13)
GOLD = (245, 191, 23)
WHITE = (245, 245, 243)
MUTED = (160, 160, 152)
X0 = 80          # chap chet
TEXT_W = 920     # matn kengligi (o'ng tomonda Instagram tugmalari uchun joy qoladi)

_fonts = {}


def font(size, weight=800, inter=False):
    key = (size, weight, inter)
    if key not in _fonts:
        f = ImageFont.truetype(os.path.join(HERE, 'fonts', 'Inter.ttf' if inter else 'Manrope.ttf'), size)
        f.set_variation_by_axes([min(32, max(14, size // 3)), weight] if inter else [weight])
        _fonts[key] = f
    return _fonts[key]


def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def wrap(text, f, maxw):
    lines, cur = [], ''
    for word in text.split():
        trial = (cur + ' ' + word).strip()
        if f.getlength(trial) <= maxw:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


# Logotip oq rangga o'tkaziladi (qora fon uchun)
_lg = Image.open(LOGO).convert('RGBA')
LOGO_W = Image.merge('RGBA', (Image.new('L', _lg.size, 245),) * 3 + (_lg.getchannel('A'),))
LOGO_W = LOGO_W.resize((222, int(222 * _lg.size[1] / _lg.size[0])))

# Orqa fondagi sekin suzib yuradigan oltin nur
GS = 1500
_glow = Image.new('L', (GS, GS), 0)
ImageDraw.Draw(_glow).ellipse((450, 450, 1050, 1050), fill=255)
GLOW_MASK = _glow.filter(ImageFilter.GaussianBlur(170)).point(lambda v: int(v * 0.24))
GLOW_LAYER = Image.new('RGB', (GS, GS), GOLD)


def background(t):
    im = Image.new('RGB', (W, H), BG)
    x = int(560 + 240 * math.sin(t * 0.45))
    y = int(880 + 240 * math.cos(t * 0.35))
    im.paste(GLOW_LAYER, (x - GS // 2, y - GS // 2), GLOW_MASK)
    return im


def text_lines(layer, lines, f, x, y, color, lt, start, lh=1.12, hl=None):
    """Satrlar pastdan yuqoriga siljib paydo bo'ladi; hl dagi so'zlar oltin rangda."""
    p = ease((lt - start) / 0.55)
    step = int(f.size * lh)
    if p <= 0:
        return y + step * len(lines)
    dy, alpha = int(60 * (1 - p)), int(255 * p)
    hl = {w.lower() for w in (hl or [])}
    d = ImageDraw.Draw(layer)
    for ln in lines:
        cx = x
        for word in ln.split(' '):
            col = GOLD if word.strip('?.,!:;«»"').lower() in hl else color
            d.text((cx, y + dy), word, font=f, fill=col + (alpha,))
            cx += f.getlength(word + ' ')
        y += step
    return y


def underline(layer, x, y, lt, start, width=380):
    w = int(width * ease((lt - start) / 0.5))
    if w > 0:
        ImageDraw.Draw(layer).rounded_rectangle((x, y, x + w, y + 12), 6, fill=GOLD + (255,))


def pill(layer, text, x, y, p):
    f = font(72)
    bw = int(f.getlength(text) + 140)
    tile = Image.new('RGBA', (bw, 150), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    td.rounded_rectangle((0, 0, bw - 1, 149), 75, fill=GOLD + (int(255 * p),))
    bb = td.textbbox((0, 0), text, font=f)
    td.text((70, (150 - (bb[3] - bb[1])) // 2 - bb[1]), text, font=f, fill=(20, 20, 18, int(255 * p)))
    layer.paste(tile, (x, y), tile)


def draw_scene(layer, s, lt):
    kind = s['type']
    if kind == 'hook':
        y = 700
        if s.get('eyebrow'):
            y = text_lines(layer, [s['eyebrow'].upper()], font(40, 700, True), X0, y, GOLD, lt, 0.1) + 40
        text_lines(layer, wrap(s['title'], font(108), TEXT_W), font(108), X0, y, WHITE, lt, 0.35, 1.08, s.get('highlight'))
    elif kind in ('point', 'stat'):
        big = s.get('num') or s.get('value', '')
        p = ease(lt / 0.6)
        size = 260 if len(big) <= 3 else 200
        ImageDraw.Draw(layer).text((X0 + int(40 * (1 - p)), 560), big, font=font(size), fill=GOLD + (int(255 * p),))
        tf = font(120 if len(s['title']) <= 14 else 84)
        y = text_lines(layer, wrap(s['title'], tf, TEXT_W), tf, X0, 900, WHITE, lt, 0.25, 1.06, s.get('highlight'))
        underline(layer, X0, y + 20, lt, 0.55)
        if s.get('body'):
            bf = font(56, 500, True)
            text_lines(layer, wrap(s['body'], bf, TEXT_W - 20), bf, X0, y + 90, MUTED, lt, 0.7, 1.3)
    elif kind == 'quote':
        tf = font(84)
        y = text_lines(layer, wrap(s['title'], tf, TEXT_W), tf, X0, 640, WHITE, lt, 0.15, 1.12, s.get('highlight'))
        underline(layer, X0, y + 30, lt, 0.6, 240)
        if s.get('body'):
            bf = font(52, 500, True)
            text_lines(layer, wrap(s['body'], bf, TEXT_W - 20), bf, X0, y + 100, MUTED, lt, 0.75, 1.3)
    elif kind == 'cta':
        y = text_lines(layer, wrap(s['title'], font(100), TEXT_W), font(100), X0, 640, WHITE, lt, 0.1, 1.08, s.get('highlight'))
        if s.get('body'):
            bf = font(50, 500, True)
            y = text_lines(layer, wrap(s['body'], bf, TEXT_W - 20), bf, X0, y + 50, MUTED, lt, 0.45, 1.32)
        p = ease((lt - 0.9) / 0.5)
        if p > 0:
            pill(layer, s.get('button', 'investage.uz'), X0, y + 90 + int(50 * (1 - p)), p)
        if s.get('note'):
            text_lines(layer, [s['note']], font(46, 600, True), X0, y + 300, WHITE, lt, 1.3)
    else:
        raise ValueError(f'Noma\'lum sahna turi: {kind}')


def make_renderer(spec):
    scenes = spec['scenes']
    bounds, t = [], 0.0
    for s in scenes:
        bounds.append((t, t + float(s.get('dur', 4.4))))
        t = bounds[-1][1]
    total = t

    def frame(t):
        im = background(t)
        d = ImageDraw.Draw(im)
        si = next((i for i, (a, b) in enumerate(bounds) if t < b), len(bounds) - 1)
        s0, s1 = bounds[si]
        # Yuqoridagi bo'limlar chizig'i (stories uslubida)
        n = len(bounds)
        seg = (W - 2 * X0 + 16) // n
        for i, (a, b) in enumerate(bounds):
            x0 = X0 + i * seg
            x1 = x0 + seg - 16
            d.rounded_rectangle((x0, 90, x1, 98), 4, fill=(60, 60, 56))
            fr = 1 if t >= b else (0 if t < a else (t - a) / (b - a))
            if fr > 0:
                d.rounded_rectangle((x0, 90, x0 + max(8, int((x1 - x0) * fr)), 98), 4, fill=GOLD)
        im.paste(LOGO_W, (X0, 140), LOGO_W)
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        draw_scene(layer, scenes[si], t - s0)
        if si < n - 1:
            fade = 1 - ease((t - (s1 - 0.3)) / 0.3)
            if fade < 1:
                layer.putalpha(layer.getchannel('A').point(lambda v: int(v * fade)))
        im.paste(layer, (0, 0), layer)
        return im

    return frame, total, bounds


def render(spec, out):
    frame, total, _ = make_renderer(spec)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ff, '-y', '-loglevel', 'error',
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', '-shortest',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
           '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(int(total * FPS)):
        proc.stdin.write(frame(i / FPS).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise SystemExit('ffmpeg xato bilan tugadi')
    print(f'{out}: {total:.1f}s, {os.path.getsize(out) // 1024} KB')


def preview(spec, outdir):
    frame, _, bounds = make_renderer(spec)
    os.makedirs(outdir, exist_ok=True)
    for i, (a, b) in enumerate(bounds):
        path = os.path.join(outdir, f'scene{i + 1}.png')
        frame(min(b - 0.4, a + 2.2)).save(path)
        print(path)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    with open(sys.argv[1], encoding='utf-8') as fh:
        spec = json.load(fh)
    if sys.argv[2] == '--preview':
        preview(spec, sys.argv[3])
    else:
        render(spec, sys.argv[2])
