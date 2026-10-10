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
// setbacks chosen on the plot step: the brief takes them and every room stays inside the open space
const sb = await p.evaluate(() => {
  const keep = JSON.stringify(ST.home.setback || null), out = [];
  for (const [w, d] of [[30, 40], [30, 50], [40, 60]]) for (const t of [{ f: 3, r: 0, s: 0 }, { f: 10, r: 5, s: 5 }, { f: 15, r: 6, s: 6 }]) {
    ST.plot = Object.assign({}, ST.plot, { w, d, mode: 'sides', sides: { f: w, b: w, l: d, r: d }, area: w * d, shape: null }); ST.home.setback = t; S.design = null; ST.step = flow().indexOf('layout'); render();
    const D = S.design.D, B = D.brief, o = D.options[0]; let bad = B.setF !== t.f || B.setR !== t.r || B.sL !== t.s ? 1 : 0;
    o.floors.forEach(F => F.rooms.forEach(R => { if (R.void) return; const q = R.rect; if (q.x < B.sL - 0.05 || q.x + q.w > B.w - B.sR + 0.05 || q.y < B.setR - 0.05 || q.y + q.h > B.d - B.setF + 0.05) bad++; }));
    out.push(bad);
  }
  ST.home.setback = JSON.parse(keep); ST.plot = Object.assign({}, ST.plot, { w: 30, d: 40, mode: 'sides', sides: { f: 30, b: 30, l: 40, r: 40 }, area: 1200, shape: null }); ST.step = flow().indexOf('plot'); render();
  return { out, ui: document.querySelectorAll('#sbui input[data-sb]').length };
});
assert.equal(sb.ui, 3, 'front, back and side setbacks are typed in on the plot step'); assert.deepEqual(sb.out, sb.out.map(() => 0), 'setbacks respected');
// typing: any value that leaves a 15 x 22 ft house is taken; a value that does not fit is refused and explained
await p.fill('#sbui [data-sb="f"]', '9.5'); await p.fill('#sbui [data-sb="s"]', '2');
assert.deepEqual(await p.evaluate(() => [setbackOf().f, setbackOf().s]), [9.5, 2], 'typed setbacks are used');
await p.fill('#sbui [data-sb="r"]', '20');
assert.equal(await p.evaluate(() => setbackOf().r), 3, 'a back setback that leaves no room is refused');
assert.match(await p.textContent('#sbmsg'), /at most/, 'the limit is explained');
await p.press('#sbui [data-sb="r"]', 'Tab'); assert.equal(await p.inputValue('#sbui [data-sb="r"]'), '3', 'the box goes back to the last good value');
assert.deepEqual(errs, []);
console.log('✓ ui flow: styles change the models (' + a0 + ' → leather-sofa → parametric), placement rules hold, save/reopen, library filters (' + n + ' models), setbacks');
await b.close(); server.close();
