// Site Integrity core rules: node tests/integrity-core.mjs
import assert from 'node:assert/strict';
import * as C from '../integrity/core.js';

const chains = {}, all = [];
const T0 = Date.parse('2026-10-12T08:00:00+05:30');
let clock = T0;
const at = (h, m = 0, dayOff = 0) => new Date(T0 + dayOff * 864e5 + ((h - 8) * 60 + m) * 6e4).toISOString();
const site = { lat: 20.2961, lng: 85.8245 }, here = { lat: 20.2962, lng: 85.8246, acc: 10 }, far = { lat: 20.35, lng: 85.9, acc: 10 };
let n = 0; const ph = (kind, ah) => ({ h: 'h' + (++n), kind, ts: Date.now(), ah: ah || ((n * 2654435761) >>> 0).toString(16).padStart(16, '0').slice(0, 16) });
async function add(dev, type, by, d, x = {}) { const ch = chains[dev] = chains[dev] || []; const e = await C.makeEntry(ch, Object.assign({ dev, type, by, d, at: x.at || new Date(clock += 60000).toISOString(), gps: x.gps === undefined ? here : x.gps, photos: x.photos || [] }, {})); ch.push(e); all.push(e); return e; }
const S = () => C.build(all);

// setup by the owner
const siteE = await add('A', 'site', null, { name: 'Patia G+2', lat: site.lat, lng: site.lng, radius: 150, opening: { cement: 50 } });
const owner = await add('A', 'person', null, { name: 'Owner', role: 'owner', pin: 'x' });
const eng = await add('A', 'person', owner.id, { name: 'Eng Ravi', role: 'engineer' });
const eng2 = await add('A', 'person', owner.id, { name: 'Eng Mina', role: 'engineer' });
const sup = await add('A', 'person', owner.id, { name: 'Sup Bapi', role: 'supervisor' });
const store = await add('A', 'person', owner.id, { name: 'Store Gita', role: 'store' });
const gate = await add('A', 'person', owner.id, { name: 'Gate Raju', role: 'gate' });
const acc = await add('A', 'person', owner.id, { name: 'Acc Lina', role: 'accounts' });
const con = await add('A', 'contractor', owner.id, { name: 'Sahu Construction', advanceLimit: 50000 });
const ven = await add('A', 'vendor', owner.id, { name: 'Maa Tarini Traders' });
await add('A', 'rate', owner.id, { vendor: ven.id, material: 'cement', rate: 410 });

// permissions
assert.equal(C.canCreate(S(), gate.id, 'att'), true);
assert.equal(C.canCreate(S(), gate.id, 'pay'), false, 'attendance staff cannot raise payments');
assert.equal(C.canCreate(S(), store.id, 'matIn'), true);

// workers, including a double registration under another contractor
const w1 = await add('A', 'worker', sup.id, { name: 'Ramesh Nayak', aadhaar4: '1234', trade: 'Mason', contractor: con.id, wage: 800 }, { photos: [ph('face', 'aaaaaaaaaaaaaaaa')] });
const w2 = await add('A', 'worker', sup.id, { name: 'Suresh Das', aadhaar4: '5678', trade: 'Helper', contractor: con.id, wage: 500 }, { photos: [ph('face', '0f0f0f0f0f0f0f0f')] });
const ghost = await add('A', 'worker', sup.id, { name: 'Ramesh N', aadhaar4: '1234', trade: 'Mason', contractor: 'other', wage: 800 }, { photos: [ph('face', 'aaaaaaaaaaaaaaab')] });
for (const w of [w1, w2, ghost]) await add('A', 'approve', eng.id, { target: w.id });
assert.ok(C.flags(S()).some(f => f.rule === 'R4' && /ghost/.test(f.text)), 'ghost worker flagged');

