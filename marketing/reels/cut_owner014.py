"""Egasining cola.ogg yozuvini qatorlarga bo'ladi: telefon ovozini tiniqlashtiradi (riddle.STUDIO), uzun pauzalarni qisqartiradi,
biroz tezlashtiradi va out/voice/014-owner/lineNN.wav ga yozadi. Keyin: python prep_voice014.py out/voice/014-owner"""
import os, subprocess, wave
import numpy as np, imageio_ffmpeg
from riddle import STUDIO
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 44100
SRC = os.path.join(HERE, 'out', 'voice', 'cola.ogg')
OUT = os.path.join(HERE, 'out', 'voice', '014-owner')
# Qator chegaralari (s): Whisper so'z vaqtlari va jimlik oraliqlaridan
SEG = [(0.84, 4.39), (4.68, 8.6), (9.14, 15.78), (16.3, 21.21), (22.34, 24.77), (25.11, 29.95),
       (30.39, 36.19), (37.21, 42.05), (42.25, 45.07), (45.75, 49.11), (50.14, 53.6)]
TEMPO = 1.06
def load(path):
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-i', path, '-af', STUDIO + f',atempo={TEMPO}',
                          '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

x = load(SRC)

def squeeze(y, max_gap=0.42, keep=0.28):
    """Ichki uzun jimliklarni qisqartiradi (dramatik pauza bir oz qoladi)."""
    hop = SR // 100
    env = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2)) for i in range(0, len(y), hop)])
    q = env < max(env.max() * 0.04, 1e-4)
    out, i = [], 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            n = j - i
            take = n if n * 0.01 <= max_gap else int(keep * 100)
            out.append(y[i * hop: (i + take) * hop]); i = j
        else:
            j = i
            while j < len(q) and not q[j]: j += 1
            out.append(y[i * hop: j * hop]); i = j
    return np.concatenate(out)

os.makedirs(OUT, exist_ok=True)
for k, (a, b) in enumerate(SEG):
    y = x[int(a / TEMPO * SR): int(b / TEMPO * SR)]
    y = squeeze(y)
    with wave.open(os.path.join(OUT, f'line{k:02d}.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    print(k, round(len(y) / SR, 2))
