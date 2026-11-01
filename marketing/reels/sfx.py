"""Stickman reels uchun original tovush effektlari (sintez, tayyor namunalarsiz: mualliflik huquqi muammosi yo'q).

Har funksiya mono np.ndarray qaytaradi (SR = 44100). SFX lug'ati nom -> funksiya; mix() cue'lar ro'yxatidan tayyor stereo trek yig'adi.
"""
import numpy as np

from music import SR, _impact, _lowpass, _whoosh

RNG = np.random.default_rng(7)


def _t(sec):
    return np.arange(int(sec * SR)) / SR


def _noise(n):
    return RNG.standard_normal(n)


def _band(x, lo, hi):
    """Oddiy polosali filtr: ikki silliqlash farqi."""
    return _lowpass(x, max(1, SR // hi)) - _lowpass(x, max(2, SR // lo))


def _res(t, freqs, decay):
    return sum(np.sin(2 * np.pi * f * t) * a * np.exp(-t * d) for (f, a), d in zip(freqs, decay))


def knock():
    t = _t(0.16)
    body = _res(t, [(148, 1), (262, 0.7), (455, 0.38), (790, 0.2)], [34, 44, 70, 110])
    click = _band(_noise(len(t)), 900, 5000) * np.exp(-t * 340) * 0.5
    return (body + click) * 0.9


def creak(sec=0.75, base=95):
    t = _t(sec)
    f = base * (1 + 0.5 * np.sin(2 * np.pi * 0.9 * t / sec) + 0.1 * np.sin(2 * np.pi * 7 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    grit = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (26 + 12 * t / sec) * t))
    sig = sum(np.sin(ph * k + k) / k ** 0.9 for k in range(2, 10)) * grit
    shape = np.sin(np.pi * t / sec) ** 0.6
    return sig * shape * 0.24


def creak_low():
    return creak(1.0, 48) * 2


def slam():
    t = _t(0.9)
    boom = np.sin(2 * np.pi * (52 + 70 * np.exp(-t * 28)) * t) * np.exp(-t * 9)
    wood = _res(t, [(118, 0.9), (210, 0.7), (340, 0.5), (620, 0.3)], [20, 26, 34, 60])
    crack = _band(_noise(len(t)), 500, 7000) * np.exp(-t * 70) * 0.9
    rattle = _band(_noise(len(t)), 1800, 6000) * np.exp(-t * 11) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 37 * t))) * 0.1
    return (boom * 1.05 + wood + crack + rattle) * 0.95


def thud():
    t = _t(0.34)
    body = np.sin(2 * np.pi * (62 + 60 * np.exp(-t * 34)) * t) * np.exp(-t * 15)
    cloth = _lowpass(_noise(len(t)), 40) * np.exp(-t * 30) * 2.2
    return (body + cloth) * 0.95


def smack():
    t = _t(0.2)
    return (_band(_noise(len(t)), 700, 9000) * np.exp(-t * 60) * 1.1 + np.sin(2 * np.pi * 160 * t) * np.exp(-t * 34) * 0.6)


def push():
    t = _t(0.16)
    return (np.sin(2 * np.pi * 96 * t) * np.exp(-t * 28) + _lowpass(_noise(len(t)), 16) * np.exp(-t * 40) * 1.5) * 0.7


def thunk():
    t = _t(0.3)
    return (_res(t, [(196, 1), (330, 0.7), (520, 0.3)], [26, 34, 60]) + _band(_noise(len(t)), 800, 4000) * np.exp(-t * 110) * 0.5) * 0.9


def whoosh():
    return _whoosh(RNG, 0.5) * 2.0


def tick():
    t = _t(0.12)
    return (np.sin(2 * np.pi * 1320 * t) * np.exp(-t * 60) * 0.34 + np.sin(2 * np.pi * 2110 * t) * np.exp(-t * 90) * 0.14)


def boom():
    return _impact(RNG) * 0.9


