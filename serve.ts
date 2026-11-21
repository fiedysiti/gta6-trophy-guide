// Sunset Platinum — a tiny static server for app/ (Node 22, standard library
// only), so the guide can be run locally without a build step:
//   node serve.ts                    serves app/ on http://localhost:8080
//   node serve.ts --port 9000        serves it on another port
//   node serve.ts --host 0.0.0.0     listens on every interface (LAN testing)
// It answers GET and HEAD, refuses any other method with 405, sends the MIME
// types a browser needs, refuses any path outside app/, and logs every
// request to stderr so a failed asset load is easy to spot. This is a
// development convenience, not a web server for the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const args = process.argv.slice(2);

function flagValue(flag: string, fallback: string): string {
  const index = args.indexOf(flag);
  return index === -1 || index + 1 >= args.length ? fallback : args[index + 1];
}

const requestedPort = Number(flagValue('--port', '8080'));
const port = Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort < 65536 ? requestedPort : 8080;
const host = flagValue('--host', '127.0.0.1');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function log(method: string, path: string, status: number, bytes?: number): void {
  const size = bytes === undefined ? '' : ` ${bytes}B`;
  console.error(`[${new Date().toISOString()}] ${method} ${path} -> ${status}${size}`);
}

createServer((request, response) => {
  const path = request.url ?? '/';
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' }).end('method not allowed');
    log(request.method ?? '?', path, 405);
    return;
  }
  // A tiny readiness probe for scripts that wait on the server (screenshot
  // runs, smoke tests): /healthz answers without touching the app files.
  if (path === '/healthz' || path.startsWith('/healthz?')) {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end('ok');
    log(request.method, path, 200, 2);
    return;
  }
  const url = new URL(path, 'http://localhost');
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('bad request');
    log(request.method, path, 400);
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(pathname)));
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end('forbidden');
    log(request.method, path, 403);
    return;
  }
  let size;
  try {
    const stats = statSync(file);
    if (!stats.isFile()) throw new Error('not a file');
    size = stats.size;
  } catch {
    response.writeHead(404).end('not found');
    log(request.method, path, 404);
    return;
  }
  response.writeHead(200, {
    'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  log(request.method, path, 200, size);
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
}).listen(port, host, () => {
  console.log(`app/ is on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
});
