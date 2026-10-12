#!/usr/bin/env node
/* Build — erzeugt die ausgelieferte App aus src/index.html
 *
 *   src/index.html  (einzige Quelle, alle Module inline — hier editieren)
 *        │
 *        ├─► public/index.html          Shell: CSS, JS, Startseite; alle anderen
 *        │                              Screens leer mit data-lazy
 *        └─► public/screens.<hash>.json Inhalte der übrigen Screens {key: html}
 *
 * Zusätzlich: HTML-Kommentare entfernen, CSS/JS mit esbuild minifizieren
 * (nur wenn installiert — `npm install`; sonst unminifiziert mit Warnung).
 * Die Laufzeit-Seite (loadScreenBundle/materializeScreen in index.html)
 * befüllt Screens beim ersten Aufruf.
 *
 * Aufruf: node scripts/build.js   (Teil von `npm run build` und `npm run dev`)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..');
const SRC = path.join(REPO, 'src', 'index.html');
const OUT_DIR = path.join(REPO, 'public');
const OUT_HTML = path.join(OUT_DIR, 'index.html');

// Screens, die direkt im HTML bleiben (sofort sichtbar / ohne Wartezeit nötig)
const EAGER = ['home'];

let esbuild = null;
try { esbuild = require('esbuild'); } catch (e) { /* optional */ }

const src = fs.readFileSync(SRC, 'utf8');

// ── 1. Screens finden (Div-Tiefe zählen, Kommentare überspringen) ──
function matchingDivEnd(html, openEnd) {
  let depth = 1, i = openEnd;
  const re = /<!--[\s\S]*?-->|<div\b|<\/div>/g;
  re.lastIndex = openEnd;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[0].startsWith('<!--')) continue;
    if (m[0] === '</div>') { if (--depth === 0) return m.index; }
    else depth++;
  }
  throw new Error('Kein schliessendes </div> ab Position ' + i);
}

const screenRe = /<div class="screen( active)?" id="screen-([a-z0-9-]+)">/g;
const screens = [];
let sm;
while ((sm = screenRe.exec(src)) !== null) {
  const openEnd = sm.index + sm[0].length;
  const closeIdx = matchingDivEnd(src, openEnd);
  screens.push({ key: sm[2], active: !!sm[1], tagStart: sm.index, openEnd, closeIdx });
  screenRe.lastIndex = closeIdx;
}
if (screens.length < 10) throw new Error('Nur ' + screens.length + ' Screens gefunden — Struktur geändert?');

const stripComments = (html) => html.replace(/<!--(?!\s*\[if)[\s\S]*?-->/g, '');

// ── 2. Shell + Bundle zusammensetzen ───────────────────────────────
const bundle = {};
let shell = '', cursor = 0;
for (const s of screens) {
  shell += src.slice(cursor, s.openEnd);
  const inner = src.slice(s.openEnd, s.closeIdx);
  if (EAGER.includes(s.key)) {
    shell += inner;
  } else {
    bundle[s.key] = stripComments(inner).trim();
    shell = shell.slice(0, shell.length - (s.openEnd - s.tagStart)) +
      src.slice(s.tagStart, s.openEnd).replace('">', '" data-lazy>');
  }
  cursor = s.closeIdx;
}
shell += src.slice(cursor);

const bundleJson = JSON.stringify(bundle);
const hash = crypto.createHash('sha256').update(bundleJson).digest('hex').slice(0, 10);
const bundleName = 'screens.' + hash + '.json';

// Alte Bundles entfernen, neues schreiben
fs.readdirSync(OUT_DIR).filter((f) => /^screens\.[0-9a-f]+\.json(\.gz|\.br)?$/.test(f) && !f.startsWith(bundleName))
  .forEach((f) => fs.unlinkSync(path.join(OUT_DIR, f)));
fs.writeFileSync(path.join(OUT_DIR, bundleName), bundleJson);

// Bundle-Pfad + Preload für Deep-Links (/blockchain …) früh im <head>
const headScript = '<script>window.SCREEN_BUNDLE="/' + bundleName + '";' +
  'if(location.pathname!=="/"&&location.pathname!=="/index.html"){var l=document.createElement("link");' +
  'l.rel="preload";l.as="fetch";l.crossOrigin="anonymous";l.href=window.SCREEN_BUNDLE;document.head.appendChild(l);}</script>';
shell = shell.replace('<meta charset="UTF-8">', (m) => m + '\n  ' + headScript);
if (!shell.includes('window.SCREEN_BUNDLE')) shell = shell.replace('<head>', '<head>\n  ' + headScript);

// ── 3. Minifizieren ────────────────────────────────────────────────
shell = stripComments(shell);
let jsBefore = 0, jsAfter = 0, cssBefore = 0, cssAfter = 0;
if (esbuild) {
  shell = shell.replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (all, attrs, css) => {
    cssBefore += css.length;
    const out = esbuild.transformSync(css, { loader: 'css', minify: true, charset: 'utf8' }).code.trim();
    cssAfter += out.length;
    return '<style' + attrs + '>' + out + '</style>';
  });
  shell = shell.replace(/<script>([\s\S]*?)<\/script>/g, (all, js) => {
    if (js.length < 2000) return all; // kleine Snippets unverändert
    jsBefore += js.length;
    // Top-Level-Namen bleiben erhalten (onclick-Handler im HTML brauchen sie),
    // nur lokale Bezeichner werden gekürzt.
    const out = esbuild.transformSync(js, {
      loader: 'js', charset: 'utf8', target: 'es2017',
      minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: true
    }).code.trim();
    jsAfter += out.length;
    return '<script>' + out + '</script>';
  });
} else {
  console.warn('  ⚠ esbuild nicht installiert (`npm install`) — CSS/JS bleiben unminifiziert');
}

fs.writeFileSync(OUT_HTML, shell);

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log('→ Build');
console.log('  ✓ ' + screens.length + ' Screens, davon ' + (screens.length - Object.keys(bundle).length) + ' eager (' + EAGER.join(', ') + ')');
console.log('  ✓ public/index.html   ' + kb(shell.length) + '  (Quelle ' + kb(src.length) + ')');
console.log('  ✓ public/' + bundleName + '  ' + kb(bundleJson.length));
if (esbuild) console.log('  ✓ minifiziert: JS ' + kb(jsBefore) + ' → ' + kb(jsAfter) + ', CSS ' + kb(cssBefore) + ' → ' + kb(cssAfter));
