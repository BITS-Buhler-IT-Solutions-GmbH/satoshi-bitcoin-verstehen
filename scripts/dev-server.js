// Tiny static dev server with SPA fallback (mirrors nginx try_files).
// Serves /public/ vom Repo-Root aus — entspricht dem Document-Root in
// Produktion. Run: `node scripts/dev-server.js` vom Repo-Root.
// Nicht deployt — nur lokales Testing.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// /public ist Document-Root, unabhängig vom CWD
const ROOT = path.resolve(__dirname, '..', 'public');
const PORT = 8765;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.xml':  'application/xml',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

// Textantworten gzip-komprimiert senden (wie Apache/nginx in Produktion),
// damit lokale Lighthouse-Messungen realistisch sind.
function send(req, res, type, data) {
  const headers = { 'Content-Type': type, 'Cache-Control': 'no-cache' };
  if (/text|javascript|json|xml|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    data = zlib.gzipSync(data, { level: 6 });
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
  }
  res.writeHead(200, headers);
  res.end(data);
}

http.createServer((req, res) => {
  const parsed = new URL(req.url, 'http://localhost');
  let filePath = path.join(ROOT, decodeURIComponent(parsed.pathname));

  // Block path traversal
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // SPA fallback: any non-asset path falls through to index.html
        const isAsset = /\.[a-z0-9]{2,5}$/i.test(parsed.pathname);
        if (!isAsset) {
          fs.readFile(path.join(ROOT, 'index.html'), (e2, d2) => {
            if (e2) { res.writeHead(404); res.end('Not found'); return; }
            send(req, res, MIME['.html'], d2);
          });
          return;
        }
        res.writeHead(404); res.end('Not found'); return;
      }
      const ext = path.extname(filePath).toLowerCase();
      send(req, res, MIME[ext] || 'application/octet-stream', data);
    });
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('Dev server with SPA fallback on http://127.0.0.1:' + PORT);
});
