// Bungalow exterior styles on different houses: every element stays inside the plot and on the building, the style
// keeps the plan unchanged, and each style renders without errors. node tests/exterior.mjs [screenshotDir]
import { chromium } from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
import { serve } from '../tools/serve.mjs';
const out = process.argv[2] || null, { server, url } = await serve();
const b = await chromium.launch(Object.assign({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }, process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}));
const p = await b.newPage({ viewport: { width: 1200, height: 950 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.route('https://cdn.jsdelivr.net/npm/three@0.159.0/**', r => r.fulfill({ path: path.join(process.cwd(), 'node_modules/three', new URL(r.request().url()).pathname.replace('/npm/three@0.159.0/', '')), contentType: 'text/javascript' }));
await p.goto(url + '/index.html'); await p.waitForFunction(() => ASSET.cat);
const houses = [[30, 40, 2, 3], [20, 40, 2, 2], [40, 60, 2, 4], [30, 50, 1, 2], [25, 40, 3, 3]];
const res = await p.evaluate(houses => {
  const rep = [];
  for (const [w, d, floors, bhk] of houses) {
    ST.purpose = 'build'; ST.tier = 'high'; ST.seed = 3; ST.plot = Object.assign({}, ST.plot, { w, d, mode: 'sides', sides: { f: w, b: w, l: d, r: d }, area: w * d }); Object.assign(ST.home, { floors, bhk }); S.design = null; ST.step = flow().indexOf('layout'); render();
    const D = S.design.D, o = D.options[0], plan0 = JSON.stringify(o.floors.map(F => F.rooms.map(r => [r.type, r.rect]))), bb = D.brief;
    for (const B of BUNGALOW) {
      const P = bungalowApply(D, o, B.id), prims = facadePrims(D, o).p3, bad = prims.filter(q => q.x < -0.6 || q.x + q.w > bb.w + 0.6 || q.h0 < -0.6);
      rep.push({ house: w + 'x' + d + ' G+' + (floors - 1), style: B.id, placed: P.placed.length, left: P.left.length, outOfPlot: bad.length, planChanged: JSON.stringify(o.floors.map(F => F.rooms.map(r => [r.type, r.rect]))) !== plan0 });
    }
  }
  return rep;
}, houses);
for (const r of res) { assert.equal(r.outOfPlot, 0, JSON.stringify(r)); assert.equal(r.planChanged, false, JSON.stringify(r)); assert.ok(r.placed >= 3, 'style too empty: ' + JSON.stringify(r)); }
console.log(res.map(r => r.house + ' ' + r.style + ': ' + r.placed + ' elements' + (r.left ? ', ' + r.left + ' left out' : '')).join('\n'));
// render every style on one house
await p.evaluate(() => { ST.plot = Object.assign({}, ST.plot, { w: 30, d: 50, mode: 'sides', sides: { f: 30, b: 30, l: 50, r: 50 }, area: 1500 }); Object.assign(ST.home, { floors: 2, bhk: 3 }); S.design = null; render(); S.design.view = '3d'; S.design.v3 = 'ext'; render(); return ACT.make3d(); });
const ready = async () => { await p.waitForFunction(() => V3.scene && !document.querySelector('#dz3d .load'), null, { timeout: 120000 }); await p.waitForTimeout(1500); };
await ready();
for (const id of await p.evaluate(() => BUNGALOW.map(x => x.id))) {
  await p.selectOption('[data-fbung]', id); await ready();
  if (out) { await p.evaluate(() => { V3.th = 0.45; V3.ph = 1.22; V3.dist *= 0.82; V3.redraw(); }); await p.waitForTimeout(1200); await (await p.$('#dz3d')).screenshot({ path: path.join(out, 'ext-' + id + '.png') }); }
}
// compare: one picture per style on this house, nothing changes until "Use this design"
const before = await p.evaluate(() => ST.extStyle);
await p.click('[data-a="bcmp"]'); await p.waitForFunction(() => document.querySelectorAll('#bcmp .bcmp-i img').length === BUNGALOW.length, null, { timeout: 300000 });
assert.equal(await p.evaluate(() => ST.extStyle), before, 'comparing must not change the chosen style');
if (out) await p.screenshot({ path: path.join(out, 'compare.png') });
await p.click('#bcmp [data-buse="tropical"]'); await p.waitForFunction(() => ST.extStyle === 'tropical');
assert.deepEqual(errs, []);
console.log('✓ exterior: ' + res.length + ' style × house checks, all styles rendered');
await b.close(); server.close();
