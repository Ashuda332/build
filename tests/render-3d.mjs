// Renders the furnished dollhouse view for a few briefs and saves screenshots: node tests/render-3d.mjs <outDir> [style] [tier]
// three.js is served from node_modules (same version as the CDN), so this works offline.
import { chromium } from 'playwright';
import path from 'node:path';
import { serve } from '../tools/serve.mjs';
const [out = '.', style = 'auto', tier = 'ultra', plot = '40x60', bhk = '3', extf = 'auto'] = process.argv.slice(2);
const { server, url } = await serve();
const b = await chromium.launch(Object.assign({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }, process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}));
const p = await b.newPage({ viewport: { width: 1300, height: 1000 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || /failed|warn/i.test(m.text()) && !/swiftshader|GPU stall|GroupMarker|deprecated/.test(m.text())) errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
await p.route('https://cdn.jsdelivr.net/npm/three@0.159.0/**', r => r.fulfill({ path: path.join(process.cwd(), 'node_modules/three', new URL(r.request().url()).pathname.replace('/npm/three@0.159.0/', '')), contentType: 'text/javascript' }));
await p.goto(url + '/index.html'); await p.waitForFunction(() => ASSET.cat, null, { timeout: 30000 });
const [w, d] = plot.split('x').map(Number);
await p.evaluate(([style, tier, w, d, bhk, extf]) => { ST.purpose = 'build'; ST.tier = tier; ST.furnStyle = style; ST.seed = 7; ST.plot = Object.assign({}, ST.plot, { w, d, mode: 'sides', sides: { f: w, b: w, l: d, r: d }, area: w * d }); ST.home.bhk = bhk; ST.extFinish = extf; ST.step = flow().indexOf('layout'); render(); const ds = S.design; ds.view = '3d'; ds.v3 = 'f0'; render(); return ACT.make3d(); }, [style, tier, w, d, +bhk, extf]);
await p.waitForFunction(() => V3.scene, null, { timeout: 120000 }); await p.waitForTimeout(2500);
await p.evaluate(() => { V3.dist *= 0.75; V3.ph = 0.7; V3.redraw(); }); await p.waitForTimeout(2500);
const f = path.join(out, `dollhouse-${style}-${tier}.png`); await (await p.$('#dz3d')).screenshot({ path: f });
await p.evaluate(() => { const o = S.design.D.options[S.design.opt], r = o.floors[0].rooms.find(x => x.type === 'living'); if (!r) return; const R = r.rect; V3.target.set(R.x + R.w / 2, 2.5, R.y + R.h / 2); V3.dist = Math.max(R.w, R.h) * 1.35; V3.ph = 0.85; V3.th = 0.5; V3.redraw(); });
await p.waitForTimeout(2500); await (await p.$('#dz3d')).screenshot({ path: f.replace('.png', '-living.png') });
// outside
await p.evaluate(() => { S.design.v3 = 'ext'; mount3D(); }); await p.waitForFunction(() => V3.scene && !document.querySelector('#dz3d .load'), null, { timeout: 120000 }); await p.waitForTimeout(2500);
await (await p.$('#dz3d')).screenshot({ path: f.replace('.png', '-outside.png') });
const info = await p.evaluate(() => ({ loaded: Object.keys(ASSET.loaded), failed: ASSET.failed }));
console.log(f, JSON.stringify(info)); if (errs.length) console.log(errs.slice(0, 10).join('\n'));
await b.close(); server.close();
