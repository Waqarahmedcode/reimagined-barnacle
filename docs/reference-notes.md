# Reference audit: the Lagunitas IPA showcase

**Source inspected:** `Record_2026-11-23-00-26-34_965bbf4d….mp4`. This is the file actually attached. The spec names a different recording (`Record_2026-11-08-03-45-30_…`, about 5 min 53 s), which was not supplied.

- **Recording:** 480×1046 portrait screen capture, **25.8 s** long.
- **What it shows:** a Pinterest pin of a ~15 s website-design video ("Professional Website Design | Sandhill Studio") playing in a landscape band. The Pinterest player's own timecode is used below.
- **Recording layout:** the showcase runs from about recording 0:01 to 0:16. The rest is the Pinterest UI and a replay of the same pin.
- **Evidence:** `reference/showcase-0s-7s.jpg` and `reference/showcase-7s-15s.jpg`, contact sheets at 2 fps cropped to the video band.

These frames are kept for internal comparison only. None of the reference's branding, label art or copy is used on the site.

## Observed (visible in frames)

| Player time | What is on screen | Product | Motion visible between frames |
|---|---|---|---|
| 00:00–00:02 | Warm grey/cream paper. Huge distressed red condensed headline **UNLIMITED RELEASE IPA**, two lines. Round brewery seal above. Small script "Unlimited release" and the top of the next section peeking in below. Thin black left rule and a minimal top bar with a red pill button. | Photoreal bottle, tilted about 20–25°, overlapping the middle of the headline so some letters are hidden. | Bottle is still; page starts to scroll. |
| 00:02–00:04 | Page scrolls up as a whole. **INDIA PALE ALE** headline, body paragraph and a black BUY button on the left. A **ruled spec card** on the right (6.2% ABV / 51 IBU / 1.059 OG, each with a small note). | Bottle rotates to **upright** and settles at centre, slightly lower. | Bottle holds its screen position while content scrolls past it. Tilt eases out during the scroll. |
| 00:04–00:06 | Giant **MOUTHFEELS** in distressed red, full width. Small video thumbnail with caption at lower left. Two-column tasting copy and a "STYLE" subhead at right. | Upright bottle stays centred **in front of** the headline, hiding the middle letters. | Headline scrolls up behind the static bottle. |
| 00:06–00:09 | Irregular **ink splashes**: two red, one black. Each holds a small label (e.g. "ORANGE + HOPS", "PINE", "CARAMEL + MALT") and a short note. A **pint-glass photo** slides in from lower left at an angle. | Bottle still centred. | Splashes appear at different scroll points. The glass enters at a tilt and the page keeps scrolling. |
| 00:09–00:11 | **YEAR ROUND** heading. A product lineup: tap handle, bottles, cans, with tiny captions. | The hero bottle **shrinks and drops into one slot of the lineup**. | Clear scale-down and translate. This is the only moment the hero stops being "the camera subject". |
| 00:11–00:13 | Lower section: recipe/lifestyle photo (food bowl), "BEER SPEAKS. BELLIES GRUMBLE." | Small lineup bottle beside the photo. | Normal scroll. |
| 00:13–00:15 | Loops back to the opening hero. | — | Video restarts. |

## Estimated or interpreted (not recoverable from a screen recording)

- **Scroll mapping and easing:** the source is a pre-rendered showcase video, not live input. Speeds, easing curves, section heights and breakpoints cannot be measured. All values in `lib/sceneConfig.ts` are design tunables.
- **Rendering technique:** a 3D bottle vs. a sequence of photographic renders is not provable. The rotation range seen (tilted → upright) fits either.
- **Sticky-product model:** that the bottle is a single fixed element while page content scrolls is an inference. It is strongly supported by its constant screen position across 00:02–00:09 while every other element moves.
- **Colours** are not sampled. The REVEL palette comes from the supplied colour reference image instead.

## How the REVEL build maps the choreography (not the brand)

| Reference beat | REVEL chapter | Treatment |
|---|---|---|
| Tilted hero over giant distressed type | 01 The Opening, `A LITTLE LOUDER.` | Can at −10°, headline layered *behind* it, rotating print seal |
| Upright product + facts card | 02 Meet the Can, 03 The Details | Can moves right for the intro column, then upright at centre with label callouts and a ruled spec card (label facts only) |
| MOUTHFEELS + thumbnail + copy | 04 The Feeling, `THE GOOD KIND OF FIZZ.` | Giant type behind the can with opposing lateral drift; macro crop of the real can as the inset |
| Ink-splash flavour notes + angled glass photo | 05 The Flavour, `BRIGHT. BERRY. BOLD.` | Three procedural SVG splashes (two red, one ink) bloom in sequence; angled label-crop inset drifts in |
| YEAR ROUND lineup | *Not reproduced* | Only one product asset exists, so no lineup and no fabricated SKUs. Replaced by 06 The Colours, a full-red interlude with the four locked reds |
| Lifestyle / recipe close | 07 The Finale + footer | Can returns front-and-centre under an arch, with the CTA, replay and footer |
