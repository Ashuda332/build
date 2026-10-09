// Furniture UI end to end: style changes the arrangement, the library opens and filters, a design saves and reopens identically.
// node tests/ui-flow.mjs [screenshotDir]
import { chromium } from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
import { serve } from '../tools/serve.mjs';
const out = process.argv[2] || null, { server, url } = await serve();
const b = await chromium.launch(Object.assign({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }, process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}));
const p = await b.newPage({ viewport: { width: 1300, height: 1050 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.route('https://cdn.jsdelivr.net/npm/three@0.159.0/**', r => r.fulfill({ path: path.join(process.cwd(), 'node_modules/three', new URL(r.request().url()).pathname.replace('/npm/three@0.159.0/', '')), contentType: 'text/javascript' }));
await p.goto(url + '/index.html'); await p.waitForFunction(() => ASSET.cat);
await p.evaluate(() => { localStorage.clear(); ST.purpose = 'build'; ST.tier = 'ultra'; ST.seed = 7; ST.plot = Object.assign({}, ST.plot, { w: 40, d: 60, mode: 'sides', sides: { f: 40, b: 40, l: 60, r: 60 }, area: 2400 }); ST.home.bhk = 3; ST.step = flow().indexOf('layout'); render(); const ds = S.design; ds.view = '3d'; ds.v3 = 'f0'; render(); return ACT.make3d(); });
const ready = async () => { await p.waitForFunction(() => V3.scene && !document.querySelector('#dz3d .load'), null, { timeout: 120000 }); await p.waitForTimeout(600); };
await ready();
const sofa = () => p.evaluate(() => { const o = S.design.D.options[S.design.opt]; for (const F of o.floors) for (const r of F.rooms) { const s = !r.void && furnOf(S.design.D, o, F, r).find(q => q.role === 'sofa'); if (s) return s.asset || 'parametric'; } return null; });
const a0 = await sofa();
await p.selectOption('[data-fstyle]', 'traditional-indian'); await ready();
assert.equal(await sofa(), 'leather-sofa', 'Traditional Indian uses the leather sofa');
await p.selectOption('[data-fstyle]', 'minimalist'); await ready();
assert.equal(await sofa(), 'parametric', 'Minimalist uses no library sofa');
await p.addScriptTag({ path: path.join(process.cwd(), 'tests/placement-checks.js') });
assert.deepEqual(await p.evaluate(() => placementChecks(S.design.D, S.design.D.options[S.design.opt])), []);
// save, change, reopen
await p.selectOption('[data-fstyle]', 'luxury-modern'); await ready();
const before = await p.evaluate(() => ST.furnStyle + '|' + ST.tier);
await p.click('[data-a="fsave"]'); await p.evaluate(() => { ST.furnStyle = 'auto'; ST.tier = 'low'; render(); });
p.once('dialog', d => d.accept()); await p.click('[data-a="fopen"]');
assert.equal(await p.evaluate(() => ST.furnStyle + '|' + ST.tier), before, 'saved design reopens');
// library (from the 3D view of the reopened design)
await p.evaluate(() => { S.design.view = '3d'; S.design.v3 = 'f0'; render(); return ACT.make3d(); }); await ready();
await p.click('[data-a="flib"]'); await p.waitForSelector('#flib .flib-i'); const n = await p.$$eval('#flib .flib-i', x => x.length);
await p.selectOption('#flib [data-flib="cat"]', 'sofa'); const ns = await p.$$eval('#flib .flib-i', x => x.length); assert.ok(ns > 0 && ns < n);
if (out) await p.screenshot({ path: path.join(out, 'library.png') });
assert.deepEqual(errs, []);
console.log('✓ ui flow: styles change the models (' + a0 + ' → leather-sofa → parametric), placement rules hold, save/reopen, library filters (' + n + ' models)');
await b.close(); server.close();
