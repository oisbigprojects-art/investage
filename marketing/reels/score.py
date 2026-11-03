"""Hujjatli film uslubidagi fon musiqasi (sintez, mualliflik huquqi muammosi yo'q): pianino ostinato, torli pad,
yurak urishidek bas, tik-tak va burilishlar oldidan jimlik. riddle.py ssenariyda "score": "cinematic" bo'lsa ishlatadi.

Sahna maydonlari: "tense": true — shu sahnada soat tik-taki; "drop": true — sahnadan oldin 0.6 s jimlik;
"lift": true — shu sahnadan boshlab major (umidli) akkordlar.
"""
import numpy as np

from music import SR, _add, _impact, _lowpass, _whoosh, finish


def _note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def _piano(freq, dur, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = sum(np.sin(2 * np.pi * freq * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (1.6 + 1.3 * k)) / k ** 1.3 for k in range(1, 7))
    attack = np.minimum(1, t / 0.004)
    return sig * attack * vel * 0.35


def _strings(freqs, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        for d in (0.997, 1.0, 1.003):
            vib = 1 + 0.002 * np.sin(2 * np.pi * 5.2 * t + d * 40)
            ph = 2 * np.pi * np.cumsum(f * d * vib) / SR
            sig += sum(np.sin(k * ph) / k for k in range(1, 6))
    sig = _lowpass(sig, 6)
    env = np.minimum(1, t / 0.9) * np.minimum(1, (dur - t) / 0.6).clip(0)
    return sig * env * 0.05


def _pulse(vel):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * (36 + 30 * np.exp(-t * 20)) * t) * np.exp(-t * 7) * vel


def _tick(rng, hi):
    n = int(0.04 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = x - _lowpass(x, 3)
    return (x * 0.5 + np.sin(2 * np.pi * (3200 if hi else 2500) * t)) * np.exp(-t * 160) * 0.09


def make_cinematic(scenes, bounds, duration, path, seed=1, voices=None, music=1.0, hits=(), extra=(), whoosh=1.0):
    rng = np.random.default_rng(seed)
    n = int(duration * SR) + SR
    piano, strings, low, fx = (np.zeros(n) for _ in range(4))
    beat = 60 / 84
    # D minor: i – i/b7 – VI – V (tushib boruvchi "lament" bas), lift dan keyin F major: I – V – vi – IV
    minor = [(50, (62, 65, 69)), (48, (60, 65, 69)), (46, (58, 62, 65)), (45, (57, 61, 64))]
    major = [(53, (65, 69, 72)), (48, (64, 67, 72)), (50, (62, 65, 69)), (46, (62, 65, 70))]
    lift = next((a for (a, _), s in zip(bounds, scenes) if s.get('lift')), duration + 1)
    tense = [(a, b) for (a, b), s in zip(bounds, scenes) if s.get('tense')]
    t, bar = 0.0, 0
    while t < duration:
        bass, chord = (major if t >= lift else minor)[bar % 4]
        _add(strings, t, _strings([_note(m) for m in chord] + [_note(bass)], beat * 4 + 0.8))
        for e in range(8):
            et = t + e * beat / 2
            notes = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 12]
            _add(piano, et, _piano(_note(notes[e % 4]), beat * 1.6, 0.55 + 0.25 * (e % 2 == 0)))
        _add(piano, t, _piano(_note(bass), beat * 4, 0.9))
        grow = min(1.0, 0.35 + t / duration)
        for b in (0, 2):
            _add(low, t + b * beat, _pulse(0.9 * grow))
            _add(low, t + b * beat + 0.18, _pulse(0.45 * grow))
        t += beat * 4
        bar += 1
    for a, b in tense:
        k, tt = 0, a
        while tt < b:
            _add(fx, tt, _tick(rng, k % 2 == 0))
            tt += beat / 2
            k += 1
    _add(fx, 0.0, _impact(rng) * 0.8)
    for a, _ in bounds[1:]:
        _add(fx, max(0.0, a - 0.4), _whoosh(rng, 0.6) * 0.5 * whoosh)
    for t_hit in hits:
        _add(fx, t_hit, _impact(rng) * 0.8)
    for t_fx, sig in extra:
        _add(fx, max(0.0, t_fx), sig)
    music_l = piano * 0.9 + strings + low * 0.8
    music_r = np.roll(piano, 90) * 0.9 + np.roll(strings, 300) + low * 0.8
    # Burilish oldidan jimlik: musiqa 0.6 s o'chadi, sahna boshida qaytadi
    gate = np.ones(n)
    for (a, _), s in zip(bounds, scenes):
        if s.get('drop'):
            i, j = int((a - 0.6) * SR), int(a * SR)
            gate[i:j] = 0
    gate = _lowpass(gate, int(0.06 * SR))
    mix = np.stack([music_l * gate + fx, music_r * gate + fx], axis=1)[: int(duration * SR)]
    return finish(mix, path, voices, music)