// Do-Person rule: the maker cannot approve
const a1 = await add('B', 'att', gate.id, { worker: w1.id, dir: 'in' }, { at: at(8), photos: [ph('selfie')] });
assert.equal(C.canApprove(S(), gate.id, a1.id).ok, false, 'gate cannot approve own attendance (and the role cannot approve)');
assert.equal(C.canApprove(S(), sup.id, a1.id).ok, true);
const a2 = await add('B', 'att', gate.id, { worker: w1.id, dir: 'out' }, { at: at(17), photos: [ph('selfie')] });
const a3 = await add('B', 'att', gate.id, { worker: w2.id, dir: 'in' }, { at: at(8, 5), photos: [ph('selfie')] });
const a4 = await add('B', 'att', gate.id, { worker: w2.id, dir: 'out' }, { at: at(13), photos: [ph('selfie')] });
const a5 = await add('B', 'att', gate.id, { worker: w2.id, dir: 'in' }, { at: at(22, 30, 1), gps: far, photos: [ph('selfie')] });
for (const a of [a1, a2, a3, a4, a5]) await add('C', 'approve', sup.id, { target: a.id });
let s = S();
assert.equal(C.statusOf(s, a1).state, 'approved');
const md = C.workerDays(s, '2026-10-12', '2026-10-12');
assert.equal(md[w1.id], 1, '9 hours = 1 day'); assert.equal(md[w2.id], 0.5, '5 hours = half day');
const F1 = C.flags(s);
assert.ok(F1.some(f => f.rule === 'R2'), 'attendance outside the site'); assert.ok(F1.some(f => f.rule === 'R3' && f.ref === a5.id), 'night attendance'); assert.ok(!F1.some(f => f.rule === 'R3' && f.ref === a1.id), '8 am is not odd');

// an entry without proof is unverified
const noProof = await add('B', 'att', gate.id, { worker: w1.id, dir: 'in' }, { at: at(9, 0, 2), gps: null });
assert.equal(C.statusOf(S(), noProof).state, 'unverified');

// materials: short supply, stock, theoretical vs actual
const m1 = await add('D', 'matIn', store.id, { material: 'cement', vendor: ven.id, challanNo: 'CH-1', challanQty: 100, recvQty: 96, truck: 'OD02AB1234', rate: 410 }, { photos: [ph('challan'), ph('truck')] });
await add('C', 'approve', eng.id, { target: m1.id });
s = S(); assert.equal(C.stock(s).cement.closing, 50 + 96); assert.ok(C.flags(s).some(f => f.rule === 'R10' && f.sev === 'red'), '4% short supply is red');
const wk = await add('C', 'work', sup.id, { work: 'rccSlab', qty: 5, location: 'GF slab bay 1', weight: 10 }, { photos: [ph('work')] });
await add('C', 'approve', eng.id, { target: wk.id });
await add('C', 'visit', eng.id, { purpose: 'slab check' }, { photos: [ph('visit')] });
await add('D', 'matOut', store.id, { material: 'cement', qty: 52, for: 'GF slab', to: 'Ramesh' }, { photos: [ph('issue')] });
s = S(); const u = C.usageCheck(s).find(x => x.material === 'cement');
assert.equal(u.theoretical, 40.3); assert.equal(u.sev, 'red', '52 bags for 40.3 bags of work is red');
const sc = await add('D', 'stockCount', eng.id, { material: 'cement', qty: 80 }, { photos: [ph('count')] });
assert.ok(C.flags(S()).some(f => f.rule === 'R11'), 'physical count vs book');

// re-check by a second engineer
const rc = await add('E', 'recheck', eng2.id, { target: wk.id, measuredQty: 4.2, ok: true }, { photos: [ph('recheck')] });
assert.ok(C.flags(S()).some(f => f.rule === 'R16'), 're-check 16% short is red');

