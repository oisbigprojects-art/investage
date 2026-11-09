"""Karusel slaydlarini PNG qiladi: har <section class="slide"> — 1080x1350 rasm.
Ishlatish: python render.py 001-investorga-xabar   ->  001-investorga-xabar/out/01.png, 02.png, ..."""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

d = Path(__file__).resolve().parent / sys.argv[1]
out = d / 'out'; out.mkdir(exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1350}, device_scale_factor=1)
    pg.goto((d / 'slides.html').as_uri()); pg.evaluate('document.fonts.ready')
    for i, el in enumerate(pg.query_selector_all('section.slide'), 1):
        f = out / f'{i:02d}.png'; el.screenshot(path=str(f)); print(f)
    b.close()
