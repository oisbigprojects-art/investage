"""Reels uchun original fon musiqasi va ovoz effektlari (sintez, tayyor namunalar yo'q — mualliflik huquqi muammosi yo'q).

make_audio(bounds, duration, path, seed): bounds — sahnalar [(boshlanish_s, tugash_s), ...].
Har sahna almashinuvida "whoosh", boshida "impact", fonda A-minor beat (100 BPM): kick, snare, hi-hat,
bas, akkord pad va arpedjio. Seed har video uchun biroz boshqacha variant beradi (tonallik va arpedjio naqshi).
"""
import wave

import numpy as np

SR = 44100


def _env(n, a, r):
    """Attack/release qo'ng'iroq shaklidagi qobiq (n namunalar)."""
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))
    return e


def _lowpass(x, k):
    if k <= 1:
        return x
    return np.convolve(x, np.ones(k) / k, mode='same')


def _note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def _add(buf, start_s, sig):
    i = int(start_s * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def _kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * 1.0


def _snare(rng):
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - _lowpass(noise, 6)          # yuqori chastotalar
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return (noise * np.exp(-t * 22) * 0.35 + tone * 0.4)


def _hat(rng):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - _lowpass(noise, 3)
    return noise * np.exp(-t * 90) * 0.12


def _pluck(freq, dur, bright=4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = sum(np.sin(2 * np.pi * freq * k * t) / (k ** 1.6) for k in range(1, bright + 1))
    return sig * _env(n, 0.004, dur / 4)


def _pad(freqs, dur, detune):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        for d in (1 - detune, 1 + detune):
            sig += sum(np.sin(2 * np.pi * f * d * k * t) / (k * k) for k in (1, 2, 3))
    att = np.minimum(1, t / 0.5)
    rel = np.minimum(1, (dur - t) / 0.6)
    return sig * att * np.clip(rel, 0, 1) / (len(freqs) * 2)


def _whoosh(rng, dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # Filtr chastotasi yuqoriga ko'tarilib, keyin tushadi: oddiy "sweep" — har bo'lakka turli silliqlash
    chunks = 24
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        p = c / (chunks - 1)
        k = int(2 + 40 * (1 - np.sin(np.pi * p)))
        seg = _lowpass(noise[max(0, a - 50): b + 50], k)
        out[a:b] = seg[(a - max(0, a - 50)): (a - max(0, a - 50)) + (b - a)]
    shape = np.sin(np.pi * t / dur) ** 2
    return out * shape * 0.5


def _impact(rng):
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 + 40 * np.exp(-t * 6)) * t) * np.exp(-t * 3)
    noise = _lowpass(rng.standard_normal(n), 30) * np.exp(-t * 5) * 0.6
    return (boom + noise) * 0.8


def make_audio(bounds, duration, path, seed=1, voices=None, music=1.0, hits=()):
    """voices: [(boshlanish_s, np.ndarray shape (n, 2) float -1..1), ...] — diktor ovozi.
    Ovoz yangrayotganda musiqa avtomatik pasayadi (ducking), ovoz esa ustida aniq eshitiladi.
    music: fon musiqasi balandligi (1 = to'liq); hits: qo'shimcha "impact" urilishlari vaqtlari (soniya)."""
    rng = np.random.default_rng(seed)
    n = int(duration * SR) + SR
    drums, bass, pad, arp, fx = (np.zeros(n) for _ in range(5))

    bpm = 100
    beat = 60 / bpm
    root = 57 + [0, 2, -2, 3][seed % 4]                  # A, B, G yoki C atrofida
    prog = [(0, 3, 7), (-4, 0, 3), (3, 7, 10), (-2, 2, 5)]  # i – VI – III – VII
    arp_pat = [[0, 1, 2, 1], [0, 2, 1, 2], [2, 1, 0, 1], [0, 1, 2, 3]][seed % 4]
    intro = 1.0                                          # boshida 1 soniya faqat pad va impact

    kick, hat = _kick(), _hat(rng)
    t, bar = 0.0, 0
    while t < duration:
        chord = prog[bar % 4]
        freqs = [_note(root + c) for c in chord]
        _add(pad, t, _pad(freqs, beat * 4 + 0.6, 0.004))
        for b in range(4):
            bt = t + b * beat
            if bt < intro:
                continue
            _add(drums, bt, kick * (1.0 if b in (0, 2) else 0.7))
            if b in (1, 3):
                _add(drums, bt, _snare(rng))
            _add(drums, bt + beat / 2, hat)
            _add(drums, bt + beat / 4, hat * 0.5)
            _add(bass, bt, _pluck(_note(root - 24 + chord[0]), beat * 0.9, 3) * 0.55)
            _add(bass, bt + beat * 0.75, _pluck(_note(root - 12 + chord[0]), beat * 0.25, 3) * 0.25)
            for s in range(4):
                tone = chord[arp_pat[s] % 3] + (12 if arp_pat[s] == 3 else 0)
                _add(arp, bt + s * beat / 4, _pluck(_note(root + 12 + tone), beat / 3, 5) * 0.16)
        t += beat * 4
        bar += 1

    _add(fx, 0.0, _impact(rng))
    for a, _ in bounds[1:]:
        _add(fx, max(0.0, a - 0.45), _whoosh(rng))
    _add(fx, bounds[-1][0] + 0.2, _impact(rng) * 0.5)
    for t_hit in hits:
        _add(fx, t_hit, _impact(rng) * 0.7)

    mix_l = drums * 0.9 + bass * 0.8 + pad * 0.55 + arp * 0.9 + fx * 0.9
    mix_r = drums * 0.9 + bass * 0.8 + np.roll(pad, 220) * 0.55 + np.roll(arp, 110) * 0.9 + fx * 0.9
    mix = np.stack([mix_l, mix_r], axis=1)[: int(duration * SR)]
    mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.85
    if voices:
        vo = np.zeros_like(mix)
        active = np.zeros(len(mix))
        for start, sig in voices:
            i = int(start * SR)
            j = min(len(mix), i + len(sig))
            if i < j:
                vo[i:j] += sig[: j - i]
                active[i:j] = 1
        # Musiqani ovoz ostida silliq pasaytirish (40 ms hujum, 300 ms qaytish)
        duck = 1 - 0.68 * _lowpass(active, int(0.3 * SR))
        vpeak = np.max(np.abs(vo)) + 1e-9
        mix = mix * duck[:, None] * 0.8 * music + vo / vpeak * 0.92
        mix = np.tanh(mix * 1.05) * 0.95
    # Oxirida 0.8 s so'nish
    fade = int(0.8 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    data = (mix * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    return path
