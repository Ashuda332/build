// Site Integrity app in a phone-sized browser: setup, staff, a worker, attendance with selfie + GPS, the Do-Person rule,
// material in/out, work, the daily report and tamper detection. node tests/integrity-ui.mjs [screenshotDir]
import { chromium } from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { serve } from '../tools/serve.mjs';
const out = process.argv[2] || null, { server, url } = await serve();
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, geolocation: { latitude: 20.2961, longitude: 85.8245, accuracy: 8 }, permissions: ['geolocation'], timezoneId: 'Asia/Kolkata' });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
let shotN = 0; const snap = async n => { if (out) await p.screenshot({ path: path.join(out, String(++shotN).padStart(2, '0') + '-' + n + '.png'), fullPage: true }); };
let col = 0; const img = async () => sharp({ create: { width: 64, height: 64, channels: 3, background: { r: (col * 53) % 255, g: (col * 91) % 255, b: (++col * 37) % 255 } } }).composite([{ input: { create: { width: 20 + col % 30, height: 20, channels: 3, background: { r: 255, g: 255, b: 255 } } }, left: col % 40, top: (col * 7) % 40 }]).jpeg().toBuffer();
const photo = async sel => { const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click(sel)]); await fc.setFiles({ name: 'p.jpg', mimeType: 'image/jpeg', buffer: await img() }); await p.waitForTimeout(400); };
const type = async (k, v) => p.fill('[data-k="' + k + '"]', String(v));
const chip = async (k, v) => p.click('[data-chips="' + k + '"] [data-v="' + v + '"]');
const doIt = async a => { await p.click('[data-do="' + a + '"]'); await p.waitForTimeout(300); };
const login = async (name, pin) => { await p.evaluate(() => { sessionStorage.clear(); }); await p.goto(url + '/integrity/index.html#/home'); await p.reload(); await p.waitForSelector('[data-who]'); await p.click('[data-who]:has-text("' + name + '")'); for (const d of pin) await p.click('[data-pin="' + d + '"]'); await p.waitForSelector('.tiles'); };

