"""Draw the three label-free supporting images in code (no AI, no external service).

  public/imagery/berry-ice-splash.svg    Flavour chapter inset (vector)
  public/imagery/pour-glass.svg          Feeling chapter inset (vector)
  public/textures/glass-droplets.webp    cold-glass condensation, lit heightfield

They contain no can, label or brand artwork. Run:  python3 scripts/build-illustrations.py
"""
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "public" / "imagery"
TEX = ROOT / "public" / "textures"
IMG.mkdir(parents=True, exist_ok=True)
TEX.mkdir(parents=True, exist_ok=True)

CREAM, INK = "#F7F1E5", "#211B18"
HOT, BERRY, OX, CRIM = "#E3171A", "#E12E30", "#AA2829", "#AA061B"
W, H = 800, 600


def f(v):
    return f"{v:.1f}"


def smooth_closed(pts):
    n = len(pts)
    d = f"M{f(pts[0][0])} {f(pts[0][1])}"
    for i in range(n):
        p0, p1, p2, p3 = pts[(i - 1) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}"
    return d + "Z"


def crown(cx, cy, base, seed, spikes=11, reach=0.85, squash=0.78):
    """Irregular liquid crown: a blob with radial spikes, flattened vertically."""
    rnd = random.Random(seed)
    spike_at = [(k / spikes) * math.tau + rnd.random() * 0.35 for k in range(spikes)]
    pts = []
    for i in range(90):
        a = i / 90 * math.tau
        r = base * (1 + 0.08 * math.sin(a * 3 + seed) + 0.05 * math.sin(a * 7 + seed * 2))
        for s in spike_at:
            d = math.atan2(math.sin(a - s), math.cos(a - s))
            w = 0.075 + rnd.random() * 0.02
            if abs(d) < w * 2.4:
                r += base * reach * math.exp(-(d * d) / (w * w)) * (0.55 + rnd.random() * 0.7)
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r * squash))
    return smooth_closed(pts)


def berry(x, y, r, rot=0):
    leaf = (
        f'<path d="M{f(x)} {f(y - r * .86)} q{f(r * .5)} {f(-r * .5)} {f(r * .95)} {f(-r * .18)} '
        f'q{f(-r * .45)} {f(r * .5)} {f(-r * .95)} {f(r * .18)}z" fill="#3E6B3A"/>'
        f'<path d="M{f(x)} {f(y - r * .86)} q{f(-r * .5)} {f(-r * .45)} {f(-r * .9)} {f(-r * .1)} '
        f'q{f(r * .42)} {f(r * .5)} {f(r * .9)} {f(r * .1)}z" fill="#2F5530"/>'
    )
    seeds = "".join(
        f'<ellipse cx="{f(x + dx * r)}" cy="{f(y + dy * r)}" rx="{f(r * .045)}" ry="{f(r * .07)}" fill="#F6D58A" opacity=".75"/>'
        for dx, dy in [(-.35, -.1), (.1, -.35), (.4, .05), (-.15, .3), (.2, .4), (-.45, .35), (.0, .05)]
    )
    return (
        f'<g transform="rotate({rot} {f(x)} {f(y)})">'
        f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="url(#berry)"/>'
        f'{seeds}{leaf}'
        f'<ellipse cx="{f(x - r * .38)}" cy="{f(y - r * .38)}" rx="{f(r * .22)}" ry="{f(r * .14)}" fill="#fff" opacity=".55" transform="rotate(-35 {f(x - r * .38)} {f(y - r * .38)})"/>'
        f'</g>'
    )


def ice(x, y, s, rot):
    return (
        f'<g transform="rotate({rot} {f(x)} {f(y)})">'
        f'<rect x="{f(x - s / 2)}" y="{f(y - s / 2)}" width="{f(s)}" height="{f(s)}" rx="{f(s * .16)}" fill="url(#ice)" stroke="#fff" stroke-width="2.5" stroke-opacity=".85"/>'
        f'<rect x="{f(x - s * .36)}" y="{f(y - s * .36)}" width="{f(s * .72)}" height="{f(s * .72)}" rx="{f(s * .1)}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.6"/>'
        f'<path d="M{f(x - s * .3)} {f(y - s * .38)} l{f(s * .34)} 0" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>'
        f'</g>'
    )


