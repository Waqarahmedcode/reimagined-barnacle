/**
 * Browser QA for the REVEL story. Requires a running server (npm run build && npm start)
 * or a static export served locally.
 *
 *   node scripts/qa.mjs [baseUrl] [outDir]
 *
 * Per viewport it captures every chapter at mid-pin, measures overlap between the
 * can's footprint and readable copy blocks, checks horizontal overflow, compares
 * forward vs reverse can transforms at identical scroll positions, exercises the
 * menu and chapter navigation, and repeats a pass with prefers-reduced-motion.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

// Use a project-local playwright if present, else the globally installed one.
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const base = process.argv[2] ?? 'http://localhost:3100/';
const out = process.argv[3] ?? 'docs/qa';
fs.mkdirSync(out, { recursive: true });

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900, shots: true },
  { name: 'mobile-390', width: 390, height: 844, shots: true, mobile: true },
  { name: 'mobile-320', width: 320, height: 640, mobile: true, keyShots: true },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true, keyShots: true },
  { name: 'desktop-1920', width: 1920, height: 1080, keyShots: true },
];

const COPY = '.opening__meta,.opening__aside,.meet__copy,.stamp--meet,.spec-card,.feeling__story,.inset,.splash__text,.swatches,.colours__side,.finale__kicker,.finale__cta,.folio span';
const report = { base, when: new Date().toISOString(), viewports: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settle(page, y) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await sleep(650); // Lenis catches up with a native jump; ScrollTrigger renders
}

async function chapterPoints(page) {
  return page.evaluate(() => {
    const frame = document.querySelector('[data-frame]').offsetHeight;
    return [...document.querySelectorAll('[data-scene]')].map((s) => {
      const top = s.getBoundingClientRect().top + window.scrollY;
      return { id: s.id, mid: Math.round(top + (s.offsetHeight - frame) / 2), turn: Math.round(top + s.offsetHeight - frame / 2) };
    });
  });
}

async function measure(page, id) {
  return page.evaluate(({ id, COPY }) => {
    const img = document.querySelector('.can-image').getBoundingClientRect();
    // The PNG's painted can occupies ~4%..95.5% of the box width; trim the empty margin.
    const can = { l: img.left + img.width * 0.06, r: img.right - img.width * 0.06, t: img.top + img.height * 0.01, b: img.bottom - img.height * 0.01 };
    const sec = document.getElementById(id);
    const hits = [];
    for (const el of sec.querySelectorAll(COPY)) {
      const r = el.getBoundingClientRect();
      if (!r.width || getComputedStyle(el).display === 'none' || getComputedStyle(el).visibility === 'hidden') continue;
      const w = Math.max(0, Math.min(r.right, can.r) - Math.max(r.left, can.l));
      const h = Math.max(0, Math.min(r.bottom, can.b) - Math.max(r.top, can.t));
      const pct = (w * h) / (r.width * r.height);
      if (pct > 0.02) hits.push({ el: el.className.split(' ')[0], overlap: +(pct * 100).toFixed(1) });
    }
    const overflowX = document.documentElement.scrollWidth - window.innerWidth;
    return { hits, overflowX, can: { x: Math.round((can.l + can.r) / 2), y: Math.round((can.t + can.b) / 2), w: Math.round(can.r - can.l), h: Math.round(can.b - can.t) } };
  }, { id, COPY });
}

const rigTransform = (page) => page.evaluate(() => document.querySelector('.can-rig').style.transform + ' | ' + document.querySelector('.can-body').style.transform);

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));
  await page.goto(base, { waitUntil: 'networkidle' });
  await sleep(2200); // load entrance
  const r = { viewport: vp.name, chapters: [], errors };
  const points = await chapterPoints(page);

  // Forward pass
  const forward = {};
  for (const p of points) {
    await settle(page, p.mid);
    const m = await measure(page, p.id);
    forward[p.id] = await rigTransform(page);
    if (vp.shots || (vp.keyShots && ['opening', 'details', 'finale'].includes(p.id))) await page.screenshot({ path: path.join(out, `${vp.name}-${p.id}.jpg`), quality: 80 });
    r.chapters.push({ id: p.id, ...m });
  }
  if (vp.shots) {
    await settle(page, points[2].turn);
    await page.screenshot({ path: path.join(out, `${vp.name}-transition-details-feeling.jpg`), quality: 80 });
    await settle(page, 1e6);
    await page.screenshot({ path: path.join(out, `${vp.name}-footer.jpg`), quality: 80 });
  }

  // Reverse pass: same positions, approached from below; transforms must match exactly.
  await settle(page, 1e6);
  const mismatches = [];
  for (const p of [...points].reverse()) {
    await settle(page, p.mid);
    const t = await rigTransform(page);
    if (t !== forward[p.id]) mismatches.push({ id: p.id, forward: forward[p.id], reverse: t });
  }
  r.reverseDeterministic = mismatches.length === 0;
  r.reverseMismatches = mismatches;

  // Navigation: menu open -> chapter link -> lands on chapter, menu closes.
  if (vp.name === 'desktop-1440' || vp.name === 'mobile-390') {
    await settle(page, 0);
    await page.click('.menu-toggle');
    await sleep(800);
    const menuOpen = await page.evaluate(() => document.querySelector('#site-menu').classList.contains('menu--open'));
    const focusInMenu = await page.evaluate(() => !!document.activeElement?.closest('#site-menu'));
    if (vp.shots) await page.screenshot({ path: path.join(out, `${vp.name}-menu.jpg`), quality: 80 });
    await page.click('#site-menu a[href="#colours"]');
    await sleep(3200);
    const nav = await page.evaluate(() => {
      const s = document.getElementById('colours');
      return { delta: Math.round(window.scrollY - (s.getBoundingClientRect().top + window.scrollY)), menuClosed: !document.querySelector('#site-menu').classList.contains('menu--open'), theme: document.documentElement.dataset.theme };
    });
    await page.keyboard.press('Escape');
    // Replay CTA returns to the top.
    await settle(page, points[6].mid);
    await page.click('.finale__cta .btn--ghost');
    await sleep(3400);
    const replayY = await page.evaluate(() => Math.round(window.scrollY));
    r.navigation = { menuOpen, focusInMenu, ...nav, replayY };
  }
  report.viewports.push(r);
  await ctx.close();
}

// Performance sample (desktop): CLS, LCP and frame timing during real wheel input.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__perf = { cls: 0, lcp: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { const e = l.getEntries().at(-1); window.__perf.lcp = e.startTime; window.__perf.lcpEl = e.element?.className || e.element?.tagName; }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  await sleep(2500);
  await page.mouse.move(700, 450);
  await page.evaluate(() => { window.__frames = []; let last = performance.now(); const f = (t) => { window.__frames.push(t - last); last = t; if (window.__frames.length < 600) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 240); await sleep(70); }
  await sleep(800);
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, -320); await sleep(70); }
  await sleep(1200);
  report.performance = await page.evaluate(() => {
    const f = window.__frames.slice(5).sort((a, b) => a - b);
    const pct = (q) => +f[Math.floor(f.length * q)].toFixed(1);
    return { cls: +window.__perf.cls.toFixed(4), lcpMs: Math.round(window.__perf.lcp), lcpElement: window.__perf.lcpEl, frames: f.length, frameMsMedian: pct(0.5), frameMsP95: pct(0.95), framesOver33ms: f.filter((x) => x > 33.4).length,
      transfer: performance.getEntriesByType('resource').reduce((a, r) => a + (r.transferSize || 0), 0) + (performance.getEntriesByType('navigation')[0]?.transferSize || 0) };
  });
  await ctx.close();
}

// Reduced motion pass
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await sleep(600);
  const points = await chapterPoints(page);
  const res = { errors, chapters: [] };
  for (const p of points) {
    await page.evaluate((y) => window.scrollTo(0, y), p.mid);
    await sleep(250);
    const m = await measure(page, p.id);
    const hiddenText = await page.evaluate((id) => [...document.getElementById(id).querySelectorAll('.ln-i, [data-reveal]')].filter((e) => getComputedStyle(e).opacity === '0' || getComputedStyle(e).visibility === 'hidden' || /matrix\(1, 0, 0, 1, 0, [1-9]/.test(getComputedStyle(e).transform)).length, p.id);
    res.chapters.push({ id: p.id, hits: m.hits, hiddenText });
  }
  res.motionFlag = await page.evaluate(() => document.documentElement.dataset.motion);
  await page.screenshot({ path: path.join(out, 'reduced-motion-390-finale.jpg'), quality: 80 });
  report.reducedMotion = res;
  await ctx.close();
}

// No-JS pass: content must still be readable.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  report.noJs = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, headings: [...document.querySelectorAll('h2')].map((h) => h.textContent).length, canVisible: getComputedStyle(document.querySelector('.can-intro')).opacity }));
  await page.screenshot({ path: path.join(out, 'nojs-1440-opening.jpg'), quality: 80 });
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(out, 'qa-results.json'), JSON.stringify(report, null, 2));

// Console summary
for (const v of report.viewports) {
  const bad = v.chapters.filter((c) => c.hits.length || c.overflowX > 0);
  console.log(`\n[${v.viewport}] reverse-deterministic=${v.reverseDeterministic} errors=${v.errors.length}`);
  for (const c of bad) console.log(`  ${c.id}: overflowX=${c.overflowX} hits=${JSON.stringify(c.hits)}`);
  if (v.navigation) console.log('  nav', JSON.stringify(v.navigation));
  for (const e of v.errors) console.log('  !', e);
}
console.log('\n[performance]', JSON.stringify(report.performance));
console.log('[reduced-motion]', JSON.stringify(report.reducedMotion));
console.log('[no-js]', JSON.stringify(report.noJs));
