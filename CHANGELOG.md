# Changelog

## 2.0.0: Cinematic edition

### Kept from v1
- Brand system: the four locked reds, cream/ink neutrals, and the Anton / Barlow Condensed / DM Mono / DM Sans / Playfair stack.
- The supplied can PNG, unedited, as the single product visual.
- Header layout, the menu overlay pattern, the "Still thirsty?" footer, and the replay/back-to-top behaviour.
- Copy that worked: "Life tastes better a little louder", "Some flavours follow. This one leads.", "Bold by nature", "It's a mood…", "Go on. Make a scene."
- Next.js App Router + React + TypeScript, GSAP, Lenis.

### Changed, and why
- **Scroll engine unified.** v1 ran Lenis *and* its own rAF lerp on top (double smoothing) with GSAP used only for the logo. v2 has one pipeline: Lenis → ScrollTrigger, with every visual a pure function of scroll. This makes the motion deterministic and reversible, verified by QA.
- **Structure follows the reference.** v1 crossfaded five full-screen scenes under the can. In the reference, the *pages scroll* past a product that holds still and re-poses. v2 uses tall sections with sticky back/front plates around one fixed can layer. Headlines pass behind the can and copy never sits under it.
- **Chapters: 5 → 7**, per the brief: Opening, Meet, Details (spec card plus label callouts), Feeling (giant type behind the can), Flavour (ink splashes), Colours (four-reds interlude), Finale (CTA). "Explore the flavour" still jumps to the flavour chapter.
- **No fake 3D.** Removed `rotateY` on the flat PNG, which skewed the label. Motion is now translate, roll (±12°) and scale around the optical centre.
- **Shadow and light.** A pre-baked silhouette shadow that offsets with lift, plus a soft specular sweep masked to the can that shifts with roll.
- **Reveals.** Masked line reveals, staggered copy, ruled card wipes, splash blooms, opposing headline drift and a 0→355 counter, all scrubbed, so they unwind in reverse.
- **Progress meter bug fixed.** v1's Next version used `scaleY` on the horizontal mobile track. It's now one CSS variable: vertical `scaleY` on desktop, horizontal `scaleX` on compact screens. Desktop gains clickable chapter ticks.
- **Mobile** is its own composition (phones and portrait tablets), with separate pose paths and layouts per chapter, plus a short-screen tier for 320×640.
- **Accessibility.** Semantic sections with labelled headings, a proper h1, skip link, menu focus trap/Escape/`inert`, 44 px targets, reduced-motion path, no-JS rendering, and alt text for the can and insets.
- **Performance.** Can served as 209 KB WebP instead of 1.3 MB PNG; fonts self-hosted via `next/font` instead of a render-blocking CSS `@import`; no runtime blur filters on the can.
- **Facts.** Removed the "100% good energy" stamp (an unverifiable claim). The spec card shows only what's printed on the can.

### Added
- `lib/sceneConfig.ts` (all tunables), `lib/motion.ts` (pure pose math), `lib/useStoryEngine.ts`, `lib/splash.ts`.
- `scripts/build-assets.py`, `scripts/make-standalone.mjs`, `scripts/qa.mjs`.
- `docs/` with reference audit, asset map, acceptance checklist and QA screenshots.

### Removed or replaced
- `components/RevelExperience.tsx` → split into `Experience`, `CanStage`, `EditorialScene`, `Scenes`, `SiteChrome`, `Splash`.
- The hand-written vanilla `static/` copy (`site.js` / `site.css`) and the old single-file demo → both are now **generated from the Next build** (`npm run export`), so the preview can't drift from the source.
