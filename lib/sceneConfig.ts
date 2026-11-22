/**
 * REVEL scene configuration — the single source of truth for chapter content,
 * section lengths and the can's pose path.
 *
 * Everything here is editable without touching the animation plumbing in
 * lib/motion.ts. All numeric values are design tunables chosen by visual
 * testing; none are measurements of the reference recording.
 *
 * Pose units
 *   x, y   offset of the can's optical centre from the viewport centre,
 *          as a fraction of viewport width (x) / height (y)
 *   s      scale relative to the base can height (see --can-h in globals.css)
 *   r      rotateZ in degrees (kept within ±12 per the brief)
 *   lift   0..1 — how far the can floats off the page; drives the cast shadow
 *   callouts 0..1 — visibility of the label callouts (desktop only)
 *
 * Each scene has an `enter` pose (held while the chapter settles) and an
 * `exit` pose (reached at the end of the chapter's pinned stretch). Between
 * chapters the can eases exit(n) -> enter(n+1) while the next page scrolls in.
 */

export type Pose = { x: number; y: number; s: number; r: number; lift: number; callouts: number };
export type PosePair = { enter: Pose; exit: Pose };
export type Theme = 'paper' | 'paper-light' | 'oxblood' | 'crimson';

export type Scene = {
  id: string;
  number: string;
  label: string;
  theme: Theme;
  /** total section height in svh; the pinned stretch is (height - 100) */
  height: { wide: number; compact: number };
  pose: { wide: PosePair; compact: PosePair };
};

const p = (x: number, y: number, s: number, r: number, lift = 0.6, callouts = 0): Pose => ({ x, y, s, r, lift, callouts });

export const scenes: Scene[] = [
  {
    id: 'opening',
    number: '01',
    label: 'The Opening',
    theme: 'paper',
    height: { wide: 160, compact: 150 },
    pose: {
      wide: { enter: p(0.035, 0.04, 0.92, -10, 0.75), exit: p(0.05, 0.03, 1.04, -4, 0.8) },
      compact: { enter: p(0.08, 0.1, 0.92, -10, 0.75), exit: p(0.06, 0.08, 1.0, -5, 0.8) },
    },
  },
  {
    id: 'meet',
    number: '02',
    label: 'Meet the Can',
    theme: 'paper',
    height: { wide: 160, compact: 160 },
    pose: {
      wide: { enter: p(0.17, 0.03, 0.98, -3, 0.6), exit: p(0.19, 0.02, 1.0, -1.5, 0.6) },
      compact: { enter: p(0.19, -0.02, 0.86, -4, 0.6), exit: p(0.2, -0.03, 0.88, -2, 0.6) },
    },
  },
  {
    id: 'details',
    number: '03',
    label: 'The Details',
    theme: 'paper-light',
    height: { wide: 180, compact: 170 },
    pose: {
      wide: { enter: p(0.0, 0.035, 1.0, 0, 0.45, 1), exit: p(0.0, 0.03, 1.03, 0, 0.45, 1) },
      compact: { enter: p(0.0, -0.06, 0.74, 0, 0.45), exit: p(0.0, -0.065, 0.76, 0, 0.45) },
    },
  },
  {
    id: 'feeling',
    number: '04',
    label: 'The Feeling',
    theme: 'paper',
    height: { wide: 180, compact: 170 },
    pose: {
      wide: { enter: p(0.02, 0.035, 1.0, 7, 0.7), exit: p(-0.03, 0.03, 1.04, 9, 0.75) },
      compact: { enter: p(0.02, 0.0, 0.8, 7, 0.7), exit: p(-0.02, -0.005, 0.82, 9, 0.7) },
    },
  },
  {
    id: 'flavour',
    number: '05',
    label: 'The Flavour',
    theme: 'paper-light',
    height: { wide: 190, compact: 180 },
    pose: {
      wide: { enter: p(0.0, 0.03, 1.12, -6, 0.85), exit: p(0.0, 0.025, 1.17, -3, 0.9) },
      compact: { enter: p(0.0, 0.0, 0.8, -6, 0.85), exit: p(0.0, -0.005, 0.84, -3, 0.9) },
    },
  },
  {
    id: 'colours',
    number: '06',
    label: 'The Colours',
    theme: 'oxblood',
    height: { wide: 160, compact: 160 },
    pose: {
      wide: { enter: p(0.24, 0.03, 0.96, 11, 0.7), exit: p(0.26, 0.02, 0.98, 12, 0.7) },
      compact: { enter: p(0.21, -0.015, 0.72, 11, 0.7), exit: p(0.22, -0.02, 0.74, 12, 0.7) },
    },
  },
  {
    id: 'finale',
    number: '07',
    label: 'The Finale',
    theme: 'crimson',
    height: { wide: 160, compact: 150 },
    pose: {
      wide: { enter: p(0.0, 0.0, 1.0, -3, 0.7), exit: p(0.0, -0.005, 1.04, -1, 0.75) },
      compact: { enter: p(0.0, -0.035, 0.82, -3, 0.7), exit: p(0.0, -0.04, 0.84, -1, 0.75) },
    },
  },
];

/** Viewports that use the stacked "compact" composition (phones, portrait tablets). */
export const COMPACT_QUERY = '(max-width: 899px), (max-aspect-ratio: 4/5)';

/** The four locked brand reds, plus supporting neutrals. */
export const palette = {
  oxblood: '#AA2829',
  signal: '#E3171A',
  berry: '#E12E30',
  crimson: '#AA061B',
  paper: '#EEE9DC',
  paperLight: '#F7F1E5',
  ink: '#211B18',
  cream: '#FFF9EF',
} as const;

export const swatches = [
  { name: 'Oxblood', hex: palette.oxblood, note: 'Headlines & print ink' },
  { name: 'Signal', hex: palette.signal, note: 'Accents that shout' },
  { name: 'Berry Pop', hex: palette.berry, note: 'The fizz, in colour' },
  { name: 'Deep Crimson', hex: palette.crimson, note: 'After-dark chapters' },
];

/**
 * Facts shown on the details card. Only what is printed on the supplied can
 * artwork. Add more rows here only once they are verified.
 */
export const labelFacts = [
  { key: 'Volume', value: '355', unit: 'mL', note: '12 FL OZ, as printed on the can' },
  { key: 'Sugar', value: 'Zero', unit: '', note: '“Zero Sugar” per the can label' },
  { key: 'Flavour', value: 'Red Berry', unit: '', note: 'Natural flavour, per the label' },
  { key: 'Format', value: 'Sparkling', unit: '', note: 'Sparkling drink in an aluminium can' },
];

/**
 * Label callouts drawn beside the can in the details chapter. `at` is the
 * vertical position on the can artwork (0 = top of lid, 1 = base), measured
 * from public/revel-can.png.
 */
export const callouts = [
  { at: 0.476, text: 'Sparkling drink' },
  { at: 0.705, text: 'Red berry · natural flavour' },
  { at: 0.838, text: 'Zero sugar' },
  { at: 0.905, text: '355 mL / 12 fl oz' },
];
