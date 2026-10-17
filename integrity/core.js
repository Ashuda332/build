/* BhuChain Site Integrity — core rules. Pure functions, no DOM: the app and the tests both use this file.
   Every record is an append-only ledger entry. Nothing is edited or deleted: a correction is a new entry that
   only takes effect once a second person approves it. Each device chains its entries with SHA-256, so a changed
   or removed entry breaks the chain and shows as a red flag. */

export const VERSION = 1;

/* ---------- roles and who may do what (separation of duties) ---------- */
export const ROLES = {
  owner: 'Owner / Founder',
  engineer: 'Site engineer',
  supervisor: 'Supervisor',
  store: 'Storekeeper',
  gate: 'Attendance (gate)',
  accounts: 'Accounts',
  auditor: 'Auditor'
};
// who may create each entry type
export const CAN_CREATE = {
  site: ['owner'], person: ['owner'], contractor: ['owner'], vendor: ['owner'], rate: ['owner'], coi: ['owner', 'engineer', 'supervisor', 'store', 'gate', 'accounts', 'auditor'],
  worker: ['owner', 'engineer', 'supervisor'],
  att: ['gate', 'supervisor', 'engineer'],
  matIn: ['store'], matOut: ['store'], stockCount: ['store', 'auditor', 'engineer'],
  work: ['engineer', 'supervisor'], visit: ['engineer', 'supervisor', 'owner', 'auditor'], recheck: ['engineer', 'auditor', 'owner'],
  pay: ['accounts'], paid: ['accounts'],
  headcount: ['auditor', 'owner', 'engineer'], auditPick: ['auditor', 'owner'], audit: ['auditor', 'owner'],
  correction: ['owner', 'engineer', 'supervisor', 'store', 'gate', 'accounts', 'auditor'],
  plan: ['owner', 'engineer', 'supervisor'], tip: ['*'], approve: ['owner', 'engineer', 'supervisor', 'auditor'], reject: ['owner', 'engineer', 'supervisor', 'auditor']
};
// who may approve each type (never the person who made it)
export const CAN_APPROVE = {
  worker: ['owner', 'engineer'], att: ['supervisor', 'engineer'], matIn: ['engineer', 'supervisor'], matOut: ['engineer', 'supervisor'],
  stockCount: ['engineer', 'owner', 'auditor'], work: ['engineer', 'owner'], pay: ['engineer', 'owner'], correction: ['owner', 'engineer'],
  headcount: ['owner', 'engineer'], audit: ['owner']
};
// approvals needed; payments need two different approvers and one of them the owner
export const NEEDS = { pay: 2 };
// entries that must carry a photo and GPS to count as verified (Evidence Rule)
export const PROOF = { worker: 'photo', att: 'both', matIn: 'both', matOut: 'photo', work: 'both', visit: 'both', recheck: 'both', stockCount: 'photo', headcount: 'both', audit: 'both', paid: 'photo' };

/* ---------- materials and standard consumption (IS 456 / common Odia site practice) ---------- */
export const MATERIALS = {
  cement: { n: 'Cement', u: 'bag', waste: 0.03, rate: 400 },
  steel: { n: 'Steel (TMT)', u: 'kg', waste: 0.03, rate: 68 },
  sand: { n: 'Sand', u: 'cft', waste: 0.08, rate: 55 },
  agg: { n: 'Aggregate (stone chips)', u: 'cft', waste: 0.08, rate: 60 },
  bricks: { n: 'Bricks / fly-ash bricks', u: 'nos', waste: 0.05, rate: 8 }
};
const CFT = 35.315; // cft in a cubic metre
// material needed for one unit of each work (cement in 50 kg bags; dry volume 1.54 × wet for concrete, 1.27 for mortar)
export const WORKS = {
  pcc148: { n: 'PCC 1:4:8 (base concrete)', u: 'm3', use: { cement: 3.4, sand: 0.47 * CFT, agg: 0.95 * CFT } },
  rccSlab: { n: 'RCC M20 slab', u: 'm3', use: { cement: 8.06, sand: 0.42 * CFT, agg: 0.84 * CFT, steel: 80 } },
  rccBeam: { n: 'RCC M20 beam', u: 'm3', use: { cement: 8.06, sand: 0.42 * CFT, agg: 0.84 * CFT, steel: 150 } },
  rccCol: { n: 'RCC M20 column', u: 'm3', use: { cement: 8.06, sand: 0.42 * CFT, agg: 0.84 * CFT, steel: 180 } },
  rccFoot: { n: 'RCC M20 footing', u: 'm3', use: { cement: 8.06, sand: 0.42 * CFT, agg: 0.84 * CFT, steel: 90 } },
  brick230: { n: 'Brick wall 9 in (1:6)', u: 'm3', use: { bricks: 500, cement: 1.24, sand: 0.26 * CFT } },
  brick115: { n: 'Brick wall 4.5 in (1:4)', u: 'm2', use: { bricks: 57, cement: 0.21, sand: 0.028 * CFT } },
  plaster12: { n: 'Plaster 12 mm (1:6)', u: 'm2', use: { cement: 0.063, sand: 0.0131 * CFT } },
  plaster20: { n: 'Plaster 20 mm (1:6)', u: 'm2', use: { cement: 0.104, sand: 0.0218 * CFT } }
};
export const SQFT_PER_M2 = 10.764;

