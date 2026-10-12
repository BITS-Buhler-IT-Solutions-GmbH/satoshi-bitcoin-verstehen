#!/usr/bin/env node
/* Pre-Compression Build
 *
 * Erzeugt .gz und .br Varianten der statischen Files in public/.
 * Begleit zur .htaccess-Regel: wenn Apache Brotli/Gzip nicht zur
 * Laufzeit komprimiert (z. B. weil mod_deflate/mod_brotli nicht aktiv
 * ist), liefern wir vorkomprimierte Files aus dem Build aus.
 *
 * Benutzung:
 *   node scripts/compress.js
 *
 * Wirkt nur auf:
 *   index.html, rabbit-hole.js, sw.js, manifest.json, icons/*.svg
 *
 * Idempotent — überschreibt bestehende .gz/.br.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..', 'public');

const TARGETS = [
  'index.html',
  'rabbit-hole.js',
  'sw.js',
  'manifest.json',
  'sitemap.xml',
  'robots.txt',
  'icons/icon.svg',
  'icons/donation-qr.svg'
].concat(
  // Inhaltspaket aus scripts/build.js (Name enthält Hash)
  fs.readdirSync(ROOT).filter(function(f) { return /^screens\.[0-9a-f]+\.json$/.test(f); })
);

function fmtKB(bytes) { return (bytes / 1024).toFixed(1) + ' KiB'; }

function compressFile(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.warn('  - skip (missing):', rel);
    return;
  }
  const buf = fs.readFileSync(abs);
  const gz = zlib.gzipSync(buf, { level: zlib.constants.Z_BEST_COMPRESSION });
  const br = zlib.brotliCompressSync(buf, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length
    }
  });
  fs.writeFileSync(abs + '.gz', gz);
  fs.writeFileSync(abs + '.br', br);
  console.log(
    '  ✓', rel.padEnd(28),
    'orig', fmtKB(buf.length).padStart(10),
    '→ gz', fmtKB(gz.length).padStart(9),
    '→ br', fmtKB(br.length).padStart(9)
  );
}

console.log('→ Pre-Compression (Gzip + Brotli)');
TARGETS.forEach(compressFile);
console.log('\nFertig. Apache liefert via .htaccess automatisch die passende Variante aus.');
