// Renders a 256 px WebP thumbnail for every catalog asset (or the ids given) into assets/thumbs/ and records it in the catalog.
// node tools/thumbs.mjs [id ...]   — needs Playwright with Chromium (CHROMIUM_PATH to override the binary)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { readCatalog, writeCatalog, THUMBS } from './asset-lib.mjs';
import { serve } from './serve.mjs';
const ids = process.argv.slice(2), cat = readCatalog(), { server, url } = await serve();
const b = await chromium.launch(Object.assign({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }, process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}));
const p = await b.newPage({ viewport: { width: 384, height: 384 } });
for (const a of cat.assets.filter(a => !ids.length || ids.includes(a.id))) {
  await p.goto(url + '/tools/preview/viewer.html?m=assets/models/' + a.file + (a.variants[0] ? '&variant=' + encodeURIComponent(a.variants[0]) : ''));
  await p.waitForFunction(() => window.done, null, { timeout: 120000 });
  const r = JSON.parse(await p.evaluate(() => window.done)); if (r.error) { console.error('✗ ' + a.id + ': ' + r.error); continue; }
  const png = await p.screenshot({ omitBackground: true }), file = a.id + '.webp';
  await sharp(png).resize(256, 256).webp({ quality: 82 }).toFile(path.join(THUMBS, file));
  a.thumb = file; console.log('✓ ' + a.id + ' thumbnail (' + r.size.join(' × ') + ' m)');
}
await b.close(); server.close(); writeCatalog(cat);