/* ---------- canonical JSON and hashing ---------- */
export function canon(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
}
export async function sha256(text) {
  const buf = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
// what the hash covers: everything except the hash itself and photo thumbnails (the photo's own hash is covered)
export function hashBody(e) {
  return canon({ id: e.id, dev: e.dev, seq: e.seq, type: e.type, at: e.at, by: e.by, gps: e.gps || null, d: e.d, prev: e.prev,
    photos: (e.photos || []).map(p => ({ h: p.h, kind: p.kind, ts: p.ts, ah: p.ah, old: !!p.old })) });
}
// make the next entry on this device's chain
export async function makeEntry(chain, x) {
  const last = chain.length ? chain[chain.length - 1] : null;
  const e = { id: x.id || (x.dev + '-' + ((last ? last.seq : 0) + 1)), dev: x.dev, seq: (last ? last.seq : 0) + 1, type: x.type, at: x.at || new Date().toISOString(), by: x.by, gps: x.gps || null, photos: x.photos || [], d: x.d || {}, prev: last ? last.hash : 'GENESIS' };
  e.hash = await sha256(hashBody(e));
  return e;
}
// check every device chain: each entry's hash and its link to the one before
export async function verifyChains(entries) {
  const byDev = {}, bad = [];
  entries.forEach(e => (byDev[e.dev] = byDev[e.dev] || []).push(e));
  for (const dev of Object.keys(byDev)) {
    const L = byDev[dev].sort((a, b) => a.seq - b.seq);
    for (let i = 0; i < L.length; i++) {
      const e = L[i], want = i === 0 ? 'GENESIS' : L[i - 1].hash;
      if (e.seq !== i + 1) { bad.push({ id: e.id, why: 'entry ' + (i + 1) + ' of device ' + dev + ' is missing' }); break; }
      if (e.prev !== want) { bad.push({ id: e.id, why: 'link to the previous entry is broken' }); continue; }
      if (await sha256(hashBody(e)) !== e.hash) bad.push({ id: e.id, why: 'entry was changed after it was saved' });
    }
  }
  return bad;
}

/* ---------- small helpers ---------- */
// days and hours are counted in India time (IST, UTC+5:30) whatever the phone's clock zone
export const TZ_MIN = 330;
const ist = iso => new Date(Date.parse(iso) + TZ_MIN * 6e4);
export const day = iso => iso ? ist(iso).toISOString().slice(0, 10) : '';
export const hourOf = iso => { const d = ist(iso); return d.getUTCHours() + d.getUTCMinutes() / 60; };
export const timeOf = iso => iso ? ist(iso).toISOString().slice(11, 16) : '';
export function distM(a, b) { // metres between two GPS points
  if (!a || !b) return null; const R = 6371000, r = x => x * Math.PI / 180, dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h));
}
export function hamming(a, b) { if (!a || !b || a.length !== b.length) return 99; let n = 0; for (let i = 0; i < a.length; i++) { let x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { n += x & 1; x >>= 1; } } return n; }
export const round2 = v => Math.round(v * 100) / 100;
const inRange = (iso, from, to) => { const d = day(iso); return (!from || d >= from) && (!to || d <= to); };
export function addDays(ymd, n) { const d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

/* ---------- state: everything is derived from the ledger ---------- */
export function build(entries) {
  const S = { all: [], byId: {}, persons: {}, workers: {}, contractors: {}, vendors: {}, rates: {}, site: null, coi: [], approvals: {}, rejections: {}, corrections: {}, tips: [] };
  const list = entries.slice().sort((a, b) => a.at < b.at ? -1 : a.at > b.at ? 1 : a.id < b.id ? -1 : 1);
  list.forEach(e => { S.all.push(e); S.byId[e.id] = e; });
  list.forEach(e => {
    if (e.type === 'approve') (S.approvals[e.d.target] = S.approvals[e.d.target] || []).push(e);
    if (e.type === 'reject') (S.rejections[e.d.target] = S.rejections[e.d.target] || []).push(e);
    if (e.type === 'correction') (S.corrections[e.d.target] = S.corrections[e.d.target] || []).push(e);
  });
  // only approvals that obey the rules count: a different person, an allowed role, no conflict of interest
  S.validApprovals = id => {
    const e = S.byId[id]; if (!e) return [];
    const seen = new Set(), out = [];
    (S.approvals[id] || []).forEach(a => { const p = S.persons[a.by]; if (!p || a.by === e.by || seen.has(a.by)) return; if (!(CAN_APPROVE[e.type] || []).includes(p.role)) return; seen.add(a.by); out.push(a); });
    return out;
  };
  list.forEach(e => {
    const d = effective(S, e);
    if (e.type === 'site') S.site = Object.assign({ id: e.id }, d);
    if (e.type === 'person') S.persons[e.id] = Object.assign({ id: e.id }, d);
    if (e.type === 'contractor') S.contractors[e.id] = Object.assign({ id: e.id }, d);
    if (e.type === 'vendor') S.vendors[e.id] = Object.assign({ id: e.id }, d);
    if (e.type === 'rate') S.rates[(d.vendor || '*') + ':' + d.material] = Object.assign({ id: e.id }, d);
    if (e.type === 'worker') S.workers[e.id] = Object.assign({ id: e.id, photo: e.photos[0] || null }, d);
    if (e.type === 'coi') S.coi.push(Object.assign({ id: e.id, by: e.by }, d));
    if (e.type === 'tip') S.tips.push(e);
  });
  // the first person on a fresh ledger is the owner who set it up
  return S;
}
// an entry's data with its approved corrections applied; a void correction removes it from every count
export function effective(S, e) {
  let d = Object.assign({}, e.d);
  (S.corrections[e.id] || []).forEach(c => { if (statusOf(S, c).state !== 'approved') return; if (c.d.void) d.__void = true; Object.assign(d, c.d.fix || {}); });
  return d;
}
export function proofOk(e) {
  const need = PROOF[e.type]; if (!need) return true;
  const photo = (e.photos || []).length > 0, gps = !!(e.gps && isFinite(e.gps.lat));
  return need === 'photo' ? photo : need === 'gps' ? gps : photo && gps;
}
// pending / approved / rejected / unverified (no proof) / void
export function statusOf(S, e) {
  if (!e) return { state: 'missing' };
  const corr = (S.corrections[e.id] || []).find(c => c.d.void && (S.validApprovals ? S.validApprovals(c.id).length : 0) >= 1);
  if (corr) return { state: 'void' };
  const rej = (S.rejections[e.id] || []).filter(r => r.by !== e.by && S.persons[r.by]);
  if (rej.length) return { state: 'rejected', by: rej[0].by, why: rej[0].d.reason };
  const need = CAN_APPROVE[e.type] ? (NEEDS[e.type] || 1) : 0, got = S.validApprovals ? S.validApprovals(e.id) : [];
  const ownerOk = e.type !== 'pay' || got.some(a => (S.persons[a.by] || {}).role === 'owner');
  if (!proofOk(e)) return { state: 'unverified', got: got.length, need };
  if (got.length >= need && ownerOk) return { state: 'approved', got: got.length, need };
  return { state: 'pending', got: got.length, need, ownerNeeded: !ownerOk && got.length >= need };
}
const live = (S, e) => !effective(S, e).__void && statusOf(S, e).state !== 'rejected' && statusOf(S, e).state !== 'void';
const counted = (S, e) => live(S, e) && statusOf(S, e).state === 'approved';
export const ofType = (S, t) => S.all.filter(e => e.type === t && live(S, e));

/* ---------- may this person do this? (enforced before saving) ---------- */
export function canCreate(S, personId, type) {
  if (type === 'tip') return true;
  if (!S.site && ['site', 'person'].includes(type)) return true; // first setup on a fresh ledger
  const p = S.persons[personId]; if (!p) return false;
  return (CAN_CREATE[type] || []).includes(p.role);
}
export function canApprove(S, personId, target) {
  const e = S.byId[target], p = S.persons[personId];
  if (!e || !p) return { ok: false, why: 'Unknown entry or person' };
  if (e.by === personId) return { ok: false, why: 'Do-Person Rule: you made this entry, someone else must approve it' };
  if (!(CAN_APPROVE[e.type] || []).includes(p.role)) return { ok: false, why: ROLES[p.role] + ' cannot approve ' + e.type };
  if ((S.approvals[target] || []).some(a => a.by === personId)) return { ok: false, why: 'You already approved this' };
  if (e.type === 'pay') {
    const pd = effective(S, e), conf = S.coi.find(c => c.person === personId && (c.party === pd.payee));
    if (conf) return { ok: false, why: 'Conflict of interest declared with this payee: ' + conf.relation };
    // separation of duties: whoever took the attendance or received the material for this bill cannot approve its payment
    const src = paySources(S, e);
    if (src.some(x => x.by === personId)) return { ok: false, why: 'Separation of duties: you recorded entries this bill is based on' };
  }
  return { ok: true };
}

/* ---------- attendance ---------- */
// man-days for one worker on one day: in and out both approved; 7 h or more = 1, 4–7 h = 0.5
export function manDays(S, from, to, filter) {
  const by = {};
  ofType(S, 'att').forEach(e => { if (!inRange(e.at, from, to)) return; const d = effective(S, e); if (filter && !filter(d)) return; const k = d.worker + '|' + day(e.at); (by[k] = by[k] || []).push(e); });
  const out = {};
  Object.keys(by).forEach(k => {
    const L = by[k], ins = L.filter(e => effective(S, e).dir === 'in' && counted(S, e)), outs = L.filter(e => effective(S, e).dir === 'out' && counted(S, e));
    if (!ins.length || !outs.length) { out[k] = 0; return; }
    const h = (new Date(outs[outs.length - 1].at) - new Date(ins[0].at)) / 3.6e6; out[k] = h >= 7 ? 1 : h >= 4 ? 0.5 : 0;
  });
  return out;
}
export function workerDays(S, from, to) { const md = manDays(S, from, to), w = {}; Object.keys(md).forEach(k => { const id = k.split('|')[0]; w[id] = (w[id] || 0) + md[k]; }); return w; }
export function presentNow(S, ymd) { // in today without an out
  const st = {}; ofType(S, 'att').filter(e => day(e.at) === ymd).forEach(e => { st[effective(S, e).worker] = effective(S, e).dir; });
  return Object.keys(st).filter(w => st[w] === 'in');
}

/* ---------- materials ---------- */
export function stock(S, upto) {
  const m = {}; Object.keys(MATERIALS).forEach(k => m[k] = { opening: 0, inQty: 0, pendingIn: 0, outQty: 0, closing: 0, lastCount: null });
  if (S.site && S.site.opening) Object.keys(S.site.opening).forEach(k => { if (m[k]) m[k].opening = +S.site.opening[k] || 0; });
  ofType(S, 'matIn').forEach(e => { if (upto && day(e.at) > upto) return; const d = effective(S, e); if (!m[d.material]) return; if (counted(S, e)) m[d.material].inQty += +d.recvQty || 0; else m[d.material].pendingIn += +d.recvQty || 0; });
  ofType(S, 'matOut').forEach(e => { if (upto && day(e.at) > upto) return; const d = effective(S, e); if (m[d.material]) m[d.material].outQty += +d.qty || 0; });
  Object.keys(m).forEach(k => { m[k].closing = round2(m[k].opening + m[k].inQty - m[k].outQty); });
  ofType(S, 'stockCount').forEach(e => { if (upto && day(e.at) > upto) return; const d = effective(S, e); if (!m[d.material]) return; m[d.material].lastCount = { at: e.at, qty: +d.qty, id: e.id }; });
  return m;
}
// work done (approved) → material it should have used
export function theoretical(S, from, to) {
  const need = {}; Object.keys(MATERIALS).forEach(k => need[k] = 0);
  ofType(S, 'work').forEach(e => { if (!inRange(e.at, from, to) || !counted(S, e)) return; const d = effective(S, e), W = WORKS[d.work]; if (!W) return; Object.keys(W.use).forEach(k => need[k] += W.use[k] * (+d.qty || 0)); });
  return need;
}
export function issued(S, from, to) { const u = {}; Object.keys(MATERIALS).forEach(k => u[k] = 0); ofType(S, 'matOut').forEach(e => { if (!inRange(e.at, from, to)) return; const d = effective(S, e); if (u[d.material] != null) u[d.material] += +d.qty || 0; }); return u; }
export function usageCheck(S, from, to) {
  const T = theoretical(S, from, to), A = issued(S, from, to);
  return Object.keys(MATERIALS).map(k => { const t = T[k], a = A[k], M = MATERIALS[k]; if (!t && !a) return null;
    const gap = t ? (a - t) / t : 1, sev = !t ? (a > 0 ? 'amber' : 'ok') : gap > M.waste + 0.05 ? 'red' : gap > M.waste ? 'amber' : gap < -0.15 ? 'amber' : 'ok';
    return { material: k, theoretical: round2(t), issued: round2(a), gapPct: Math.round(gap * 1000) / 10, allowedPct: M.waste * 100, sev, excess: Math.max(0, a - t * (1 + M.waste)) };
  }).filter(Boolean);
}
// short supply: challan says more than was measured or weighed on site
export function shortSupply(e) { const d = e.d; const c = +d.challanQty || 0, r = +d.recvQty || 0; return c ? (c - r) / c : 0; }

/* ---------- payments ---------- */
function paySources(S, e) {
  const d = effective(S, e);
  if (d.kind === 'wages' || d.kind === 'contractor') return ofType(S, 'att').filter(a => inRange(a.at, d.from, d.to) && (!d.payee || (S.workers[effective(S, a).worker] || {}).contractor === d.payee));
  if (d.kind === 'vendor') return ofType(S, 'matIn').filter(m => inRange(m.at, d.from, d.to) && effective(S, m).vendor === d.payee);
  return [];
}
export function payChecks(S, e) {
  const d = effective(S, e), out = [], add = (ok, label, sev) => out.push({ ok, label, sev: ok ? 'ok' : sev || 'red' });
  const st = statusOf(S, e);
  add(st.got >= 2 && !st.ownerNeeded, 'Two approvals, one by the owner (' + (st.got || 0) + ' of 2)', 'amber');
  add((e.photos || []).length > 0, 'Bill / invoice photo attached', 'amber');
  // duplicates: same payee and bill number, or same payee and amount within 30 days
  const dup = ofType(S, 'pay').filter(p => p.id !== e.id && effective(S, p).payee === d.payee && ((d.billNo && effective(S, p).billNo === d.billNo) || (+effective(S, p).amount === +d.amount && Math.abs(new Date(p.at) - new Date(e.at)) < 30 * 864e5)));
  add(!dup.length, dup.length ? 'Possible duplicate of ' + dup.map(x => x.id).join(', ') : 'Not a duplicate bill');
  if (d.kind === 'wages' || d.kind === 'contractor') {
    const md = manDays(S, d.from, d.to, a => !d.payee || (S.workers[a.worker] || {}).contractor === d.payee), got = Object.values(md).reduce((a, v) => a + v, 0);
    if (+d.claimedDays) add(+d.claimedDays <= got + 1e-9, 'Man-days claimed ' + d.claimedDays + ' vs attendance ' + got);
    if (d.kind === 'wages') { const exp = Object.keys(md).reduce((a, k) => a + md[k] * (+(S.workers[k.split('|')[0]] || {}).wage || 0), 0); add(+d.amount <= exp + 1, 'Wage amount ₹' + d.amount + ' vs attendance × wage ₹' + Math.round(exp)); }
  }
  if (d.kind === 'contractor' && (d.workRefs || []).length) {
    const bad = d.workRefs.filter(id => { const w = S.byId[id]; return !w || !counted(S, w) || recheckFailed(S, id); });
    add(!bad.length, bad.length ? 'Work not certified or failed re-check: ' + bad.join(', ') : 'Billed work is certified');
  }
  if (d.kind === 'vendor' && (d.items || []).length) {
    const rec = {}; paySources(S, e).filter(m => counted(S, m)).forEach(m => { const x = effective(S, m); rec[x.material] = (rec[x.material] || 0) + (+x.recvQty || 0); });
    d.items.forEach(it => {
      add((+it.qty || 0) <= (rec[it.material] || 0) + 1e-9, MATERIALS[it.material].n + ': billed ' + it.qty + ' ' + MATERIALS[it.material].u + ' vs received and verified ' + round2(rec[it.material] || 0));
      const r = S.rates[d.payee + ':' + it.material] || S.rates['*:' + it.material], ref = r ? +r.rate : MATERIALS[it.material].rate, over = ref ? (+it.rate - ref) / ref : 0;
      add(over <= 0, MATERIALS[it.material].n + ': rate ₹' + it.rate + ' vs approved ₹' + ref, over > 0.05 ? 'red' : 'amber');
    });
  }
  if (d.kind === 'advance') {
    const P = S.contractors[d.payee] || S.vendors[d.payee] || {}, limit = +P.advanceLimit || 0;
    const open = ofType(S, 'pay').filter(p => effective(S, p).kind === 'advance' && effective(S, p).payee === d.payee && p.id !== e.id).reduce((a, p) => a + (+effective(S, p).amount || 0), 0) - ofType(S, 'pay').filter(p => effective(S, p).payee === d.payee).reduce((a, p) => a + (+effective(S, p).advanceAdjusted || 0), 0);
    add(!limit || open + (+d.amount) <= limit, 'Advance outstanding ₹' + Math.round(open + (+d.amount)) + (limit ? ' vs limit ₹' + limit : ' (no limit set)'), 'red');
  }
  add(!roundNumber(d.amount), roundNumber(d.amount) ? 'Round amount ₹' + d.amount + ' — ask for the working' : 'Amount is not a suspicious round number', 'amber');
  return out;
}
export const roundNumber = a => +a >= 10000 && +a % 1000 === 0;
export function payReady(S, e) { return payChecks(S, e).every(c => c.ok || c.sev !== 'red') && statusOf(S, e).state === 'approved'; }
export function recheckFailed(S, workId) { return ofType(S, 'recheck').some(r => r.d.target === workId && !recheckOk(S, r)); }
export function recheckOk(S, r) { const w = S.byId[r.d.target]; if (!w) return false; const q = +effective(S, w).qty || 0, m = +r.d.measuredQty || 0; return r.d.ok !== false && (!q || Math.abs(m - q) / q <= 0.05); }

/* ---------- surprise audit: random picks, recorded before anyone goes to check ---------- */
export function pickAudit(S, rand, ymd, nWorkers) {
  const present = presentNow(S, ymd), pool = present.length ? present : Object.keys(S.workers);
  const pick = (arr, n) => { const a = arr.slice(), out = []; while (a.length && out.length < n) out.push(a.splice(Math.floor(rand() * a.length), 1)[0]); return out; };
  return { workers: pick(pool, nWorkers || Math.min(5, Math.max(2, Math.ceil(pool.length * 0.1)))), materials: pick(Object.keys(MATERIALS), 2), work: pick(ofType(S, 'work').filter(w => counted(S, w)).map(w => w.id).slice(-30), 1) };
}

/* ---------- red flags ---------- */
export const FLAG_ACTION = { red: 'Stop: hold the payment or the work until it is explained', amber: 'Explain within 24 hours', green: 'Keep watching' };
export function flags(S, opt) {
  opt = opt || {}; const F = [], add = (sev, rule, text, ref) => F.push({ sev, rule, text, ref, action: FLAG_ACTION[sev] });
  const site = S.site || {}, radius = +site.radius || 150, center = site.lat ? { lat: +site.lat, lng: +site.lng } : null, now = opt.now ? new Date(opt.now) : new Date();
  // photos used twice (same file, or a near-identical picture)
  const seen = {}, ahs = [];
  S.all.forEach(e => (e.photos || []).forEach(p => { if (seen[p.h] && seen[p.h] !== e.id) add('red', 'R1', 'Same photo used in two entries (' + seen[p.h] + ' and ' + e.id + ')', e.id); else seen[p.h] = e.id; if (p.ah && e.type !== 'worker') ahs.push({ e, p }); }));
  for (let i = 0; i < ahs.length; i++) for (let j = i + 1; j < ahs.length; j++) { const a = ahs[i], b = ahs[j]; if (a.e.id !== b.e.id && a.p.h !== b.p.h && hamming(a.p.ah, b.p.ah) <= 2 && a.e.type === b.e.type && a.e.type !== 'att') add('amber', 'R1b', 'Near-identical photos in ' + a.e.id + ' and ' + b.e.id, b.e.id); }
  S.all.forEach(e => (e.photos || []).forEach(p => { if (p.old) add('amber', 'R6b', 'Old photo (picked from the gallery?) in ' + e.id, e.id); }));
  // attendance: outside the site, at night, the same selfie twice, the same worker at two places
  ofType(S, 'att').forEach(e => {
    const d = effective(S, e);
    if (center && e.gps) { const m = distM(center, e.gps); if (m > radius) add('red', 'R2', 'Attendance ' + e.id + ' taken ' + Math.round(m) + ' m from the site', e.id); }
    const h = hourOf(e.at); if (h < 5.5 || h > 20.5) add('amber', 'R3', 'Attendance at an odd hour (' + timeOf(e.at) + ') — ' + e.id, e.id);
    if (!proofOk(e)) add('amber', 'R6', 'Attendance without selfie or GPS — counts as unverified: ' + e.id, e.id);
  });
  { const sel = {}; ofType(S, 'att').forEach(e => { const w = effective(S, e).worker; (e.photos || []).forEach(p => { (sel[w] = sel[w] || []).forEach(q => { if (q.ah && p.ah && hamming(q.ah, p.ah) === 0 && q.day !== day(e.at)) add('red', 'R1c', 'Same selfie reused for ' + ((S.workers[w] || {}).name || w) + ' on ' + q.day + ' and ' + day(e.at), e.id); }); (sel[w] = sel[w] || []).push({ ah: p.ah, day: day(e.at) }); }); }); }
  // ghost workers: the same face photo or the same Aadhaar digits + name under two IDs
  const W = Object.values(S.workers);
  for (let i = 0; i < W.length; i++) for (let j = i + 1; j < W.length; j++) {
    const a = W[i], b = W[j], samePhoto = a.photo && b.photo && (a.photo.h === b.photo.h || hamming(a.photo.ah, b.photo.ah) <= 4), sameId = a.aadhaar4 && a.aadhaar4 === b.aadhaar4 && (a.name || '').trim().toLowerCase().split(' ')[0] === (b.name || '').trim().toLowerCase().split(' ')[0];
    if (samePhoto || sameId) add('red', 'R4', 'Possible ghost / double worker: ' + a.name + ' (' + a.id + ') and ' + b.name + ' (' + b.id + ')' + (a.contractor !== b.contractor ? ' under two contractors' : ''), b.id);
  }
  // payments
  ofType(S, 'pay').forEach(e => { payChecks(S, e).forEach(c => { if (!c.ok && !/Two approvals|photo attached/.test(c.label)) add(c.sev, 'R7', 'Payment ' + e.id + ': ' + c.label, e.id); }); });
  ofType(S, 'paid').forEach(e => { const p = S.byId[e.d.target]; if (!p || !payReady(S, p)) add('red', 'R8', 'Money paid on ' + e.d.target + ' before all checks and approvals passed', e.id); });
  // materials
  ofType(S, 'matIn').forEach(e => { const s = shortSupply(e); if (s > 0.02) add('red', 'R10', 'Short supply ' + Math.round(s * 1000) / 10 + '% on ' + e.id + ' (challan ' + e.d.challanQty + ', received ' + e.d.recvQty + ')', e.id); else if (s > 0.01) add('amber', 'R10', 'Short supply ' + Math.round(s * 1000) / 10 + '% on ' + e.id, e.id); });
  usageCheck(S, opt.from, opt.to).forEach(u => { if (u.sev === 'red' || u.sev === 'amber') add(u.sev, 'R9', MATERIALS[u.material].n + ': used ' + u.issued + ' vs ' + u.theoretical + ' ' + MATERIALS[u.material].u + ' for the work done (' + (u.gapPct > 0 ? '+' : '') + u.gapPct + '%, allowed ' + u.allowedPct + '%)', null); });
  const stk = stock(S); Object.keys(stk).forEach(k => { const s = stk[k]; if (!s.lastCount) return; const book = stock(S, day(s.lastCount.at)); const b = book[k].closing, v = b ? (s.lastCount.qty - b) / b : 0; if (Math.abs(v) > 0.02) add('red', 'R11', MATERIALS[k].n + ': physical count ' + s.lastCount.qty + ' vs book ' + b + ' ' + MATERIALS[k].u + ' (' + Math.round(v * 1000) / 10 + '%)', s.lastCount.id); });
  // work: failed re-checks, certified without a site visit that day
  ofType(S, 'recheck').forEach(r => { if (!recheckOk(S, r)) add('red', 'R16', 'Re-check failed on work ' + r.d.target + ' (certified ' + (S.byId[r.d.target] ? effective(S, S.byId[r.d.target]).qty : '?') + ', measured ' + r.d.measuredQty + ')', r.id); });
  ofType(S, 'work').forEach(w => { (S.validApprovals(w.id) || []).forEach(a => { const visited = S.all.some(v => (v.type === 'visit' || v.type === 'work' || v.type === 'recheck') && v.by === a.by && day(v.at) === day(a.at) && v.gps); if (!visited) add('amber', 'R22', 'Work ' + w.id + ' certified by ' + ((S.persons[a.by] || {}).name || a.by) + ' with no site visit proof that day', w.id); }); });
  // conflict of interest
  S.coi.forEach(c => { const P = S.contractors[c.party] || S.vendors[c.party]; if (P) add('amber', 'R17', ((S.persons[c.person] || {}).name || c.person) + ' declared a relation with ' + P.name + ' (' + c.relation + ') — they cannot approve its bills', c.id); });
  // headcount surprise vs the app
  ofType(S, 'headcount').forEach(h => { if (+h.d.counted !== +h.d.expected) add('red', 'R19', 'Surprise headcount ' + h.d.counted + ' vs ' + h.d.expected + ' marked present (' + day(h.at) + ')', h.id); });
  // audits
  ofType(S, 'audit').forEach(a => { const bad = (a.d.results || []).filter(r => r.ok === false); if (bad.length) add('red', 'R20', 'Surprise audit ' + a.id + ': ' + bad.length + ' item(s) did not match', a.id); });
  { const A = ofType(S, 'audit'); for (let i = 2; i < A.length; i++) if (A[i].by === A[i - 1].by && A[i].by === A[i - 2].by) add('amber', 'R21', 'Same auditor three times in a row — rotate', A[i].id); }
  // waiting too long, one person approving everything, many corrections
  S.all.filter(e => CAN_APPROVE[e.type] && live(S, e) && statusOf(S, e).state === 'pending').forEach(e => { if ((now - new Date(e.at)) / 3.6e6 > 24) add('amber', 'R18', ROLES_T[e.type] + ' ' + e.id + ' waiting for approval more than 24 hours', e.id); });
  { const n = {}, tot = {}; S.all.filter(e => e.type === 'approve').forEach(a => { const t = (S.byId[a.d.target] || {}).type; if (!t) return; tot[t] = (tot[t] || 0) + 1; n[t + '|' + a.by] = (n[t + '|' + a.by] || 0) + 1; }); Object.keys(n).forEach(k => { const [t, by] = k.split('|'); if (tot[t] >= 10 && n[k] / tot[t] > 0.9) add('amber', 'R5', ((S.persons[by] || {}).name || by) + ' approved ' + Math.round(n[k] / tot[t] * 100) + '% of all ' + (ROLES_T[t] || t) + ' — share the approvals', null); }); }
  { const c = {}; ofType(S, 'correction').forEach(e => { const k = e.by + '|' + day(e.at).slice(0, 7); c[k] = (c[k] || 0) + 1; }); Object.keys(c).forEach(k => { if (c[k] > 5) add('amber', 'R21b', ((S.persons[k.split('|')[0]] || {}).name || k) + ' made ' + c[k] + ' corrections this month', null); }); }
  // separation of duties broken in practice: same person took the attendance and approved the wages
  ofType(S, 'pay').forEach(e => { const src = paySources(S, e), bys = new Set(src.map(x => x.by)); S.validApprovals(e.id).forEach(a => { if (bys.has(a.by)) add('red', 'R12', 'Separation of duties: ' + ((S.persons[a.by] || {}).name || a.by) + ' recorded entries for ' + e.id + ' and approved its payment', e.id); }); });
  (opt.chainBad || []).forEach(b => add('red', 'R23', 'Tampering: ' + b.why + ' (' + b.id + ')', b.id));
  const rank = { red: 0, amber: 1, green: 2 };
  return F.sort((a, b) => rank[a.sev] - rank[b.sev]);
}
export const ROLES_T = { worker: 'Worker', att: 'Attendance', matIn: 'Material in', matOut: 'Material out', stockCount: 'Stock count', work: 'Work', pay: 'Payment', correction: 'Correction', headcount: 'Headcount', audit: 'Audit' };

/* ---------- reports ---------- */
export function dailyReport(S, ymd, opt) {
  const att = ofType(S, 'att').filter(e => day(e.at) === ymd), workersIn = new Set(att.filter(e => effective(S, e).dir === 'in').map(e => effective(S, e).worker));
  const md = manDays(S, ymd, ymd), days = Object.values(md).reduce((a, v) => a + v, 0);
  const byC = {}; workersIn.forEach(w => { const c = (S.contractors[(S.workers[w] || {}).contractor] || {}).name || 'Direct'; byC[c] = (byC[c] || 0) + 1; });
  const work = ofType(S, 'work').filter(e => day(e.at) === ymd).map(e => { const d = effective(S, e); return { id: e.id, work: (WORKS[d.work] || {}).n || d.work, qty: d.qty, unit: (WORKS[d.work] || {}).u || d.unit, loc: d.location, state: statusOf(S, e).state }; });
  const site = S.site || {}, plan = site.plan || {}, doneTo = theoreticalProgress(S, ymd), pct = plan.total ? Math.min(100, Math.round(doneTo / plan.total * 100)) : null;
  const pend = S.all.filter(e => CAN_APPROVE[e.type] && live(S, e) && statusOf(S, e).state === 'pending').length;
  const F = flags(S, Object.assign({ now: ymd + 'T23:59:00' }, opt || {})), today = F.filter(f => !f.ref || day((S.byId[f.ref] || {}).at || ymd) === ymd);
  const plans = ofType(S, 'plan').filter(e => day(e.at) === ymd).map(e => e.d.text);
  return { date: ymd, site: site.name || 'Site', workers: workersIn.size, manDays: days, byContractor: byC, stock: stock(S, ymd), work, progressPct: pct, pending: pend, flags: today, redCount: today.filter(f => f.sev === 'red').length, amberCount: today.filter(f => f.sev === 'amber').length, plan: plans, visits: ofType(S, 'visit').filter(e => day(e.at) === ymd).map(e => ({ by: (S.persons[e.by] || {}).name, at: timeOf(e.at) })) };
}
function theoreticalProgress(S, upto) { let n = 0; ofType(S, 'work').forEach(e => { if (day(e.at) <= upto && counted(S, e)) n += +effective(S, e).weight || 0; }); return n; }
export function dailyText(R) {
  const L = ['*BhuChain daily report* — ' + R.site + ' — ' + R.date, '', '👷 Workers present: ' + R.workers + ' (man-days ' + R.manDays + ')'];
  Object.keys(R.byContractor).forEach(c => L.push('   • ' + c + ': ' + R.byContractor[c]));
  L.push('', '🧱 Stock (closing):'); Object.keys(R.stock).forEach(k => { const s = R.stock[k]; if (s.opening || s.inQty || s.outQty) L.push('   • ' + MATERIALS[k].n + ': ' + s.closing + ' ' + MATERIALS[k].u + ' (in ' + round2(s.inQty) + ', used ' + round2(s.outQty) + (s.pendingIn ? ', not yet verified ' + round2(s.pendingIn) : '') + ')'); });
  L.push('', '🏗️ Work today:'); if (!R.work.length) L.push('   • none recorded'); R.work.forEach(w => L.push('   • ' + w.work + ' ' + w.qty + ' ' + w.unit + (w.loc ? ' @ ' + w.loc : '') + ' [' + w.state + ']'));
  if (R.progressPct != null) L.push('   Progress: ' + R.progressPct + '%');
  L.push('', (R.redCount ? '🔴 ' : '🟢 ') + 'Red flags: ' + R.redCount + ' · 🟠 Amber: ' + R.amberCount); R.flags.slice(0, 8).forEach(f => L.push('   ' + (f.sev === 'red' ? '🔴' : '🟠') + ' ' + f.text));
  L.push('', '⏳ Waiting for approval: ' + R.pending);
  if (R.plan.length) { L.push('', '📅 Tomorrow:'); R.plan.forEach(p => L.push('   • ' + p)); }
  return L.join('\n');
}
export function weeklyReport(S, from, to) {
  const md = manDays(S, from, to), byC = {};
  Object.keys(md).forEach(k => { const w = S.workers[k.split('|')[0]] || {}, c = w.contractor || 'direct'; byC[c] = byC[c] || { days: 0, wageDue: 0, billedDays: 0, paid: 0 }; byC[c].days += md[k]; byC[c].wageDue += md[k] * (+w.wage || 0); });
  ofType(S, 'pay').forEach(p => { const d = effective(S, p); if (!inRange(p.at, from, to) || !['wages', 'contractor'].includes(d.kind)) return; const c = d.payee || 'direct'; byC[c] = byC[c] || { days: 0, wageDue: 0, billedDays: 0, paid: 0 }; byC[c].billedDays += +d.claimedDays || 0; byC[c].paid += +d.amount || 0; });
  const audits = ofType(S, 'audit').filter(a => inRange(a.at, from, to)).map(a => ({ id: a.id, by: (S.persons[a.by] || {}).name, ok: (a.d.results || []).every(r => r.ok !== false), n: (a.d.results || []).length }));
  return { from, to, labour: Object.keys(byC).map(c => Object.assign({ contractor: (S.contractors[c] || {}).name || (c === 'direct' ? 'Direct' : c) }, byC[c], { gapDays: round2(byC[c].billedDays - byC[c].days) })), materials: usageCheck(S, from, to), audits, flags: flags(S, { from, to, now: to + 'T23:59:00' }) };
}
export function monthlyReport(S, ym) {
  const from = ym + '-01', to = addDays(addDays(from, 32).slice(0, 8) + '01', -1), F = flags(S, { from, to, now: to + 'T23:59:00' });
  const score = {}, bump = (id, n, why) => { if (!id) return; score[id] = score[id] || { pts: 100, why: [] }; score[id].pts -= n; score[id].why.push(why); };
  ofType(S, 'matIn').filter(e => inRange(e.at, from, to)).forEach(e => { const s = shortSupply(e); if (s > 0.01) bump(e.d.vendor, s > 0.02 ? 10 : 4, 'short supply ' + e.id); });
  ofType(S, 'pay').filter(e => inRange(e.at, from, to)).forEach(e => payChecks(S, e).forEach(c => { if (!c.ok && c.sev === 'red') bump(effective(S, e).payee, 10, c.label); }));
  ofType(S, 'recheck').filter(r => inRange(r.at, from, to) && !recheckOk(S, r)).forEach(r => { const w = S.byId[r.d.target]; if (w) bump(effective(S, w).contractor, 15, 're-check failed ' + w.id); });
  const parties = Object.values(S.contractors).concat(Object.values(S.vendors)).map(p => ({ id: p.id, name: p.name, kind: S.contractors[p.id] ? 'Contractor' : 'Vendor', score: Math.max(0, (score[p.id] || { pts: 100 }).pts), notes: (score[p.id] || { why: [] }).why }));
  // money at risk: material used over the allowance, short supply, man-days billed over attendance
  let leak = 0; usageCheck(S, from, to).forEach(u => leak += u.excess * MATERIALS[u.material].rate);
  ofType(S, 'matIn').filter(e => inRange(e.at, from, to)).forEach(e => { const m = MATERIALS[e.d.material]; if (m) leak += Math.max(0, (+e.d.challanQty || 0) - (+e.d.recvQty || 0)) * (+e.d.rate || m.rate); });
  const W = weeklyReport(S, from, to); W.labour.forEach(l => { if (l.gapDays > 0) leak += l.gapDays * 600; });
  return { month: ym, parties, leakage: Math.round(leak), red: F.filter(f => f.sev === 'red').length, amber: F.filter(f => f.sev === 'amber').length, byRule: F.reduce((a, f) => (a[f.rule] = (a[f.rule] || 0) + 1, a), {}) };
}
// a fingerprint of the whole ledger for a day: the hash that would be anchored on the BhuChain chain
export async function dayRoot(entries, ymd) {
  const L = entries.filter(e => day(e.at) === ymd).map(e => e.hash).sort();
  if (!L.length) return null;
  let level = L; while (level.length > 1) { const next = []; for (let i = 0; i < level.length; i += 2) next.push(await sha256(level[i] + (level[i + 1] || level[i]))); level = next; }
  return { date: ymd, count: L.length, root: level[0] };
}