def paper():
    n = int(0.75 * SR)
    t = np.arange(n) / SR
    flutter = 0.5 + 0.5 * np.sin(2 * np.pi * (15 + 12 * np.sin(t * 9)) * t)
    return _band(_noise(n), 1200, 8000) * flutter * np.exp(-t * 3.6) * 0.3


def step():
    t = _t(0.14)
    return (np.sin(2 * np.pi * (72 + 40 * np.exp(-t * 60)) * t) * np.exp(-t * 34) * 0.8 + _band(_noise(len(t)), 500, 4000) * np.exp(-t * 90) * 0.2)


def steps():
    t = _t(0.09)
    return (np.sin(2 * np.pi * 86 * t) * np.exp(-t * 44) * 0.6)


def runs():
    out = np.zeros(int(0.7 * SR))
    for i in range(7):
        a = int(i * 0.092 * SR)
        s = step()
        e = min(len(out), a + len(s))
        out[a:e] += s[: e - a] * (0.5 + 0.08 * i)
    return out


def skid():
    t = _t(0.34)
    return _band(_noise(len(t)), 1300, 7000) * (1 - t / 0.34) ** 2 * 0.34


def rain():
    n = int(9.0 * SR)
    t = np.arange(n) / SR
    wash = _band(_noise(n), 800, 9000) * 0.09 + _lowpass(_noise(n), 90) * 0.5
    sig = wash.copy()
    for _ in range(420):
        a = RNG.integers(0, n - 3000)
        k = np.arange(2200) / SR
        sig[a:a + 2200] += np.sin(2 * np.pi * RNG.uniform(1800, 5200) * k) * np.exp(-k * RNG.uniform(260, 700)) * RNG.uniform(0.02, 0.09)
    fade = np.minimum(1, t / 0.4) * np.minimum(1, (9.0 - t) / 0.5)
    return sig * fade


def umbrella():
    t = _t(0.25)
    return _band(_noise(len(t)), 700, 6000) * np.exp(-t * 16) * 0.5


def ding():
    t = _t(1.5)
    sig = sum(np.sin(2 * np.pi * f * t) * a * np.exp(-t * d) for f, a, d in [(1568, 0.55, 3), (2349, 0.3, 4.2), (3136, 0.22, 6), (4699, 0.1, 9)])
    return sig * 0.75


def pop():
    t = _t(0.12)
    return np.sin(2 * np.pi * (300 + 900 * (t / 0.12)) * t) * np.exp(-t * 34) * 0.55


def coin():
    t = _t(0.55)
    hit = np.sin(2 * np.pi * 1976 * t) * np.exp(-t * 12) * (t < 0.07)
    tail = np.sin(2 * np.pi * 2637 * t) * np.exp(-(t - 0.07).clip(0) * 7) * (t >= 0.07)
    return (hit + tail) * 0.34


def keys():
    n = int(4.2 * SR)
    out = np.zeros(n)
    a = 0.0
    while a < 4.1:
        t = _t(0.05)
        click = _band(_noise(len(t)), 1400, 7000) * np.exp(-t * 180) * RNG.uniform(0.2, 0.42)
        i = int(a * SR)
        e = min(n, i + len(click))
        out[i:e] += click[: e - i]
        a += RNG.choice([0.07, 0.09, 0.11, 0.14, 0.26])
    return out


