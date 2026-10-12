#!/usr/bin/env node
/* SW-Stamp — erhöht SHELL_CACHE in public/sw.js, wenn sich die App-Shell
 * (index.html, rabbit-hole.js, manifest.json) geändert hat, und hinterlegt
 * den Hash der Shell als Kommentar. check.js schlägt fehl, solange der Hash
 * nicht passt — so kann ein vergessener Cache-Bump nicht mehr live gehen.
 *
 * Aufruf:  npm run sw:stamp   (vor dem Commit)
 * Idempotent: ohne Shell-Änderung passiert nichts.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PUBLIC = path.resolve(__dirname, '..', 'public');
const SW = path.join(PUBLIC, 'sw.js');
const SHELL = ['index.html', 'rabbit-hole.js', 'manifest.json'];

const hash = crypto.createHash('sha256')
  .update(Buffer.concat(SHELL.map(function(f) { return fs.readFileSync(path.join(PUBLIC, f)); })))
  .digest('hex').slice(0, 12);

let sw = fs.readFileSync(SW, 'utf8');
const current = (sw.match(/shell-hash:\s*([0-9a-f]{12})/) || [])[1];
if (current === hash) {
  console.log('✓ Shell unverändert (' + hash + ') — SHELL_CACHE bleibt');
  process.exit(0);
}

const m = sw.match(/const SHELL_CACHE\s*=\s*'satoshi-v(\d+)';/);
if (!m) { console.error('✗ SHELL_CACHE im Format satoshi-vN nicht gefunden'); process.exit(1); }
const next = Number(m[1]) + 1;
sw = sw.replace(m[0], "const SHELL_CACHE  = 'satoshi-v" + next + "';");

if (current) sw = sw.replace(/shell-hash:\s*[0-9a-f]{12}/, 'shell-hash: ' + hash);
else sw = sw.replace(/(const SHELL_CACHE[^\n]*\n)/, '$1// shell-hash: ' + hash + '  (gesetzt von scripts/sw-stamp.js — nicht von Hand ändern)\n');

fs.writeFileSync(SW, sw);
console.log('✓ SHELL_CACHE → satoshi-v' + next + ' (shell-hash ' + hash + ')');
