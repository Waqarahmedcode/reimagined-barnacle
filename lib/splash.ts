/**
 * Deterministic ink-splash generator. Produces an irregular blob with short
 * radial drips plus a few detached droplets, as an SVG path in a 200x200 box.
 * Seeded, so server and client render identical markup (no hydration drift).
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = [number, number];

/** Closed Catmull-Rom spline through points, as cubic Béziers. */
function smoothClosed(pts: Pt[]) {
  const n = pts.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

export type Splash = { body: string; drops: { cx: number; cy: number; r: number }[] };

export function makeSplash(seed: number, { spikes = 9, roughness = 0.16, reach = 0.32 } = {}): Splash {
  const rand = mulberry32(seed);
  const cx = 100, cy = 100, base = 58;
  const steps = 72;
  // Choose spike angles first so they are spread around the blob.
  const spikeAt = Array.from({ length: spikes }, (_, k) => (k / spikes) * Math.PI * 2 + rand() * 0.5);
  const pts: Pt[] = [];
  const phase = rand() * 10;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    let r = base * (1 + roughness * (Math.sin(a * 3 + phase) * 0.5 + Math.sin(a * 7 + phase * 2) * 0.3 + (rand() - 0.5) * 0.4));
    for (const s of spikeAt) {
      const d = Math.atan2(Math.sin(a - s), Math.cos(a - s));
      const w = 0.07 + rand() * 0.02;
      if (Math.abs(d) < w * 2.2) r += base * reach * Math.exp(-(d * d) / (w * w)) * (0.6 + rand() * 0.6);
    }
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  const drops = Array.from({ length: 5 }, () => {
    const a = rand() * Math.PI * 2;
    const dist = base * (1.45 + rand() * 0.25);
    return { cx: +(cx + Math.cos(a) * dist).toFixed(1), cy: +(cy + Math.sin(a) * dist).toFixed(1), r: +(2 + rand() * 5).toFixed(1) };
  });
  return { body: smoothClosed(pts), drops };
}