def slide_down():
    t = _t(0.72)
    f = 1120 * np.exp(-t * 1.9) * (1 + 0.016 * np.sin(2 * np.pi * 6 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.72) ** 0.5 * 0.34


def heart():
    t = _t(0.62)
    beat = lambda d: np.where(t >= d, np.sin(2 * np.pi * 54 * (t - d)) * np.exp(-(t - d) * 15), 0)
    return (beat(0) + beat(0.24) * 0.72) * 1.05


def fanfare():
    """Qisqa g'alaba zarbasi: mis cholg'uga o'xshash akkord."""
    seq = [(0.0, [523, 659, 784], 0.14), (0.16, [523, 659, 784], 0.14), (0.32, [698, 880, 1047], 0.22), (0.56, [784, 988, 1175, 1568], 1.5)]
    out = np.zeros(int(2.3 * SR))
    for a, fs, dur in seq:
        t = _t(dur + 0.35)
        env = np.minimum(1, t / 0.022) * np.where(t < dur, 1.0, np.exp(-(t - dur) * 7)) * (np.exp(-t * 1.4) if dur > 1 else 1)
        sig = sum(sum(np.sin(2 * np.pi * f * k * t + k) / k ** 1.25 for k in range(1, 9)) for f in fs) / len(fs)
        i = int(a * SR)
        out[i:i + len(sig)] += (sig * env)[: len(out) - i]
    t = _t(0.5)
    out[:len(t)] += _impact(RNG)[:len(t)] * 0.35
    return out * 0.36


def buzz():
    """"Yo'q" signali: viktorinadagi noto'g'ri javob tovushi."""
    t = _t(0.42)
    sig = np.sign(np.sin(2 * np.pi * 98 * t)) + np.sign(np.sin(2 * np.pi * 147 * t)) * 0.8
    return _lowpass(sig, 8) * np.minimum(1, t / 0.008) * np.minimum(1, (0.42 - t) / 0.05) * 0.42


def huh():
    """Savol ohangi: yuqoriga ko'tariluvchi qisqa nota."""
    t = _t(0.3)
    return np.sin(2 * np.pi * np.cumsum(300 + 520 * (t / 0.3) ** 2) / SR) * np.sin(np.pi * t / 0.3) * 0.32


SFX = {
    'knock': knock, 'creak': creak, 'creakLow': creak_low, 'slam': slam, 'thud': thud, 'smack': smack, 'push': push, 'thunk': thunk,
    'whoosh': whoosh, 'tick': tick, 'boom': boom, 'paper': paper, 'step': step, 'steps': steps, 'runs': runs, 'skid': skid, 'rain': rain,
    'buzz': buzz, 'huh': huh, 'umbrella': umbrella, 'ding': ding, 'pop': pop, 'coin': coin, 'keys': keys, 'slideDown': slide_down, 'heart': heart, 'fanfare': fanfare,
}


def _resample(x, rate):
    if rate == 1:
        return x
    idx = np.arange(0, len(x) - 1, rate)
    return np.interp(idx, np.arange(len(x)), x)


def _room(x, sec=0.32, wet=0.12):
    """Yo'lak aks-sadosi: pasayuvchi shovqin bilan konvolyutsiya (FFT)."""
    n = int(sec * SR)
    ir = _lowpass(_noise(n), 6) * np.exp(-np.arange(n) / SR * 13)
    ir /= np.sqrt((ir ** 2).sum()) + 1e-9
    m = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
    return x + y * wet * 3


def mix(cues, lines, duration):
    """cues: [{t, name|line, gain, rate}]; lines: nom -> mono ovoz. Stereo (n, 2) float qaytaradi.
    Musiqa yo'q: fonda juda past xona shovqini, shuning uchun jimlik "o'lik" eshitilmaydi."""
    n = int(duration * SR)
    fx, vo = np.zeros(n), np.zeros(n)
    for c in cues:
        if 'line' in c:
            sig, buf = lines[c['line']], vo
        else:
            sig, buf = SFX[c['name']](), fx
        sig = _resample(sig, c.get('rate', 1)) * c.get('gain', 1)
        if c.get('cut'):
            sig = sig[: int(c['cut'] * SR)]
            f = min(len(sig), int(0.2 * SR))
            sig[-f:] *= np.linspace(1, 0, f)
        i = int(c['t'] * SR)
        j = min(n, i + len(sig))
        if i < j:
            buf[i:j] += sig[: j - i]
    fx = _room(fx, 0.3, 0.1)
    vo = _room(vo, 0.22, 0.06)
    tone = _lowpass(_noise(n), 260) * 0.03
    sl, sr = fx * 0.5 + tone, np.roll(fx, 40) * 0.5 + np.roll(tone, 900)
    out = np.tanh(np.stack([sl + vo, sr + vo], axis=1) * 1.15) * 0.96
    f = int(0.25 * SR)
    out[-f:] *= np.linspace(1, 0, f)[:, None]
    return out