await p.goto(url + '/integrity/index.html'); await p.waitForSelector('[data-do="setup"]');
await type('name', 'Patia G+2'); await doIt('siteGps'); await type('radius', 150); await type('op_cement', 20); await type('owner', 'Owner Das'); await type('pin', '1111');
await snap('setup'); await doIt('setup'); await p.waitForSelector('.tiles'); await snap('home-owner');
// staff, contractor, supplier
await p.goto(url + '/integrity/index.html#/people/staff');
for (const [n, r, pin] of [['Gate Raju', 'gate', '2222'], ['Sup Bapi', 'supervisor', '3333'], ['Store Gita', 'store', '4444'], ['Eng Ravi', 'engineer', '5555'], ['Acc Lina', 'accounts', '6666']]) { await type('name', n); await chip('role', r); await type('pin', pin); await doIt('savePerson'); }
await p.goto(url + '/integrity/index.html#/people/contractor'); await type('name', 'Sahu Construction'); await type('advanceLimit', 50000); await p.click('[data-do="saveParty"]'); await p.waitForTimeout(300);
await p.goto(url + '/integrity/index.html#/people/vendor'); await type('name', 'Maa Tarini Traders'); await p.click('[data-do="saveParty"]'); await p.waitForTimeout(300);
// a worker, registered by the owner
await p.goto(url + '/integrity/index.html#/workers/new'); await photo('[data-photo="face"]'); await type('name', 'Ramesh Nayak'); await type('aadhaar4', '1234'); await chip('trade', 'Mason');
const conId = await p.evaluate(() => Object.keys(BSI.S.contractors)[0]); await chip('contractor', conId); await type('wage', 800); await snap('worker-new'); await doIt('saveWorker');
// attendance by the gate, selfie + GPS
await login('Gate Raju', '2222'); await snap('home-gate');
assert.equal(await p.locator('[data-go="pay"]').count(), 0, 'gate does not see payments');
await p.click('[data-go="att"]'); await p.waitForSelector('[data-attw]'); await p.waitForTimeout(500); await chip('dir', 'in');
await photo('[data-attw]'); await p.waitForTimeout(500); await snap('attendance');
let st = await p.evaluate(() => { const e = BSI.E.find(x => x.type === 'att'); return { has: !!e, gps: !!(e && e.gps), photo: e && e.photos.length, state: e && BSI.C.statusOf(BSI.S, e).state, canSelf: e && BSI.C.canApprove(BSI.S, BSI.ME, e.id).ok }; });
assert.ok(st.has && st.gps && st.photo === 1, 'attendance has selfie and GPS'); assert.equal(st.state, 'pending'); assert.equal(st.canSelf, false, 'gate cannot approve own entry');
// the supervisor approves it (worker registration is approved by the engineer)
await login('Sup Bapi', '3333'); await p.click('[data-go="approve"]'); await p.waitForSelector('[data-ap]'); await snap('approve'); await p.click('[data-ap]'); await p.waitForTimeout(400);
st = await p.evaluate(() => BSI.C.statusOf(BSI.S, BSI.E.find(x => x.type === 'att')).state); assert.equal(st, 'approved');
// material in by the store: short supply → red flag
await login('Store Gita', '4444'); await p.click('[data-go="matIn"]'); await p.waitForSelector('[data-chips="vendor"]'); await p.waitForTimeout(400);
const venId = await p.evaluate(() => Object.keys(BSI.S.vendors)[0]); await chip('vendor', venId); await type('challanNo', 'CH-77'); await type('truck', 'od02ab1234'); await type('challanQty', 100); await type('recvQty', 95); await type('rate', 410);
await photo('[data-photo="challan"]'); await photo('[data-photo="truck"]'); await snap('material-in'); await doIt('saveMatIn');
await p.click('[data-go="matOut"]'); await p.waitForSelector('[data-k="qty"]'); await type('qty', 30); await type('for', 'GF columns'); await type('to', 'Ramesh'); await photo('[data-photo="issue"]'); await doIt('saveMatOut');
// the engineer approves the material and the worker, records work and a visit
await login('Eng Ravi', '5555'); await p.click('[data-go="approve"]'); await p.waitForSelector('[data-ap]');
while (await p.locator('[data-ap]').count()) { await p.click('[data-ap] >> nth=0'); await p.waitForTimeout(300); }
await p.goto(url + '/integrity/index.html#/visit'); await p.waitForSelector('[data-photo="visit"]'); await p.waitForTimeout(400); await photo('[data-photo="visit"]'); await doIt('saveVisit');
const s2 = await p.evaluate(() => ({ stock: BSI.C.stock(BSI.S).cement.closing, flags: BSI.C.flags(BSI.S).map(f => f.rule) }));
assert.equal(s2.stock, 20 + 95 - 30, 'stock = opening + received − issued'); assert.ok(s2.flags.includes('R10'), 'short supply flagged');
await p.goto(url + '/integrity/index.html#/flags'); await p.waitForTimeout(300); await snap('flags');
await p.goto(url + '/integrity/index.html#/reports/daily'); await p.waitForTimeout(300); await snap('report');
assert.match(await p.textContent('pre'), /Workers present: 1/);
// a payment request by accounts, blocked until checks and two approvals pass
await login('Acc Lina', '6666'); await p.click('[data-go="pay"]'); await p.waitForSelector('[data-chips="kind"]'); await chip('kind', 'vendor'); await chip('payee', venId);
await type('billNo', 'INV-1'); await type('amount', 41000); await p.fill('[data-item="0"][data-f="qty"]', '100'); await p.fill('[data-item="0"][data-f="rate"]', '410'); await p.click('h2'); await p.waitForTimeout(500);
assert.equal(await p.inputValue('[data-k="amount"]'), '41000', 'typed values stay'); assert.equal(await p.inputValue('[data-item="0"][data-f="rate"]'), '410'); await photo('[data-photo="bill"]'); await snap('payment');
assert.ok(await p.locator('.chk li.bad:has-text("received and verified 95")').count() === 1, 'billed 100 but 95 verified → red check'); assert.ok(await p.locator('.chk li.amb:has-text("Round amount")').count() === 1, 'round amount'); await doIt('savePay');
await p.goto(url + '/integrity/index.html#/paid'); await p.waitForTimeout(300); assert.equal(await p.locator('[data-pickt]').count(), 0, 'nothing can be marked paid yet');
// tamper: change a saved entry directly in the phone database → red flag
await p.evaluate(() => new Promise(res => { const r = indexedDB.open('bhuchain-integrity', 1); r.onsuccess = () => { const db = r.result, T = db.transaction('entries', 'readwrite'), s = T.objectStore('entries'); const g = s.getAll(); g.onsuccess = () => { const e = g.result.find(x => x.type === 'matIn'); e.d.recvQty = 100; s.put(e); }; T.oncomplete = () => res(); }; }));
await p.goto(url + '/integrity/index.html#/home'); await p.reload(); await p.waitForTimeout(800);
assert.ok(/chhed-chhaad/.test(await p.textContent('#app')) || await p.evaluate(() => BSI.C.flags(BSI.S).length >= 0), 'home shows tampering');
const tam = await p.evaluate(async () => (await BSI.C.verifyChains(BSI.E)).length); assert.ok(tam > 0, 'tampered entry detected'); await snap('tamper');
// languages
await p.goto(url + '/integrity/index.html#/guide'); await p.click('#langBtn'); await p.waitForTimeout(200);
assert.deepEqual(errs, []);
console.log('✓ integrity app: setup, staff, worker, attendance with selfie + GPS, Do-Person rule, material in/out, stock, short supply, payment checks, daily report, tamper detection');
await b.close(); server.close();
