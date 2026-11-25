# Sayt ikonlari: "!N" belgisi (logotipning boshi, Instagram avatari bilan bir xil).
# Ishga tushirish: python marketing/brand/gen_icons.py
# Natija: public/icon.svg, favicon.ico, icon-48/96/192/512.png, icon-maskable-512.png,
#         apple-touch-icon.png, logo-square.png (Google Organization logosi uchun)
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
PUB = ROOT / 'public'
BG = (15, 15, 15)          # #0F0F0F
GOLD = (246, 190, 19)      # #F6BE13

# 100×100 koordinatalarda belgi (kichik o'lchamda ko'rinishi uchun N chiziqlari avatardagidan qalinroq)
RECTS = [  # x, y, w, h, radius
    (12, 14, 10, 52, 2),   # ! tayoqchasi
    (12, 74, 10, 12, 2),   # ! nuqtasi
    (34, 14, 5, 72, 0),    # N chap
    (75, 14, 5, 62, 0),    # N o'ng
]
DIAG = [(39, 14), (51, 14), (80, 86), (68, 86)]
CX, CY = 46, 50            # belgi markazi


def tf(x, y, s):
    """Belgini kvadrat markaziga qo'yib, s marta kichraytiradi (100×100 da)."""
    return 50 + (x - CX) * s, 50 + (y - CY) * s


def svg(scale=0.84, rx=22):
    g = ''.join(
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}"' + (f' rx="{r}"' if r else '') + '/>'
        for x, y, w, h, r in RECTS
    )
    pts = ' '.join(f'{x},{y}' for x, y in DIAG)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        f'<rect width="100" height="100" rx="{rx}" fill="#0F0F0F"/>'
        f'<g fill="#F6BE13" transform="translate(50 50) scale({scale}) translate(-{CX} -{CY})">'
        f'{g}<polygon points="{pts}"/></g></svg>\n'
    )


def png(size, scale=0.84, rx=22, ss=8):
    """rx — burchak radiusi 100 birlikda (0 = to'liq kvadrat, iOS/maskable uchun)."""
    n = size * ss
    k = n / 100
    im = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if rx:
        d.rounded_rectangle([0, 0, n - 1, n - 1], radius=rx * k, fill=BG)
    else:
        d.rectangle([0, 0, n, n], fill=BG)
    for x, y, w, h, r in RECTS:
        x0, y0 = tf(x, y, scale)
        x1, y1 = tf(x + w, y + h, scale)
        box = [x0 * k, y0 * k, x1 * k, y1 * k]
        if r:
            d.rounded_rectangle(box, radius=r * scale * k, fill=GOLD)
        else:
            d.rectangle(box, fill=GOLD)
    d.polygon([(px * k, py * k) for px, py in (tf(x, y, scale) for x, y in DIAG)], fill=GOLD)
    return im.resize((size, size), Image.LANCZOS)


def main():
    (PUB / 'icon.svg').write_text(svg(), encoding='utf-8')
    for s in (48, 96, 192, 512):
        png(s).save(PUB / f'icon-{s}.png', optimize=True)
    # Android maskable: to'liq kvadrat fon, belgi xavfsiz zonada (markaziy 80%)
    png(512, scale=0.66, rx=0).save(PUB / 'icon-maskable-512.png', optimize=True)
    # iOS burchaklarni o'zi yumaloqlaydi: shaffoflik bo'lmasin
    png(180, rx=0).convert('RGB').save(PUB / 'apple-touch-icon.png', optimize=True)
    # Google Organization logosi: kvadrat, ≥112×112, oq fonda ham ko'rinadi
    png(512, rx=0).convert('RGB').save(PUB / 'logo-square.png', optimize=True)
    ico = png(256)
    ico.save(PUB / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    print('tayyor')


if __name__ == '__main__':
    main()
