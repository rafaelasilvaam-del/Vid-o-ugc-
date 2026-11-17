"""Synthesize a sound-effects track for the Jour 1 reel (v8). Output: sfx.wav (48 kHz stereo)."""
import numpy as np, wave, sys

SR = 48000
DUR = 51.7
rng = np.random.default_rng(7)
out = np.zeros(int(SR * DUR) + SR, dtype=np.float64)


def t_(d):
    return np.arange(int(SR * d)) / SR


def biquad_bp(x, f0s, q=1.2):
    """Band-pass with a per-sample centre frequency (RBJ cookbook)."""
    y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
    for n in range(len(x)):
        w0 = 2 * np.pi * f0s[n] / SR; al = np.sin(w0) / (2 * q); c = np.cos(w0)
        b0, b2, a0, a1, a2 = al, -al, 1 + al, -2 * c, 1 - al
        y[n] = (b0 * x[n] + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1, y2, y1 = x1, x[n], y1, y[n]
    return y


def hp(x, a=0.95):
    y = np.zeros_like(x); prev = 0.0; py = 0.0
    for n in range(len(x)):
        py = a * (py + x[n] - prev); prev = x[n]; y[n] = py
    return y


def norm(x, peak):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def whoosh(d=0.45, lo=250, hi=3500, peak=0.35):
    t = t_(d); n = rng.standard_normal(len(t))
    sweep = lo * (hi / lo) ** (t / d)
    env = np.sin(np.pi * t / d) ** 2
    return norm(biquad_bp(n, sweep, 1.0) * env, peak)


def pop(peak=0.4, f0=900, f1=280, d=0.09):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(np.sin(ph) * np.exp(-t * 45), peak)


def boom(peak=0.6):
    t = t_(0.7); f = 110 * (40 / 110) ** (t / 0.7)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6)
    click = rng.standard_normal(len(t)) * np.exp(-t * 120) * 0.4
    return norm(s + click, peak)


def ding(freq, peak=0.28, d=1.2):
    t = t_(d)
    s = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 4) + 0.5 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 7)
         + 0.25 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 11))
    s *= np.minimum(1, t / 0.004)
    return norm(s, peak)


def tick(high=True, peak=0.22):
    t = t_(0.03); n = hp(rng.standard_normal(len(t)), 0.6)
    tone = np.sin(2 * np.pi * (2600 if high else 1900) * t)
    return norm((n * 0.5 + tone) * np.exp(-t * 260), peak)


def shutter(peak=0.35):
    a = hp(rng.standard_normal(int(SR * 0.025)), 0.7) * np.exp(-t_(0.025) * 200)
    s = np.zeros(int(SR * 0.12)); s[:len(a)] += a; s[int(SR * 0.06):int(SR * 0.06) + len(a)] += a * 0.8
    return norm(s, peak)


def key_click(peak=0.14):
    t = t_(0.02); n = hp(rng.standard_normal(len(t)), 0.8)
    return norm(n * np.exp(-t * 300), peak * rng.uniform(0.6, 1))


def womp(peak=0.3):
    parts = []
    for f0, d in ((392, 0.28), (370, 0.28), (330, 0.7)):
        t = t_(d); vib = 1 + 0.012 * np.sin(2 * np.pi * 6 * t)
        s = np.sin(2 * np.pi * np.cumsum(f0 * vib) / SR)
        s += 0.35 * np.sin(2 * np.pi * np.cumsum(2 * f0 * vib) / SR)
        parts.append(s * np.minimum(1, t / 0.02) * np.exp(-t * (1.5 if d > 0.5 else 3)))
    return norm(np.concatenate(parts), peak)


def sparkle(peak=0.22):
    s = np.zeros(int(SR * 0.9))
    for i, f in enumerate((1568, 2093, 2637, 3136, 4186)):
        d = ding(f, 1, 0.6); st = int(SR * 0.05 * i); s[st:st + len(d)] += d * (0.9 - i * 0.1)
    return norm(s, peak)


def riser(peak=0.25, d=0.5):
    t = t_(d); f = 200 * (1400 / 200) ** (t / d)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + biquad_bp(rng.standard_normal(len(t)), f * 2, 2) * 0.6
    return norm(s * (t / d) ** 1.5, peak)


def place(at, sig, gain=1.0):
    i = int(at * SR); out[i:i + len(sig)] += sig[:max(0, len(out) - i)] * gain


# ---- Timeline (seconds in the 51.7 s cut) ----
place(0.00, boom()); place(0.02, pop(0.35))
place(7.80, whoosh()); place(8.02, pop(0.3))
place(8.85, whoosh(0.3, peak=0.2))
place(16.00, pop(0.25, 1200, 500))
place(17.20, riser()); place(17.50, whoosh(0.4, 400, 5000, 0.3))
for k, tt in enumerate(np.arange(17.6, 21.9, 0.25)):
    place(tt, tick(k % 2 == 0))
place(19.50, pop(0.28))
place(21.95, boom(0.45)); place(22.05, ding(1318.5, 0.25))
place(26.54, pop(0.3))
place(35.80, womp())
place(38.22, pop(0.3))
place(40.72, sparkle())
place(41.45, whoosh())
for tt in (41.9, 42.6, 43.3):
    place(tt, shutter())
place(44.00, whoosh(0.35, peak=0.25))
for tt in np.arange(44.3, 46.4, 0.13):
    place(tt + rng.uniform(-0.03, 0.03), key_click())
place(46.40, whoosh(0.5, 300, 4000, 0.32))
place(46.88, pop(0.35))
for tt, f in zip((47.38, 47.88, 48.38, 48.88), (1046.5, 1174.7, 1318.5, 1568.0)):
    place(tt, ding(f, 0.3))
place(49.30, pop(0.32, 1000, 400))

out = out[:int(SR * DUR)]
out = np.tanh(out * 1.2) * 0.85
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
st = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'sfx.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print('ok', len(out) / SR)
