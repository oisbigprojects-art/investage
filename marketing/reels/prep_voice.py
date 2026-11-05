"""Diktor qatorlarini (VDIR/lineNN.wav) tozalaydi, voice.wav yasaydi, sahna uzunliklari va so'z vaqtlarini skriptga yozadi.
Ishlatish: python prep_voice.py VDIR scripts/NNN-lines.json scripts/NNN.json"""
import json, os, re, subprocess, sys, wave
import numpy as np, imageio_ffmpeg
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 44100
LEAD, GAP = 0.12, 0.32
VDIR, LINES, SPEC = sys.argv[1], sys.argv[2], sys.argv[3]
L = json.load(open(os.path.join(HERE, LINES), encoding='utf-8'))
L = [r if isinstance(r, list) else [r, r, ''] for r in L]
# Raqamli so'zlarning aytilishi (so'z vaqtini og'irlik bo'yicha taqsimlash uchun)
SPOKEN = {'2008-yil.': 'ikki ming sakkizinchi yil', '7': 'yetti', '150': 'yuz ellik', '10': "o'n", '2008.': 'ikki ming sakkizinchi', '12': "o'n ikki", '100': 'yuz', '1,5': 'bir yarim','1888-yilda': 'ming sakkiz yuz sakson sakkizinchi yilda', '2': 'ikki', '9': "to'qqiz", '9 ta.': "to'qqizta", '1886-yil,': 'ming sakkiz yuz sakson oltinchi yil', '5': 'besh', '45': 'qirq besh',
          '1888-yilda,': 'ming sakkiz yuz sakson sakkizinchi yilda', '2,2': 'ikki milliard ikki yuz million', 'milliardgacha.': 'milliongacha'}
VOW = re.compile(r"[aeiouo‘’'AEIOU]", re.I)

def weight(w):
    s = SPOKEN.get(w, w)
    return max(1, len(re.findall(r"[aeiouAEIOU]", s)))

def decode(p):
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-i', p, '-af', 'highpass=f=70,acompressor=threshold=0.1:ratio=2.5:attack=5:release=120,loudnorm=I=-16:TP=-1.5',
                          '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

def trim(x):
    env = np.convolve(np.abs(x), np.ones(441) / 441, 'same')
    idx = np.nonzero(env > env.max() * 0.04)[0]
    a, b = max(0, idx[0] - 900), min(len(x), idx[-1] + 2600)
    y = x[a:b].copy()
    f = 300; y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y


clips = [trim(decode(os.path.join(HERE, VDIR, f'line{i:02d}.wav'))) for i in range(len(L))]
durs, timing, track = [], [], []
for i, (show, _, _) in enumerate(L):
    d = len(clips[i]) / SR
    gap = 0.18 if i == 0 else GAP
    durs.append(round(LEAD + d + gap, 3))
    ws = show.split(' ')
    wt = [weight(w) for w in ws]
    tot = sum(wt); t = LEAD + 0.05; span = d - 0.15
    row = []
    for w, k in zip(ws, wt):
        dd = span * k / tot; row.append([w, round(t, 3), round(t + dd, 3)]); t += dd
    timing.append(row)
    track.append(np.zeros(int(LEAD * SR), np.float32)); track.append(clips[i]); track.append(np.zeros(int(gap * SR), np.float32))
v = np.concatenate(track)
with wave.open(os.path.join(HERE, VDIR, 'voice.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(v, -1, 1) * 32767).astype(np.int16).tobytes())
p = os.path.join(HERE, SPEC)
spec = json.load(open(p, encoding='utf-8'))
spec['durations'] = durs; spec['timing'] = timing; spec['voice_track'] = VDIR.replace(os.sep, '/') + '/voice.wav'
json.dump(spec, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('jami', round(sum(durs), 2), 's;', durs)
