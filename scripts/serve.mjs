#!/usr/bin/env node
/* Zero-dependency static server for development.
   http://localhost:5178 serves the repo root; "/" → /demo/ ; unknown /demo/* paths without an
   extension fall back to /demo/index.html (SPA). PORT env overrides the port. */
import { createServer } from 'node:http';
import { createReadStream, statSync, existsSync } from 'node:fs';
import { join, resolve, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT) || 5178;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.map': 'application/json',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = createServer((req, res) => {
  let path;
  try { path = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { return send(res, 400, 'Bad request'); }
  if (path === '/' || path === '') { res.writeHead(302, { Location: '/demo/' }); return res.end(); }
  let file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT + sep) && file !== ROOT) return send(res, 403, 'Forbidden');
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith('/')) { res.writeHead(301, { Location: `${path}/` }); return res.end(); }
    file = join(file, 'index.html');
  }
  if (!existsSync(file)) {
    if (path.startsWith('/demo/') && !extname(path)) file = join(ROOT, 'demo', 'index.html');
    else return send(res, 404, `Not found: ${path}`);
  }
  const headers = {
    'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  };
  if (file.endsWith('sw.js')) headers['Service-Worker-Allowed'] = '/demo/';
  res.writeHead(200, headers);
  createReadStream(file).pipe(res);
});

server.listen(PORT, () => console.log(`AraminConsole dev server → http://localhost:${PORT}/demo/`));