def grad_defs():
    return f"""<defs>
<radialGradient id="berry" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#F0504F"/><stop offset=".55" stop-color="{BERRY}"/><stop offset="1" stop-color="{CRIM}"/></radialGradient>
<linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{HOT}"/><stop offset="1" stop-color="{CRIM}"/></linearGradient>
<linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".92"/><stop offset="1" stop-color="#D7E6EE" stop-opacity=".55"/></linearGradient>
<radialGradient id="shadow"><stop offset="0" stop-color="#4a0710" stop-opacity=".38"/><stop offset="1" stop-color="#4a0710" stop-opacity="0"/></radialGradient>
</defs>"""


def build_splash():
    rnd = random.Random(5)
    body = crown(400, 330, 118, seed=7, spikes=13, reach=0.6)
    inner = crown(400, 334, 78, seed=13, spikes=7, reach=0.5)
    drops = ""
    for _ in range(26):
        a = rnd.random() * math.tau
        d = 215 + rnd.random() * 150
        x, y = 400 + math.cos(a) * d * 1.15, 330 + math.sin(a) * d * 0.68
        if 40 < x < W - 40 and 30 < y < H - 30:
            drops += f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(3 + rnd.random() * 9)}" fill="{HOT if rnd.random() > .3 else CRIM}"/>'
    berries = "".join(berry(x, y, r, rot) for x, y, r, rot in [(250, 175, 40, -20), (560, 150, 34, 15), (655, 330, 38, 30), (170, 365, 32, -35), (440, 120, 28, 10), (520, 455, 36, -10)])
    cubes = "".join(ice(x, y, s, rot) for x, y, s, rot in [(320, 240, 76, -18), (505, 270, 66, 24), (385, 395, 70, 10), (600, 215, 54, -32)])
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="Illustration: red berries and ice cubes in a splash of red liquid">
{grad_defs()}
<rect width="{W}" height="{H}" fill="{CREAM}"/>
<ellipse cx="400" cy="548" rx="260" ry="26" fill="url(#shadow)"/>
<path d="{body}" fill="url(#liquid)"/>
<path d="{inner}" fill="{CRIM}" opacity=".32"/>
<path d="{body}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>
{drops}{cubes}{berries}
</svg>
"""
    (IMG / "berry-ice-splash.svg").write_text(svg)


def build_pour():
    rnd = random.Random(21)
    bubbles = "".join(
        f'<circle cx="{f(305 + rnd.random() * 190)}" cy="{f(290 + rnd.random() * 215)}" r="{f(2.5 + rnd.random() * 5)}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.8"/>'
        for _ in range(30)
    )
    cubes = "".join(ice(x, y, s, rot) for x, y, s, rot in [(350, 330, 70, -12), (445, 365, 64, 18), (385, 440, 62, 8)])
    splash = crown(400, 262, 64, seed=3, spikes=9, reach=0.55, squash=0.32)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="Illustration: red sparkling drink being poured over ice into a clear glass">
{grad_defs()}
<rect width="{W}" height="{H}" fill="{CREAM}"/>
<circle cx="610" cy="120" r="150" fill="none" stroke="{OX}" stroke-opacity=".18" stroke-width="2"/>
<ellipse cx="400" cy="548" rx="190" ry="20" fill="url(#shadow)"/>
<path d="M610 -10 C 600 90, 470 120, 418 262" fill="none" stroke="url(#liquid)" stroke-width="30" stroke-linecap="round"/>
<path d="M606 -10 C 596 85, 468 118, 413 258" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="5" stroke-linecap="round"/>
<path d="M268 214 L304 520 Q306 536 322 536 L478 536 Q494 536 496 520 L532 214 Z" fill="#fff" fill-opacity=".28" stroke="{INK}" stroke-width="3"/>
<path d="M283 286 L304 520 Q306 536 322 536 L478 536 Q494 536 496 520 L517 286 Z" fill="url(#liquid)"/>
<ellipse cx="400" cy="286" rx="117" ry="13" fill="{BERRY}"/>
{cubes}{bubbles}
<path d="{splash}" fill="{HOT}" opacity=".95"/>
<ellipse cx="400" cy="214" rx="132" ry="13" fill="none" stroke="{INK}" stroke-width="3"/>
<path d="M286 228 L312 508" stroke="#fff" stroke-opacity=".6" stroke-width="7" stroke-linecap="round" fill="none"/>
</svg>
"""
    (IMG / "pour-glass.svg").write_text(svg)


