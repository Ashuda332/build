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
// plot step: no city step, 4 sides only with the area box; the sketch follows setbacks live and shows the corner directions
assert.ok(!(await p.evaluate(() => Object.values(FLOWS).some(f => f.includes('city')))), 'no "where will you build" step');
assert.equal(await p.$$eval('[data-a="pmode"]', x => x.length), 0, 'only the 4-sides entry');
const sk0 = await p.innerHTML('#plotsk'); await p.fill('#sbui [data-sb="f"]', '6'); assert.notEqual(await p.innerHTML('#plotsk'), sk0, 'the sketch redraws while typing a setback');
assert.match(await p.textContent('#plotsk'), /SE/, 'corner directions on the road side (east road → SE, NE)');
await p.fill('#parea', '2400'); assert.equal(await p.evaluate(() => Math.round(plotShape(ST.plot.sides).area / 100)), 24, 'typing the area scales the four sides');
// home step: plot vs buildable area, what fits (1RK–4BHK), requirements, space check, and the real 2D plan
const hm = await p.evaluate(() => { document.querySelectorAll('#flib,#bcmp').forEach(x => x.remove()); ST.plot.sides = { f: 30, b: 30, l: 40, r: 40 }; applySides(); ST.home.setback = null; ST.home.floors = 2; ST.home.bhk = 3; ST.home.space = 'balanced'; ST.home.park.kind = '4w'; S.design = null; ST.step = flow().indexOf('home'); render();
  const ds = designNow(), o = ds.D.options[ds.opt], A = areaFacts();
  const a = { plan: !!document.querySelector('.hm-plan #planbox svg'), sum: document.querySelectorAll('.ar-sum > div').length, cards: document.querySelectorAll('.fit-c').length, foot: A.foot, land: A.land, st: homeCheck(ds.D, o).st, ok: canNext() };
  ST.home.floors = 1; ST.home.bhk = 4; render(); const d2 = designNow(); a.st2 = homeCheck(d2.D, d2.D.options[d2.opt]).st; a.fix = document.querySelectorAll('[data-a="hfix"]').length; a.ok2 = canNext();
  document.querySelector('[data-a="hfix"]').click(); a.ok3 = canNext();
  // never "comfortable" when the estimate is over 85% or a drawn room is under its minimum
  let bad = 0;
  for (const [w, d] of [[30, 40], [40, 60], [25, 50]]) for (let f = 1; f <= 3; f++) for (let k = 1; k <= 5; k++) { ST.plot.sides = { f: w, b: w, l: d, r: d }; applySides(); ST.home.floors = f; ST.home.bhk = k; S.design = null; const x = designNow(), oo = x.D.options[x.opt], C = homeCheck(x.D, oo); if (C.st === 'ok' && (C.V.ratio > 0.85 || C.short.length)) bad++; }
  a.bad = bad; ST.plot.sides = { f: 30, b: 30, l: 50, r: 50 }; applySides(); ST.home.floors = 2; ST.home.bhk = 3; S.design = null; render(); return a; });
assert.ok(hm.plan && hm.sum === 4 && hm.cards === 5 && hm.ok, 'the home step shows the real plan, the area summary and the fit cards: ' + JSON.stringify(hm));
assert.ok(hm.foot < hm.land, 'buildable area is the plot minus the open space');
assert.equal(hm.st2, 'no'); assert.ok(hm.fix > 0 && !hm.ok2 && hm.ok3, 'a home that does not fit is refused with fixes that work');
assert.equal(hm.bad, 0, 'an overcrowded home is never called comfortable');
// a flat on every floor: each floor has its own BHK and kitchen, and the check names the floor that does not fit
const pf = await p.evaluate(() => { const h = ST.home; h.floors = 3; h.split = 'floors'; h.perFloor = [1, 1, 3]; ST.plot.sides = { f: 30, b: 30, l: 40, r: 40 }; applySides(); S.design = null; render();
  const ds = designNow(), o = ds.D.options[ds.opt], C = homeCheck(ds.D, o), a = { brief: ds.D.brief.perFloor.join(), kit: o.floors.map(F => F.rooms.filter(r => r.type === 'kitchen' && !r.void).length).join(), st: C.st, why: C.V.why, fix: C.fixes.length, rows: document.querySelectorAll('[data-a="hpfl"]').length };
  h.split = 'house'; h.floors = 2; h.bhk = 3; ST.plot.sides = { f: 30, b: 30, l: 50, r: 50 }; applySides(); S.design = null; render(); return a; });
assert.equal(pf.brief, '1,1,3'); assert.equal(pf.kit, '1,1,1', 'a kitchen on every floor'); assert.equal(pf.rows, 12, 'a BHK choice for each floor');
assert.ok(pf.st === 'no' && /second floor/.test(pf.why) && pf.fix > 0, 'the floor that does not fit is named: ' + JSON.stringify(pf));
// resize a room on the home step: the plan changes live and the change reaches the final step, even after a budget change
await p.click('[data-a="gedit"]'); const gl = await (await p.$('#planbox .gh[data-gi^="c"]')).boundingBox();
await p.mouse.move(gl.x + gl.width / 2, gl.y + gl.height / 2); await p.mouse.down(); await p.mouse.move(gl.x + gl.width / 2 + 40, gl.y + gl.height / 2, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(300);
const rz = await p.evaluate(() => { const o = S.design.D.options[S.design.opt], a = { custom: !!o.custom, cols: o.G.cols.join() }; S.design.edit = false; ST.tier = 'high'; ST.step = flow().indexOf('layout'); render(); const o2 = S.design.D.options[S.design.opt]; a.final = o2.G.cols.join(); a.fcustom = !!o2.custom; ST.tier = 'ultra'; return a; });
assert.ok(rz.custom && rz.fcustom && rz.final === rz.cols, 'a resized plan carries into the final design: ' + JSON.stringify(rz));
// budget step: package × range; semi and full cost more than core
const bg = await p.evaluate(() => { ST.grid = null; ST.home.floors = 2; ST.home.bhk = 3; ST.step = flow().indexOf('home'); render(); ST.step = flow().indexOf('budget'); render(); const o = { pk: document.querySelectorAll('[data-a="pkg"]').length, tiers: document.querySelectorAll('.tiers [data-a="tier"]').length, lab: /Labour charge/.test(document.body.textContent) }; const t = {}; for (const k of ['core', 'semi', 'full']) { ST.pkg = k; t[k] = tierEstimate('mid').total; } ST.pkg = 'core'; return Object.assign(o, t); });
assert.equal(bg.pk, 3); assert.equal(bg.tiers, 3); assert.ok(bg.lab); assert.ok(bg.core < bg.semi && bg.semi < bg.full, 'semi and full add to the core cost');
assert.deepEqual(errs, []);
console.log('✓ ui flow: styles change the models (' + a0 + ' → leather-sofa → parametric), placement rules hold, save/reopen, library filters (' + n + ' models), setbacks, plot/home/budget steps, home fit check, flat per floor and resizable plan');
await b.close(); server.close();
