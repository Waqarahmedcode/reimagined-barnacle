# Asset map

## Used on the site

| File | Origin | Notes |
|---|---|---|
| `public/revel-can.png` | **Supplied** (666×1254 RGBA) | Source of truth for the product. Not edited. Kept as the `<img>` fallback. |
| `public/revel-can.webp` | Derived from the PNG (`scripts/build-assets.py`) | 209 KB vs 1.3 MB, visually lossless (q92, full-quality alpha). Primary `<picture>` source, preloaded. |
| `public/revel-can-shadow.webp` | Derived: the can's own alpha, blurred | Pre-baked cast shadow, so no runtime `filter: drop-shadow`. |
| `public/imagery/pour-glass.svg` | Drawn in code (`scripts/build-illustrations.py`) | Feeling chapter inset ("Fig. 1"). Label-free vector illustration. |
| `public/imagery/berry-ice-splash.svg` | Drawn in code | Flavour chapter inset. Label-free vector illustration. |
| `public/textures/glass-droplets.webp` | Procedural lit heightfield (`build-illustrations.py`) | Cold-glass condensation layer on the red Colours chapter. |
| `public/imagery/can-detail-condensation.webp`, `can-detail-label.webp` | Crops of the supplied PNG | No longer used on the site; kept for future layouts. |
| `public/imagery/can-detail-lid.webp` | Crop of the supplied PNG | Generated but currently unused; spare for future layouts. |
| `public/textures/ink-mask.png` | Procedural (seeded noise) | Print-wear mask on display headlines. |
| `public/textures/paper-grain.svg` | Procedural SVG turbulence | Static grain tile; no per-frame canvas. |
| Ink splashes | Procedural SVG (`lib/splash.ts`), seeded | Original shapes, deterministic on server and client. |
| Fonts | Google Fonts via `next/font`, self-hosted at build | Anton, Barlow Condensed, DM Mono, DM Sans, Playfair Display (all OFL). |
| `scripts/revel-can-lite.webp` | Derived (q80) | Used **only** by the single-file preview, where the can is inlined several times. |

**Colour reference** (`#AA2829`, `#E3171A`, `#E12E30`, `#AA061B`) is used as design tokens only. The source image is not embedded.

## Designed placeholders (creative, not verified facts)

All headline and body copy is original concept copy. The only product facts shown are the ones printed on the can artwork: *Sparkling Drink, Red Berry, Natural Flavour, Zero Sugar, 355 mL (12 FL OZ)*. They are defined in `labelFacts` and `callouts` in `lib/sceneConfig.ts`.

There are no nutrition, ingredient, origin, certification, availability or price claims. The spec-card footnote says so on the page.

## Missing for the optional upgrades

| Upgrade | What's needed |
|---|---|
| True 3D can, 360° orbit | A GLB/GLTF of the can, **or** flat label artwork (full 360° wrap, ideally layered/vector) plus lid/tab reference. The single front render cannot supply the unseen sides. |
| Lifestyle / photographic insets | Licensed photography: pour shots, hands, settings. Current insets are crops of the can itself. |
| Product lineup (like the reference's YEAR ROUND) | Renders of additional real SKUs. Deliberately not fabricated. |
| Ingredient or nutrition content | Verified product data. |