def build_droplets(w=1400, h=1000, n=260, seed=11):
    """Condensation on cold red glass: stacked droplet heightfield, lit from the upper left."""
    rng = np.random.default_rng(seed)
    height = np.zeros((h, w), np.float32)
    ys, xs = np.mgrid[0:h, 0:w]
    # bigger drops are rarer
    radii = 6 + rng.pareto(2.6, n) * 9
    radii = np.clip(radii, 5, 46)
    for r in radii:
        cx, cy = rng.uniform(0, w), rng.uniform(0, h)
        r0, r1 = int(max(0, cy - r - 2)), int(min(h, cy + r + 3))
        c0, c1 = int(max(0, cx - r - 2)), int(min(w, cx + r + 3))
        if r1 <= r0 or c1 <= c0:
            continue
        dx, dy = (xs[r0:r1, c0:c1] - cx) / r, (ys[r0:r1, c0:c1] - cy) / (r * 0.92)
        d2 = dx * dx + dy * dy
        hh = np.sqrt(np.clip(1 - d2, 0, 1)) * r * 0.9
        height[r0:r1, c0:c1] = np.maximum(height[r0:r1, c0:c1], hh)
    gy, gx = np.gradient(height)
    nz = 1.0 / np.sqrt(gx * gx + gy * gy + 1)
    nx, ny = -gx * nz, -gy * nz
    lx, ly, lz = -0.45, -0.55, 0.7
    lam = np.clip(nx * lx + ny * ly + nz * lz, 0, 1)
    hx, hy, hz = lx, ly, lz + 1
    hn = math.sqrt(hx * hx + hy * hy + hz * hz)
    spec = np.clip(nx * hx / hn + ny * hy / hn + nz * hz / hn, 0, 1) ** 40
    on = (height > 0.4).astype(np.float32)
    # glass background: deep red gradient with a soft vignette
    yy = ys / h
    xx = xs / w
    base = np.stack([0.62 - 0.18 * yy, 0.05 + 0.02 * xx, 0.08 + 0.03 * xx], axis=-1)
    vig = (1 - 0.35 * ((xx - 0.5) ** 2 + (yy - 0.5) ** 2) * 2)[..., None]
    base *= vig
    # drops act as little lenses: darker rim, brighter lit side, red-tinted
    edge = np.clip(1 - nz, 0, 1)[..., None]
    drop = base * (0.55 + 0.9 * lam[..., None]) + np.array([0.10, 0.0, 0.01]) * edge
    drop += spec[..., None] * np.array([1.0, 0.92, 0.9]) * 0.9
    shadow = np.roll(on, (6, 5), (0, 1)) * (1 - on)
    out = base * (1 - 0.28 * shadow[..., None])
    out = out * (1 - on[..., None]) + drop * on[..., None]
    img = (np.clip(out, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(img).save(TEX / "glass-droplets.webp", "WEBP", quality=80, method=6)


if __name__ == "__main__":
    build_splash()
    build_pour()
    build_droplets()
    for p in (IMG / "berry-ice-splash.svg", IMG / "pour-glass.svg", TEX / "glass-droplets.webp"):
        print(p.relative_to(ROOT), p.stat().st_size // 1024, "KB")
