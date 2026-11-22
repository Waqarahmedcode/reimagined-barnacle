"""Derive web assets from the single supplied product render.

Source of truth: public/revel-can.png (666x1254 RGBA, supplied artwork).
Everything generated here is either a lossless-looking re-encode, a shadow
silhouette, a crop of that same render, or a procedural print texture.
No new product artwork is invented.

Run:  python3 scripts/build-assets.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SRC = PUBLIC / "revel-can.png"

(PUBLIC / "textures").mkdir(exist_ok=True)
(PUBLIC / "imagery").mkdir(exist_ok=True)

can = Image.open(SRC).convert("RGBA")
W, H = can.size

# 1. Primary can, WebP with alpha (visually lossless, ~10x lighter than PNG).
can.save(PUBLIC / "revel-can.webp", "WEBP", quality=92, method=6, alpha_quality=100)
# Lighter encode used only by the single-file preview, where the can is inlined several times.
can.save(ROOT / "scripts" / "revel-can-lite.webp", "WEBP", quality=80, method=6, alpha_quality=90)

# 2. Cast-shadow silhouette: the can's own alpha, blurred, on a padded canvas.
pad = 120
alpha = can.getchannel("A")
sil = Image.new("L", (W + pad * 2, H + pad * 2), 0)
sil.paste(alpha, (pad, pad))
sil = sil.filter(ImageFilter.GaussianBlur(34))
shadow = Image.new("RGBA", sil.size, (40, 4, 6, 0))
shadow.putalpha(sil.point(lambda v: int(v * 0.62)))
shadow.save(PUBLIC / "revel-can-shadow.webp", "WEBP", quality=80, method=6)

# 3. Editorial insets: macro crops of the supplied render (real asset, no invention).
def crop(box, name, size):
    img = can.crop(box).convert("RGBA")
    bg = Image.new("RGBA", img.size, (170, 6, 27, 255))
    bg.alpha_composite(img)
    bg = bg.convert("RGB").resize(size, Image.LANCZOS)
    bg.save(PUBLIC / "imagery" / name, "WEBP", quality=86, method=6)

# Condensation + label sweep, upper body.
crop((int(W * 0.08), int(H * 0.07), int(W * 0.92), int(H * 0.37)), "can-detail-condensation.webp", (720, 540))
# Flavour line + zero sugar band.
crop((int(W * 0.10), int(H * 0.55), int(W * 0.90), int(H * 0.86)), "can-detail-label.webp", (720, 540))
# Lid and pull tab.
crop((int(W * 0.02), 0, int(W * 0.98), int(H * 0.17)), "can-detail-lid.webp", (720, 260))

# 4. Print-distress mask tile: mostly opaque with sparse worn specks and
#    soft blotches, like ink that didn't fully take on the paper.
rng = np.random.default_rng(7)
N = 512


def smooth_noise(scale):
    small = rng.random((N // scale + 2, N // scale + 2))
    img = Image.fromarray((small * 255).astype("uint8")).resize((N, N), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


blotch = smooth_noise(64) * 0.6 + smooth_noise(16) * 0.4
speck = rng.random((N, N))
mask = np.ones((N, N), dtype=np.float32)
mask[speck > 0.988] = 0.0                        # dry specks
mask[(blotch > 0.70) & (speck > 0.80)] = 0.0     # worn patches
mask = Image.fromarray((mask * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.6))
Image.merge("RGBA", [Image.new("L", (N, N), 0)] * 3 + [mask]).save(PUBLIC / "textures" / "ink-mask.png", optimize=True)

for f in sorted(list(PUBLIC.glob("*.webp")) + list((PUBLIC / "imagery").glob("*")) + list((PUBLIC / "textures").glob("*"))):
    print(f"{f.relative_to(ROOT)}  {f.stat().st_size // 1024} KB")
