"""Egasining yozuvini qatorlarga bo'ladi: telefon ovozini tiniqlashtiradi (riddle.STUDIO), uzun pauzalarni qisqartiradi,
biroz tezlashtiradi va OUT/lineNN.wav ga yozadi.
Ishlatish: python cut_owner.py out/voice/YOZUV out/voice/NNN-owner "a,b;a,b;..."   (chegaralar asl faylning soniyalarida)
Keyin: python prep_voice.py out/voice/NNN-owner scripts/NNN-lines.json scripts/NNN.json"""
import os, subprocess, sys, wave
import numpy as np, imageio_ffmpeg
from riddle import STUDIO
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 44100
TEMPO = 1.06
SRC, OUT = os.path.join(HERE, sys.argv[1]), os.path.join(HERE, sys.argv[2])
SEG = [tuple(map(float, p.split(','))) for p in sys.argv[3].split(';')]
raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-i', SRC, '-af', STUDIO + f',atempo={TEMPO}',
                      '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768

def squeeze(y, max_gap=0.42, keep=0.28):
    """Ichki uzun jimliklarni qisqartiradi (dramatik pauza bir oz qoladi)."""
    hop = SR // 100
    env = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2)) for i in range(0, len(y), hop)])
    q = env < max(env.max() * 0.04, 1e-4)
    out, i = [], 0
    while i < len(q):
        j = i
        while j < len(q) and q[j] == q[i]: j += 1
        n = j - i
        take = n if (not q[i] or n * 0.01 <= max_gap) else int(keep * 100)
        out.append(y[i * hop: (i + take) * hop]); i = j
    return np.concatenate(out)

os.makedirs(OUT, exist_ok=True)
for k, (a, b) in enumerate(SEG):
    y = squeeze(x[int(a / TEMPO * SR): int(b / TEMPO * SR)])
    with wave.open(os.path.join(OUT, f'line{k:02d}.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    print(k, round(len(y) / SR, 2))
