// Tiny static server for the repo (tests, thumbnails, local preview): node tools/serve.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './asset-lib.mjs';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css' };
export function serve(port = 0) {
  return new Promise(res => {
    const s = http.createServer((q, a) => {
      const u = decodeURIComponent(new URL(q.url, 'http://x').pathname), f = path.join(ROOT, u === '/' ? 'index.html' : u);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { a.writeHead(404); return a.end('not found'); }
      a.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(a);
    }).listen(port, '127.0.0.1', () => res({ server: s, url: 'http://127.0.0.1:' + s.address().port }));
  });
}
if (process.argv[1] && process.argv[1].endsWith('serve.mjs')) serve(+(process.argv[2] || 8080)).then(({ url }) => console.log('serving ' + url));
