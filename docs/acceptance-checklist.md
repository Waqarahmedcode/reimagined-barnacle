# Acceptance checklist and QA evidence

All results below come from `scripts/qa.mjs`, run against the production build (`npm run build && npm start`) in headless Chromium on 2026-11-22.

- **Raw results:** `qa/qa-results.json`
- **Screenshots:** `qa/*.jpg`, every chapter at 1440×900 and 390×844; opening, details and finale at 320, 768 and 1920; plus menu, footer, page-turn, reduced-motion and no-JS shots.

## Build

| Check | Result |
|---|---|
| `npm install` | ✅ (Next 15.5.29, React 19.3.1, GSAP 3.15.1, Lenis 1.3.27) |
| `npm run build` | ✅ compiled; types and lint pass; `/` statically prerendered. First-load JS 162 kB (was 145 kB). |
| `npm run export` | ✅ `static/` (relative paths) + `standalone/revel-vintage-demo.html` (single file, 3.1 MB) |
| Single file opened from `file://` | ✅ engine runs, fonts load, can renders, 0 console errors |
| `static/` served from a sub-path (`/static/`) | ✅ 0 console errors. Opening `static/index.html` straight from disk hits Chrome's file-origin CORS rule for fonts and CSS masks; use the single file for double-click previews. |

## Motion and layout (5 viewports)

| Check | 1440×900 | 390×844 | 320×640 | 768×1024 | 1920×1080 |
|---|---|---|---|---|---|
| Console errors / warnings / failed requests | 0 | 0 | 0 | 0 | 0 |
| Horizontal overflow | 0 px | 0 px | 0 px | 0 px | 0 px |
| Can footprint overlapping copy, cards, splash text, CTAs or folio text (>2% of the element) | none | none | none | none | none |
| Forward vs. reverse scroll: can transforms identical at all 7 chapter positions | ✅ exact string match | ✅ | ✅ | ✅ | ✅ |

The overlap check is deliberately conservative. It uses the can's axis-aligned box, which is larger than the painted can when rotated. Giant display headlines are *meant* to sit behind the can, as in the reference, so they are excluded.

## Navigation and accessibility

| Check | Result |
|---|---|
| Menu opens; focus moves into it | ✅ desktop and mobile |
| Menu chapter link → lands exactly on the chapter (Δ 0 px), menu closes, header switches to the red-chapter theme | ✅ |
| Finale "Replay the story" → back to scrollY 0 | ✅ |
| Escape closes the menu; Tab is trapped while open; `inert` when closed | Implemented. Open + focus verified. Escape is exercised, but its result isn't asserted separately. |
| `prefers-reduced-motion: reduce` | ✅ no Lenis, no scrubbed reveals, no hidden text in any chapter (0 elements with opacity 0 or offset), can holds each chapter's pose with no travel, no copy collisions |
| JavaScript disabled | ✅ all 7 headings and the h1 ("A little louder.") render; the can shows in its opening pose |
| Accessible names | h1 reads "A little louder." (line spans keep word spacing); the can has full label alt text; insets have alt text |
| Touch targets | Menu, CTAs and buttons have a 44 px minimum height; desktop meter ticks are 24 px (desktop only) |
| Skip link, visible focus rings | ✅ (`:focus-visible` 3 px signal-red outline) |

## Performance (headless sample, 1440×900, localhost)

| Metric | Value | Caveat |
|---|---|---|
| CLS | **0** | |
| LCP | ~0.6 s | localhost, no throttling. Not a field measurement. |
| Transfer on load | ~746 KB | 209 KB WebP can (was a 1.3 MB PNG), fonts, JS |
| Frame time during real wheel scrolling (~590 frames) | median 16.7 ms, p95 33.4 ms, ~40 frames > 33 ms | Headless Chromium **without GPU acceleration**. Indicative only; profile on real devices. |

Cost centres and mitigations:

- **Compositing:** one fixed can layer with transform-only updates, a pre-baked shadow image (no runtime blur filter), and a static grain tile.
- **Known costs:** the full-screen `mix-blend-mode: multiply` grain overlay, the header `backdrop-filter`, and large masked display text. If a device struggles, drop the grain overlay first.
- **Main thread:** layout reads happen only on ScrollTrigger refresh (resize), never per frame.

**Not measured:** real-device FPS (Android Chrome, iOS Safari), INP, WebKit/Firefox rendering, touch momentum on hardware, and battery impact.

## Spec acceptance items

| Item | Status |
|---|---|
| Faithful supplied can, no redrawn label | ✅ The PNG is used as-is (WebP re-encode); no label is simulated |
| One continuous product, never reset | ✅ single DOM node; pose = f(scroll) |
| Single scroll pipeline, no competing smoothing | ✅ Lenis → ScrollTrigger; no custom lerp loop |
| Reversible, deterministic | ✅ verified (table above) |
| Progress meter: vertical scaleY on desktop, horizontal scaleX on mobile | ✅ CSS-driven from one `--progress` variable (fixes the original bug) |
| Chapter jumps, smooth back-to-top | ✅ |
| No scroll hijack, snapping, autoplay audio or flashes | ✅ |
| WebGL / true 3D | ⏸ Not built: no 3D model or label artwork was supplied (see `asset-map.md`) |
| Safari / WebKit, Android device checks | ⏸ Not run (Chromium only in this environment) |
