#!/usr/bin/env node
/**
 * Build-Check für die Satoshi-PWA.
 *
 * Läuft ohne externe Dependencies. Prüft Konsistenz zwischen
 * index.html, manifest.json, sitemap.xml, sw.js, robots.txt und
 * den hashbasierten Integritätsmechanismen für Spendenadresse + QR.
 *
 * Erwartet die Projektstruktur:
 *   /public/    — Deploy-Artifacts (index.html, sw.js, …, icons/)
 *   /server/    — nginx-Konfig (nginx-security-headers.conf)
 *   /scripts/   — diese Datei + dev-server.js
 *
 * Aufruf:   node scripts/check.js   (vom Repo-Root)
 *      oder: node check.js          (aus /scripts/ heraus)
 * Exit:     0 = alle Checks grün, 1 = mindestens ein Fehler
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Repo-Root — unabhängig vom CWD
const REPO_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const SERVER_DIR = path.join(REPO_ROOT, 'server');
const ROOT = PUBLIC_DIR; // Backwards-kompatibler Alias für die Checks unten
const errors = [];
const warnings = [];

function err(msg)  { errors.push(msg);  console.error('  ✗ ' + msg); }
function warn(msg) { warnings.push(msg); console.warn ('  ⚠ ' + msg); }
function ok(msg)   { console.log         ('  ✓ ' + msg); }
function section(name) { console.log('\n→ ' + name); }

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function readBin(rel) {
  return fs.readFileSync(path.join(ROOT, rel));
}
function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// ─── 1. index.html — Tag-Balance ──────────────────────────
section('index.html — Struktur');
// Inhaltliche Checks laufen auf der Quelle (alle Screens inline);
// die Build-Ausgabe (public/index.html + screens.*.json) wird separat geprüft.
const SRC_HTML = path.join(REPO_ROOT, 'src', 'index.html');
const html = fs.readFileSync(SRC_HTML, 'utf8');
const lines = html.split('\n').length;
const scripts = (html.match(/<script\b/gi) || []).length;
const scriptsClose = (html.match(/<\/script>/gi) || []).length;
const divs = (html.match(/<div\b/gi) || []).length;
const divsClose = (html.match(/<\/div>/gi) || []).length;
console.log('  Lines: ' + lines);
if (scripts === scriptsClose) ok('script-Tags balanciert (' + scripts + ')');
else err('script-Tags unbalanciert: ' + scripts + ' offen, ' + scriptsClose + ' geschlossen');
if (divs === divsClose) ok('div-Tags balanciert (' + divs + ')');
else err('div-Tags unbalanciert: ' + divs + ' offen, ' + divsClose + ' geschlossen');

// ─── 2. MODULES vs. Screens vs. Sitemap ───────────────────
section('Modul-Konsistenz');
const modulesMatch = html.match(/const MODULES = \[([\s\S]*?)\];/);
if (!modulesMatch) {
  err('MODULES-Array nicht gefunden in index.html');
} else {
  const moduleKeys = [];
  const re = /\{\s*key:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(modulesMatch[1])) !== null) moduleKeys.push(m[1]);
  ok('MODULES enthält ' + moduleKeys.length + ' Module');

  // Jeder MODULE-Key muss einen Screen haben
  let missingScreens = 0;
  moduleKeys.forEach(function(key) {
    if (!html.includes('id="screen-' + key + '"')) {
      err('Kein Screen für Modul-Key "' + key + '" (erwartet: id="screen-' + key + '")');
      missingScreens++;
    }
  });
  if (missingScreens === 0) ok('Alle ' + moduleKeys.length + ' Modul-Keys haben einen Screen');

  // Alle navigateTo('xxx')-Calls müssen valide Modul-Keys sein
  const navCalls = new Set();
  const navRe = /navigateTo\(['"]([a-z0-9-]+)['"]\)/gi;
  let n;
  while ((n = navRe.exec(html)) !== null) navCalls.add(n[1]);
  let unknownNav = 0;
  navCalls.forEach(function(k) {
    // Rabbit Hole erzeugt seinen Screen zur Laufzeit in rabbit-hole.js.
    if (!moduleKeys.includes(k) && k !== 'rabbithole') {
      err('navigateTo("' + k + '") referenziert kein gültiges Modul');
      unknownNav++;
    }
  });
  if (unknownNav === 0) ok(navCalls.size + ' navigateTo()-Targets alle gültig');

  // Sitemap-Konsistenz
  if (fs.existsSync(path.join(ROOT, 'sitemap.xml'))) {
    const sitemap = read('sitemap.xml');
    const sitemapKeys = [];
    const smRe = /<loc>https:\/\/[^/]+\/([^<]*)<\/loc>/g;
    let s;
    while ((s = smRe.exec(sitemap)) !== null) {
      const slug = s[1].replace(/\/$/, '');
      if (slug !== '') sitemapKeys.push(slug);
    }
    const SITEMAP_HIDDEN = ['einstellungen','anleitung','changelog','impressum','home'];
    const expectedSitemap = moduleKeys.filter(function(k) { return !SITEMAP_HIDDEN.includes(k); });
    const missing = expectedSitemap.filter(function(k) { return !sitemapKeys.includes(k); });
    const extra = sitemapKeys.filter(function(k) { return !moduleKeys.includes(k); });
    if (missing.length === 0 && extra.length === 0) {
      ok('sitemap.xml: ' + sitemapKeys.length + ' Modul-URLs, alle konsistent mit MODULES');
    } else {
      if (missing.length) err('sitemap.xml: fehlt ' + missing.join(', '));
      if (extra.length)   err('sitemap.xml: kein passendes Modul für ' + extra.join(', '));
    }
  } else {
    warn('sitemap.xml nicht gefunden');
  }
}

// ─── 3. manifest.json ─────────────────────────────────────
section('manifest.json');
try {
  const manifest = JSON.parse(read('manifest.json'));
  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color', 'icons'];
  requiredFields.forEach(function(f) {
    if (manifest[f] == null || (Array.isArray(manifest[f]) && manifest[f].length === 0)) {
      err('manifest.json: Feld "' + f + '" fehlt oder ist leer');
    }
  });
  // Empfohlene Felder
  ['id', 'scope', 'description'].forEach(function(f) {
    if (!manifest[f]) warn('manifest.json: Feld "' + f + '" fehlt (empfohlen)');
  });
  if (errors.filter(function(e) { return e.includes('manifest.json'); }).length === 0) {
    ok('Pflichtfelder vorhanden, JSON valide');
  }
} catch (e) {
  err('manifest.json: ' + e.message);
}

// ─── 4. sw.js ─────────────────────────────────────────────
section('sw.js — Service Worker');
try {
  const sw = read('sw.js');
  const cacheVer = sw.match(/SHELL_CACHE\s*=\s*['"]([^'"]+)['"]/);
  if (cacheVer) ok('Cache-Version: ' + cacheVer[1]);
  else err('SHELL_CACHE-Konstante nicht gefunden');

  if (sw.includes('skipWaiting()') && !sw.match(/event\.data[\s\S]{0,80}SKIP_WAITING/)) {
    err('skipWaiting() wird ohne SKIP_WAITING-Message-Guard aufgerufen — Update-Banner würde umgangen');
  } else {
    ok('skipWaiting nur via SKIP_WAITING-Message');
  }

  if (sw.includes('fetch(request)') && !sw.includes('signal')) {
    warn('sw.js: fetch ohne AbortSignal — keine Timeout-Absicherung');
  }
} catch (e) {
  err('sw.js: ' + e.message);
}

// ─── 5. Donation-Adresse + QR (SHA-256) ───────────────────
section('Spenden-Integrität');
try {
  const addrMatch    = html.match(/donationAddr:\s*['"]([^'"]+)['"]/);
  const hashMatch    = html.match(/donationHash:\s*['"]([0-9a-f]{64})['"]/);
  const qrHashMatch  = html.match(/donationQrHash:\s*['"]([0-9a-f]{64})['"]/);
  if (!addrMatch || !hashMatch) {
    err('SITE_CONFIG.donationAddr / donationHash nicht gefunden');
  } else {
    const calc = sha256(addrMatch[1]);
    if (calc === hashMatch[1]) ok('donationHash matcht donationAddr');
    else err('donationHash MISMATCH: erwartet ' + calc + ', konfiguriert ' + hashMatch[1]);
  }
  if (qrHashMatch) {
    if (fs.existsSync(path.join(ROOT, 'icons/donation-qr.svg'))) {
      const qrCalc = sha256(readBin('icons/donation-qr.svg'));
      if (qrCalc === qrHashMatch[1]) ok('donationQrHash matcht icons/donation-qr.svg');
      else err('donationQrHash MISMATCH: SVG-Datei hat ' + qrCalc + ', konfiguriert ' + qrHashMatch[1]);
    } else {
      err('donationQrHash konfiguriert, aber icons/donation-qr.svg fehlt');
    }
  }
} catch (e) {
  err('Spenden-Check: ' + e.message);
}

// ─── 6. robots.txt + Pflicht-Dateien ──────────────────────
section('SEO-Pflichtdateien');
['robots.txt', 'sitemap.xml', 'manifest.json', 'sw.js', 'rabbit-hole.js', 'index.html'].forEach(function(f) {
  if (fs.existsSync(path.join(ROOT, f))) ok(f + ' vorhanden');
  else err(f + ' fehlt');
});

// ─── 7. CSP-Sanity (CSS Url-Schemes prüfen) ────────────────
section('CSP-Sanity');
const cspPath = path.join(SERVER_DIR, 'nginx-security-headers.conf');
if (fs.existsSync(cspPath)) {
  const csp = fs.readFileSync(cspPath, 'utf8');
  if (csp.includes("img-src") && csp.match(/img-src[^;]*data:/)) ok("img-src enthält 'data:' (für QR-Code nötig)");
  else warn("img-src enthält kein 'data:' — QR-Code könnte blockiert werden");
} else {
  warn('server/nginx-security-headers.conf nicht gefunden');
}

// ─── 8. JavaScript-Syntax + JSON-LD ───────────────────────
section('JavaScript-Syntax & JSON-LD');
const vm = require('vm');
let inlineIdx = 0;
const scriptRe = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
let sm;
while ((sm = scriptRe.exec(html)) !== null) {
  const attrs = sm[1], body = sm[2];
  if (/src=/.test(attrs) || !body.trim()) continue;
  if (/ld\+json/.test(attrs)) {
    try { JSON.parse(body); ok('JSON-LD valide'); }
    catch (e) { err('JSON-LD ungültig: ' + e.message); }
    continue;
  }
  inlineIdx++;
  try { new vm.Script(body, { filename: 'index.html#script' + inlineIdx }); ok('Inline-Script #' + inlineIdx + ' syntaktisch ok'); }
  catch (e) { err('Inline-Script #' + inlineIdx + ': ' + e.message + (e.stack ? ' — ' + (e.stack.split('\n')[0]) : '')); }
}
['rabbit-hole.js', 'sw.js'].forEach(function(f) {
  try { new vm.Script(read(f), { filename: f }); ok(f + ' syntaktisch ok'); }
  catch (e) { err(f + ': ' + e.message); }
});

// ─── 9. Schweizer Rechtschreibung ─────────────────────────
section('Sprache (CH)');
const sharpS = html.split('\n')
  .map(function(l, i) { return { l: l, n: i + 1 }; })
  .filter(function(x) { return x.l.includes('ß') && !x.l.includes("replace(/ß/g"); });
if (sharpS.length === 0) ok('kein «ß» im Text');
else sharpS.slice(0, 5).forEach(function(x) { err('«ß» in Zeile ' + x.n + ' — in der Schweiz «ss» verwenden'); });

// ─── 10. Service-Worker-Version vs. Shell-Inhalt ──────────
// sw.js trägt den Hash der Shell-Dateien. Ändert sich die Shell, ohne dass
// SHELL_CACHE erhöht wurde, bekämen Nutzer den alten Stand aus dem Cache.
section('Service-Worker-Cache aktuell?');
try {
  const swSrc = read('sw.js');
  const shellHash = sha256(Buffer.concat(['index.html', 'rabbit-hole.js', 'manifest.json'].map(readBin))).slice(0, 12);
  const stamped = (swSrc.match(/shell-hash:\s*([0-9a-f]{12})/) || [])[1];
  if (stamped === shellHash) ok('SHELL_CACHE passt zur Shell (Hash ' + shellHash + ')');
  else err('Shell geändert, aber SW-Cache nicht erhöht → `npm run sw:stamp` ausführen');
} catch (e) { err('SW-Stamp-Check: ' + e.message); }

// ─── 11. Zeitwächter (veraltende Inhalte) ─────────────────
section('Aktualität');
const thisYear = new Date().getFullYear();
const whatIfYears = (html.match(/const WHATIF_DATA = \[([\s\S]*?)\];/) || ['', ''])[1].match(/year:\s*(\d{4})/g) || [];
const lastWhatIf = Math.max.apply(null, whatIfYears.map(function(y) { return +y.replace(/\D/g, ''); }));
if (lastWhatIf >= thisYear - 1) ok('WHATIF_DATA reicht bis ' + lastWhatIf);
else warn('WHATIF_DATA endet ' + lastWhatIf + ' — Jahr ' + (thisYear - 1) + ' ergänzen (Slider-max mitziehen)');
const buildDate = (html.match(/const APP_BUILD = '(\d{4}-\d{2}-\d{2})'/) || [])[1];
if (buildDate) {
  const ageDays = Math.round((Date.now() - new Date(buildDate).getTime()) / 86400000);
  if (ageDays > 183) warn('Letzter Build ' + buildDate + ' (' + ageDays + ' Tage) — halbjährlichen Faktencheck einplanen');
  else ok('APP_BUILD ' + buildDate + ' (' + ageDays + ' Tage alt)');
}

// ─── 12. Assets, Kaninchen, noscript ──────────────────────
section('Assets & Spiel-Konsistenz');
try {
  const manifest = JSON.parse(read('manifest.json'));
  manifest.icons.forEach(function(ic) {
    if (fs.existsSync(path.join(ROOT, ic.src))) ok('Manifest-Icon ' + ic.src);
    else err('Manifest-Icon fehlt: ' + ic.src);
  });
  if (!manifest.icons.some(function(ic) { return ic.type === 'image/png' && /512/.test(ic.sizes); })) warn('Kein PNG-Icon 512×512 im Manifest');
} catch (e) { err('Manifest-Icons: ' + e.message); }
(html.match(/(?:og:image|twitter:image)" content="https:\/\/[^/]+\/([^"]+)"/g) || []).forEach(function(m) {
  const rel = m.replace(/.*https:\/\/[^/]+\//, '').replace(/"$/, '');
  if (fs.existsSync(path.join(ROOT, rel))) ok('Social-Bild vorhanden: ' + rel);
  else err('Social-Bild fehlt: ' + rel);
});
const appleIcon = (html.match(/rel="apple-touch-icon" href="([^"]+)"/) || [])[1];
if (appleIcon && /\.png$/.test(appleIcon) && fs.existsSync(path.join(ROOT, appleIcon))) ok('apple-touch-icon ist PNG');
else warn('apple-touch-icon fehlt oder ist kein PNG (iOS ignoriert SVG)');

try {
  const rh = read('rabbit-hole.js');
  const keys = [];
  (rh.match(/keys:\s*\[([\s\S]*?)\]/g) || []).forEach(function(block) {
    (block.match(/'([a-z0-9-]+)'/g) || []).forEach(function(k) { keys.push(k.replace(/'/g, '')); });
  });
  const missingRabbits = keys.filter(function(k) { return !html.includes('data-rabbit-id="rb_' + k + '"'); });
  if (missingRabbits.length === 0) ok('Alle ' + keys.length + ' Stationen der Lernreise haben ein verstecktes Kaninchen');
  else err('Kaninchen fehlt in: ' + missingRabbits.join(', ') + ' — «Alle gefunden» wäre unerreichbar');
  const unknown = keys.filter(function(k) { return !html.includes('id="screen-' + k + '"'); });
  if (unknown.length) err('rabbit-hole.js verweist auf unbekannte Module: ' + unknown.join(', '));
} catch (e) { err('Rabbit-Check: ' + e.message); }

// ─── 13. Vorkomprimierte Dateien aktuell? ─────────────────
section('Pre-Compression');
['index.html', 'rabbit-hole.js', 'sw.js', 'manifest.json'].forEach(function(f) {
  const src = path.join(ROOT, f), gz = src + '.gz';
  if (!fs.existsSync(gz)) { warn(f + '.gz fehlt — `npm run compress`'); return; }
  if (fs.statSync(gz).mtimeMs + 1000 < fs.statSync(src).mtimeMs) warn(f + '.gz ist älter als ' + f + ' — `npm run compress` (Apache liefert sonst den alten Stand)');
  else ok(f + '.gz aktuell');
});

// ─── 14. Build-Ausgabe (Shell + Inhaltspaket) ─────────────
section('Build-Ausgabe');
try {
  const shell = read('index.html');
  const bundleRef = (shell.match(/window\.SCREEN_BUNDLE="\/([^"]+)"/) || [])[1];
  if (!bundleRef) err('public/index.html ohne SCREEN_BUNDLE — `node scripts/build.js` ausführen');
  else if (!fs.existsSync(path.join(ROOT, bundleRef))) err('Inhaltspaket fehlt: ' + bundleRef);
  else {
    const bundle = JSON.parse(read(bundleRef));
    const lazyKeys = (shell.match(/id="screen-([a-z0-9-]+)" data-lazy/g) || []).map(function(m) { return m.replace(/.*screen-|" data-lazy/g, ''); });
    const missing = lazyKeys.filter(function(k) { return !bundle[k]; });
    if (missing.length) err('Inhaltspaket ohne Inhalt für: ' + missing.join(', '));
    else ok(lazyKeys.length + ' lazy Screens, alle im Paket ' + bundleRef);
    const srcMtime = fs.statSync(SRC_HTML).mtimeMs;
    if (fs.statSync(path.join(ROOT, 'index.html')).mtimeMs + 1000 < srcMtime) err('public/index.html älter als src/index.html — `node scripts/build.js`');
    else ok('Build-Ausgabe aktuell');
  }
  let shellIdx = 0;
  (shell.match(/<script>([\s\S]*?)<\/script>/g) || []).forEach(function(block) {
    shellIdx++;
    try { new vm.Script(block.replace(/^<script>|<\/script>$/g, ''), { filename: 'public/index.html#script' + shellIdx }); }
    catch (e) { err('Minifiziertes Script #' + shellIdx + ': ' + e.message); }
  });
  ok('Shell-Scripts syntaktisch ok (' + shellIdx + ')');
} catch (e) { err('Build-Ausgabe: ' + e.message); }

// ─── Zusammenfassung ──────────────────────────────────────
console.log('\n' + '═'.repeat(50));
console.log(errors.length === 0
  ? '✓ Alle Checks grün'
  : '✗ ' + errors.length + ' Fehler');
if (warnings.length) console.log('⚠ ' + warnings.length + ' Warnung(en)');
process.exit(errors.length === 0 ? 0 : 1);