// payments: wages vs attendance, duplicate, two approvals with the owner, separation of duties
const p1 = await add('F', 'pay', acc.id, { kind: 'wages', payee: con.id, billNo: 'W-41', amount: 2000, from: '2026-10-12', to: '2026-10-12', claimedDays: 3 }, { photos: [ph('bill')] });
s = S(); const ck = C.payChecks(s, p1);
assert.ok(ck.some(c => !c.ok && /Man-days claimed 3 vs attendance 1.5/.test(c.label)), 'man-days over attendance');
assert.ok(ck.some(c => !c.ok && /Wage amount/.test(c.label)), 'amount over attendance × wage');
assert.equal(C.canApprove(s, sup.id, p1.id).ok, false, 'supervisor cannot approve payments');
const p2 = await add('F', 'pay', acc.id, { kind: 'wages', payee: con.id, billNo: 'W-41', amount: 1200, from: '2026-10-12', to: '2026-10-12' }, { photos: [ph('bill')] });
assert.ok(C.payChecks(S(), p2).some(c => !c.ok && /duplicate/.test(c.label)), 'duplicate bill number');
await add('G', 'approve', eng.id, { target: p2.id });
assert.equal(C.statusOf(S(), p2).state, 'pending', 'one approval is not enough');
await add('G', 'approve', eng2.id, { target: p2.id });
assert.ok(C.statusOf(S(), p2).ownerNeeded, 'two engineers without the owner is not enough');
await add('G', 'approve', owner.id, { target: p2.id });
assert.equal(C.statusOf(S(), p2).state, 'approved');
assert.equal(C.payReady(S(), p2), false, 'still blocked by the duplicate check');
await add('F', 'paid', acc.id, { target: p2.id, utr: 'UTR1' }, { photos: [ph('receipt')] });
assert.ok(C.flags(S()).some(f => f.rule === 'R8'), 'paid before checks passed');
// conflict of interest blocks the approver
await add('A', 'coi', owner.id, { person: eng2.id, party: ven.id, relation: 'brother-in-law owns it' });
const p3 = await add('F', 'pay', acc.id, { kind: 'vendor', payee: ven.id, billNo: 'INV-9', amount: 41000, from: '2026-10-01', to: '2026-10-31', items: [{ material: 'cement', qty: 100, rate: 430 }] }, { photos: [ph('bill')] });
s = S(); assert.equal(C.canApprove(s, eng2.id, p3.id).ok, false, 'conflict of interest');
const ck3 = C.payChecks(s, p3);
assert.ok(ck3.some(c => !c.ok && /billed 100 bag vs received and verified 96/.test(c.label)), 'billed more than received');
assert.ok(ck3.some(c => !c.ok && /rate ₹430 vs approved ₹410/.test(c.label)), 'rate over the approved rate');
assert.ok(ck3.some(c => !c.ok && /Round amount/.test(c.label)), 'round amount');

// No Edit Rule: a correction counts only after someone else approves it
const cor = await add('B', 'correction', gate.id, { target: a3.id, fix: { worker: w1.id }, reason: 'wrong worker tapped' });
assert.equal(C.effective(S(), a3).worker, w2.id, 'unapproved correction does nothing');
await add('C', 'approve', eng.id, { target: cor.id });
assert.equal(C.effective(S(), a3).worker, w1.id, 'approved correction applies'); assert.equal(a3.d.worker, w2.id, 'the original stays as it was');

// tamper detection
assert.deepEqual(await C.verifyChains(all), []);
const copy = all.map(e => JSON.parse(JSON.stringify(e))); copy.find(e => e.id === m1.id).d.recvQty = 100;
const bad = await C.verifyChains(copy); assert.ok(bad.some(b => b.id === m1.id && /changed/.test(b.why)), 'edited entry detected');
const gap = all.filter(e => e.id !== a2.id); assert.ok((await C.verifyChains(gap)).length > 0, 'deleted entry detected');

// reports and the daily anchor
s = S(); const R = C.dailyReport(s, '2026-10-12');
assert.equal(R.workers, 1, 'after the approved correction both entries are the same worker'); assert.ok(C.dailyText(R).includes('Workers present: 1'));
const Wk = C.weeklyReport(s, '2026-10-12', '2026-10-18'); assert.ok(Wk.labour.length >= 1);
const M = C.monthlyReport(s, '2026-10'); assert.ok(M.leakage > 0 && M.parties.length === 2);
const root = await C.dayRoot(all, '2026-10-12'); assert.match(root.root, /^[0-9a-f]{64}$/);
// surprise audit picks are random but only from real workers
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pk = C.pickAudit(s, rnd, '2026-10-12', 2); assert.ok(pk.workers.every(w => s.workers[w]) && pk.materials.length === 2);
console.log('✓ integrity core: permissions, Do-Person rule, proof, ghost workers, attendance, stock, usage, short supply, re-check, payments, conflict of interest, corrections, tamper detection, reports');
