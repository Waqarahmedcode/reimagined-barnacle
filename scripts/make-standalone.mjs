/**
 * Turn the Next static export (./out) into two zero-server previews:
 *
 *   static/                          relative-path copy of the export; open static/index.html
 *                                    directly or serve the folder from any sub-path
 *   standalone/revel-vintage-demo.html  one self-contained file (CSS, fonts, JS, images inlined)
 *
 * Run via:  npm run export
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'out');
const staticDir = path.join(root, 'static');
const standaloneDir = path.join(root, 'standalone');

if (!fs.existsSync(path.join(out, 'index.html'))) {
  console.error('No ./out export found. Run: STATIC_EXPORT=1 next build');
  process.exit(1);
}

// ---- 1. Relative-path static folder ------------------------------------------
fs.rmSync(staticDir, { recursive: true, force: true });
fs.cpSync(out, staticDir, { recursive: true });

const publicRoots = ['revel-can.png', 'revel-can.webp', 'revel-can-shadow.webp', 'textures/', 'imagery/'];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
}

for (const file of walk(staticDir)) {
  const ext = path.extname(file);
  if (!['.html', '.css', '.js', '.txt'].includes(ext)) continue;
  let s = fs.readFileSync(file, 'utf8');
  if (ext === '.css') {
    // CSS lives in _next/static/css/: fonts sit in ../media, public assets three levels up.
    s = s.replaceAll('url(/_next/static/media/', 'url(../media/');
    for (const r of publicRoots) s = s.replaceAll(`url('/${r}`, `url('../../../${r}`).replaceAll(`url(/${r}`, `url(../../../${r}`);
  } else {
    // HTML, RSC payload and webpack runtime: make every root-absolute asset path relative.
    s = s.replace(/(["'(\s=\\])\/_next\//g, '$1./_next/');
    for (const r of publicRoots) s = s.replace(new RegExp(`(["'(\\s=\\\\])/${r.replace('.', '\\.')}`, 'g'), `$1./${r}`);
  }
  fs.writeFileSync(file, s);
}
// Remove export artefacts that aren't needed for a static preview.
for (const f of ['404.html', '404', '_not-found', 'index.txt', '_not-found.txt']) fs.rmSync(path.join(staticDir, f), { recursive: true, force: true });

// ---- 2. Single self-contained HTML ----------------------------------------------
const mime = { '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const dataUri = (file) => `data:${mime[path.extname(file)]};base64,${fs.readFileSync(file).toString('base64')}`;
const assetUri = {};
for (const r of ['revel-can.png', 'revel-can.webp', 'revel-can-shadow.webp', 'textures/ink-mask.png', 'textures/paper-grain.svg', 'textures/glass-droplets.webp', 'textures/paper-ink.webp', ...fs.readdirSync(path.join(out, 'imagery')).map((f) => `imagery/${f}`)]) {
  assetUri[r] = dataUri(path.join(out, r));
}
// Single-file build only: every browser that runs this page decodes WebP, so the
// 1.3 MB PNG fallback would just double the file. Point it at the WebP data.
assetUri['revel-can.webp'] = dataUri(path.join(root, 'scripts', 'revel-can-lite.webp'));
assetUri['revel-can.png'] = assetUri['revel-can.webp'];

let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');

// Inline stylesheets (with fonts and images as data URIs).
html = html.replace(/<link rel="stylesheet" href="([^"]+)"[^>]*>/g, (_, href) => {
  let css = fs.readFileSync(path.join(out, href), 'utf8');
  css = css.replace(/url\(\/_next\/static\/media\/([^)]+)\)/g, (_m, f) => `url(${dataUri(path.join(out, '_next/static/media', f))})`);
  for (const [r, uri] of Object.entries(assetUri)) css = css.replaceAll(`url('/${r}')`, `url('${uri}')`).replaceAll(`url(/${r})`, `url(${uri})`);
  return `<style>${css}</style>`;
});
// Drop font preloads (fonts are inlined) and CSS preloads.
html = html.replace(/<link rel="preload" href="\/_next\/static\/media\/[^>]+>/g, '').replace(/<link rel="preload" as="style"[^>]*>/g, '');

// Inline scripts in document order. Inline scripts can't be async, so they run in order — fine for webpack's chunk queue.
html = html.replace(/<script src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const js = fs.readFileSync(path.join(out, src), 'utf8').replaceAll('</script', '<\\/script');
  return `<script>${js}</script>`;
});

// The RSC payload also names the stylesheet and chunk URLs; styles and scripts are
// already inline, so point those hints at harmless empty resources.
html = html.replace(/\/_next\/static\/css\/[\w.-]+\.css/g, 'data:text/css,');
html = html.replace(/\/_next\/static\/chunks\/[\w./-]+\.js/g, 'data:text/javascript,');
html = html.replaceAll('"/_next/"', '"./_next/"');

// Font preload hints inside the RSC payload -> the same inlined data.
html = html.replace(/\/_next\/static\/media\/([\w.-]+\.woff2)/g, (_m, f) => dataUri(path.join(out, '_next/static/media', f)));

// Images referenced from markup / RSC payload.
for (const [r, uri] of Object.entries(assetUri)) {
  html = html.replace(new RegExp(`(["'(\\s=\\\\])/${r.replace(/[.]/g, '\\.')}(?=["'\\\\)\\s])`, 'g'), `$1${uri}`);
}

fs.mkdirSync(standaloneDir, { recursive: true });
const single = path.join(standaloneDir, 'revel-vintage-demo.html');
fs.writeFileSync(single, html);

const size = (f) => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;
console.log(`static/index.html          ${size(path.join(staticDir, 'index.html'))} (+ assets)`);
console.log(`standalone/revel-vintage-demo.html  ${size(single)}`);
const leftover = html.match(/["'(]\/(_next|textures|imagery|revel-can)[^"')]*/g);
if (leftover) console.warn('WARNING: unresolved absolute paths in standalone:', [...new Set(leftover)].slice(0, 10));
