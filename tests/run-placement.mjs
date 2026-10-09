// Runs the placement invariants over many generated houses. Usage: node tests/run-placement.mjs [--quick]
// Needs Playwright (npm i -D playwright) and a Chromium; CHROMIUM_PATH overrides the browser binary.
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../tools/serve.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const quick = process.argv.includes('--quick');
const plots = quick ? [[30, 40], [20, 30]] : [[20, 30], [25, 40], [30, 40], [30, 50], [40, 60], [50, 80]];
const STYLES = ['auto', 'modern-indian', 'luxury-modern', 'traditional-indian', 'premium-villa', 'compact-urban', 'scandinavian', 'contemporary'];
const cases = [];
for (const [w, d] of plots) for (const bhk of [1, 2, 3, 4]) for (const floors of [1, 2]) for (const facing of quick ? ['E'] : ['E', 'N', 'W', 'S']) for (const seed of quick ? [1] : [1, 2, 3]) cases.push({ w, d, bhk, floors, facing, seed, tier: ['low', 'mid', 'high', 'ultra'][(cases.length) % 4], style: STYLES[cases.length % STYLES.length] });
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage();
const pageErrs = []; p.on('pageerror', e => pageErrs.push(e.message));
const { server, url } = await serve();
await p.goto(url + '/index.html'); await p.waitForFunction(() => window.ASSET_READY || (typeof ASSET !== 'undefined' && ASSET.cat), null, { timeout: 30000 });
await p.addScriptTag({ path: path.join(here, 'placement-checks.js') });
const res = await p.evaluate(cases => {
  const all = [], assets = {}; let houses = 0, rooms = 0, pieces = 0, skipped = 0;
  for (const c of cases) {
    try {
      ST.purpose = 'build'; ST.home.use = 'self'; ST.plot = Object.assign({}, ST.plot, { w: c.w, d: c.d, facing: c.facing, mode: 'sides', sides: { f: c.w, b: c.w, l: c.d, r: c.d }, area: c.w * c.d });
      Object.assign(ST.home, { bhk: c.bhk, floors: c.floors }); ST.seed = c.seed; ST.tier = c.tier; ST.furnStyle = c.style; ST.furnSkin = null; S.design = null; ST.step = flow().indexOf('layout'); render();
      const D = S.design && S.design.D; if (!D || !D.options.length) { skipped++; continue; }
      D.options.forEach(o => { houses++; o.floors.forEach(F => F.rooms.forEach(r => { if (!r.void) furnOf(D, o, F, r).forEach(q => { if (q.asset) assets[q.asset] = (assets[q.asset] || 0) + 1; }); })); o.floors.forEach(F => F.rooms.forEach(r => { if (!r.void) { rooms++; pieces += furnOf(D, o, F, r).filter(q => q.solid).length; } })); placementChecks(D, o).forEach(v => all.push(Object.assign({ case: c, opt: o.id }, v))); });
    } catch (e) { all.push({ case: c, msg: 'error: ' + e.message }); }
  }
  return { all, houses, rooms, pieces, skipped, assets };
}, cases);
await b.close(); server.close();
const byMsg = {}; res.all.forEach(v => { const k = v.role + ': ' + v.msg; byMsg[k] = (byMsg[k] || 0) + 1; });
console.log(`checked ${res.houses} designs, ${res.rooms} rooms, ${res.pieces} pieces (${cases.length} briefs, ${res.skipped} skipped)`);
console.log('library models placed:', res.assets);
console.log(Object.keys(byMsg).length ? byMsg : 'no violations');
if (pageErrs.length) console.log('page errors:', pageErrs.slice(0, 5));
if (res.all.length) { console.log(JSON.stringify(res.all.slice(0, 8), null, 1)); process.exit(1); }
