# REVEL® Red Berry: vintage editorial scroll story (v2)

A scroll-controlled product story for REVEL Red Berry. One persistent can travels, tilts and scales across seven print-editorial chapters while the pages scroll past it, the way the reference showcase moves its bottle.

**Chapters:** A Little Louder → Meet the Red Berry → 355 mL of Attitude → The Good Kind of Fizz → Bright. Berry. Bold. → Four Shades. One Feeling. → Make It a REVEL Moment.

## Run it

Requires Node 20+.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

### Previews without a dev server

```bash
npm run export         # static export, then:
#   standalone/revel-vintage-demo.html   one file: double-click to open
#   static/                              relative-path site: serve the folder from any host or sub-path
```

Both are committed, so they work straight from the repo. Opening `static/index.html` directly from disk is blocked by browser CORS rules for fonts and CSS masks, so use the single file for that.

### QA

```bash
npm run build && npm start &      # or any server on :3000
npm run qa                        # writes screenshots + qa-results.json to docs/qa
```

`npm run assets` regenerates the derived images from `public/revel-can.png` (needs Python 3 with Pillow and NumPy).

## How it works

```
native scroll ──► Lenis (only smoothing; driven by gsap.ticker) ──► ScrollTrigger.update
                                                                   ├─► can pose   = resolveStory(scrollY)   lib/motion.ts
                                                                   └─► reveals    = scrubbed fromTo tweens  lib/useStoryEngine.ts
```

- **Every visual is a pure function of scroll position.** There is no second interpolation loop, so reverse scroll, anchor jumps, back/forward and resizes always land on the same frame. QA verifies the can transform string is identical going forward and backward.
- **Plates.** Each chapter is a tall `<section>` with two sticky 100svh plates:
  - the *back* plate holds the background, giant type, splashes and insets;
  - the *front* plate holds copy, cards and CTAs.
  
  The fixed can layer sits between them, so headlines pass behind the can and copy is never under it. When a chapter's pinned stretch ends, the next page scrolls up over it while the can eases into its next pose.
- **Reduced motion** turns off Lenis and all reveals; the can just holds each chapter's resting pose. **Without JS** the content still renders in document order.

## Editing

| Want to change… | Edit |
|---|---|
| Chapter lengths, can poses (desktop and mobile), palette, label facts, callouts | `lib/sceneConfig.ts` |
| Copy and layout markup per chapter | `components/Scenes.tsx` |
| Reveal timing | `data-reveal` / `data-phase` / `data-at` attributes in `Scenes.tsx` (documented in `lib/useStoryEngine.ts`) |
| Styles | `app/globals.css`. Compact (phone/portrait-tablet) overrides live in one media block. |
| The product | Replace `public/revel-can.png`, then run `npm run assets` |

## Project map

```
app/            layout (fonts, boot script), page, globals.css
components/     Experience (root), CanStage, EditorialScene + Lines, Scenes, Splash, SiteChrome
lib/            sceneConfig (data), motion (pure pose math), useStoryEngine (Lenis + ScrollTrigger), splash (SVG generator)
scripts/        build-assets.py, make-standalone.mjs, qa.mjs
docs/           reference-notes, asset-map, acceptance-checklist, qa/ screenshots, reference/ frames
static/ standalone/   generated previews (npm run export)
```

## Honest limitations

- The can is a single front-view render animated in 2.5D. There is no 360° spin and no back label. A WebGL/R3F version needs a 3D model or full label artwork (see `docs/asset-map.md`).
- Verified in headless Chromium only. Safari/WebKit, Firefox and real Android/iOS devices are not tested yet.
- All copy is concept copy. Product facts are limited to what the can label shows.

See `CHANGELOG.md` for what changed from v1.
