/* BhuChain Site Integrity — the phone app. Works offline; every save is a signed (hash-chained) ledger entry in the
   phone's own database, sent to Google Sheets / Drive when the internet is there. */
import * as C from './core.js';

/* ---------- language: Hinglish, Hindi, Odia ---------- */
const TX = {
  hl: { home: 'Home', att: 'Hazri (Attendance)', attS: 'Subah IN · Shaam OUT selfie', matIn: 'Material aaya', matInS: 'Challan + truck photo', matOut: 'Material diya', matOutS: 'Kis kaam ke liye', stock: 'Stock check', stockS: 'Gin ke likho', work: 'Aaj ka kaam', workS: 'Kitna kaam, photo', visit: 'Site visit', visitS: 'Engineer ki hazri', recheck: 'Re-check', recheckS: 'Doosra engineer naape', approve: 'Approve karo', approveS: 'Doosre ki entry check', pay: 'Payment maango', payS: 'Bill + checks', paid: 'Payment ho gaya', paidS: 'UTR + receipt', workers: 'Workers', workersS: 'Register + ID card', flags: 'Red flags', flagsS: 'Gadbad ki list', reports: 'Reports', reportsS: 'Daily · weekly · monthly', audit: 'Surprise audit', auditS: 'Random check', plan: 'Kal ka plan', planS: 'Kal kya hoga', people: 'Log aur parties', peopleS: 'Staff, thekedar, vendor', sync: 'Sync / backup', syncS: 'Google Sheet, file', guide: 'Guide', guideS: 'Kaise use karein', tip: 'Gupt shikayat', tipS: 'Bina naam ke batao', save: 'Save karo', back: 'Wapas', photo: 'Photo lo', logout: 'Logout', pin: 'PIN daalo', in: 'IN (aaye)', out: 'OUT (gaye)', next: 'Agla' },
  hi: { home: 'होम', att: 'हाज़िरी', attS: 'सुबह IN · शाम OUT सेल्फ़ी', matIn: 'माल आया', matInS: 'चालान + ट्रक फ़ोटो', matOut: 'माल दिया', matOutS: 'किस काम के लिए', stock: 'स्टॉक गिनती', stockS: 'गिन के लिखो', work: 'आज का काम', workS: 'कितना काम, फ़ोटो', visit: 'साइट विज़िट', visitS: 'इंजीनियर की हाज़िरी', recheck: 'दोबारा जाँच', recheckS: 'दूसरा इंजीनियर नापे', approve: 'मंज़ूरी दो', approveS: 'दूसरे की एंट्री जाँचो', pay: 'भुगतान माँगो', payS: 'बिल + जाँच', paid: 'भुगतान हो गया', paidS: 'UTR + रसीद', workers: 'मज़दूर', workersS: 'रजिस्टर + ID कार्ड', flags: 'लाल झंडे', flagsS: 'गड़बड़ की सूची', reports: 'रिपोर्ट', reportsS: 'रोज़ · हफ़्ता · महीना', audit: 'अचानक जाँच', auditS: 'रैंडम जाँच', plan: 'कल का प्लान', planS: 'कल क्या होगा', people: 'लोग और पार्टी', peopleS: 'स्टाफ़, ठेकेदार, वेंडर', sync: 'सिंक / बैकअप', syncS: 'Google Sheet, फ़ाइल', guide: 'गाइड', guideS: 'कैसे इस्तेमाल करें', tip: 'गुप्त शिकायत', tipS: 'बिना नाम के बताओ', save: 'सेव करो', back: 'वापस', photo: 'फ़ोटो लो', logout: 'लॉगआउट', pin: 'PIN डालो', in: 'IN (आए)', out: 'OUT (गए)', next: 'अगला' },
  or: { home: 'ହୋମ', att: 'ହାଜିରା', attS: 'ସକାଳ IN · ସନ୍ଧ୍ୟା OUT ସେଲଫି', matIn: 'ମାଲ ଆସିଲା', matInS: 'ଚାଲାଣ + ଟ୍ରକ ଫଟୋ', matOut: 'ମାଲ ଦିଆଗଲା', matOutS: 'କେଉଁ କାମ ପାଇଁ', stock: 'ଷ୍ଟକ ଗଣନା', stockS: 'ଗଣି ଲେଖ', work: 'ଆଜିର କାମ', workS: 'କେତେ କାମ, ଫଟୋ', visit: 'ସାଇଟ ଭିଜିଟ', visitS: 'ଇଞ୍ଜିନିୟରଙ୍କ ହାଜିରା', recheck: 'ପୁଣି ଯାଞ୍ଚ', recheckS: 'ଅନ୍ୟ ଇଞ୍ଜିନିୟର ମାପନ୍ତୁ', approve: 'ମଞ୍ଜୁରି ଦିଅ', approveS: 'ଅନ୍ୟଙ୍କ ଏଣ୍ଟ୍ରି ଯାଞ୍ଚ', pay: 'ପେମେଣ୍ଟ ମାଗ', payS: 'ବିଲ + ଯାଞ୍ଚ', paid: 'ପେମେଣ୍ଟ ହୋଇଗଲା', paidS: 'UTR + ରସିଦ', workers: 'ଶ୍ରମିକ', workersS: 'ରେଜିଷ୍ଟର + ID କାର୍ଡ', flags: 'ନାଲି ପତାକା', flagsS: 'ଗଡବଡର ତାଲିକା', reports: 'ରିପୋର୍ଟ', reportsS: 'ଦୈନିକ · ସାପ୍ତାହିକ · ମାସିକ', audit: 'ହଠାତ ଯାଞ୍ଚ', auditS: 'ରାଣ୍ଡମ ଯାଞ୍ଚ', plan: 'କାଲିର ଯୋଜନା', planS: 'କାଲି କଣ ହେବ', people: 'ଲୋକ ଓ ପାର୍ଟି', peopleS: 'ଷ୍ଟାଫ, ଠିକାଦାର, ଭେଣ୍ଡର', sync: 'ସିଙ୍କ / ବ୍ୟାକଅପ', syncS: 'Google Sheet, ଫାଇଲ', guide: 'ଗାଇଡ', guideS: 'କିପରି ବ୍ୟବହାର କରିବେ', tip: 'ଗୁପ୍ତ ଅଭିଯୋଗ', tipS: 'ନାମ ବିନା କୁହନ୍ତୁ', save: 'ସେଭ କର', back: 'ପଛକୁ', photo: 'ଫଟୋ ନିଅ', logout: 'ଲଗଆଉଟ', pin: 'PIN ଦିଅ', in: 'IN (ଆସିଲେ)', out: 'OUT (ଗଲେ)', next: 'ପରବର୍ତ୍ତୀ' }
};
let LANG = (() => { try { return localStorage.getItem('bsi_lang') || 'hl'; } catch (e) { return 'hl'; } })();
const t = k => (TX[LANG] && TX[LANG][k]) || TX.hl[k] || k;
const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = s => document.querySelector(s);
const inr = v => '₹' + Math.round(+v || 0).toLocaleString('en-IN');
const today = () => C.day(new Date().toISOString());

/* ---------- storage: IndexedDB (entries, full photos, settings) ---------- */
let DB;
function idb() {
  return new Promise((res, rej) => { const r = indexedDB.open('bhuchain-integrity', 1); r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('entries', { keyPath: 'id' }); d.createObjectStore('photos'); d.createObjectStore('meta'); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}
const tx = (store, mode, fn) => new Promise((res, rej) => { const T = DB.transaction(store, mode), s = T.objectStore(store), out = fn(s); T.oncomplete = () => res(out && out.result !== undefined ? out.result : out); T.onerror = () => rej(T.error); });
const getAll = store => new Promise((res, rej) => { const r = DB.transaction(store).objectStore(store).getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const getKey = (store, k) => new Promise((res, rej) => { const r = DB.transaction(store).objectStore(store).get(k); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const putKey = (store, v, k) => tx(store, 'readwrite', s => s.put(v, k));
const meta = async (k, v) => v === undefined ? getKey('meta', k) : putKey('meta', v, k);

/* ---------- app state ---------- */
let E = [], S = C.build([]), DEV = null, ME = null, CHAIN_BAD = [], FL = [];
function chain() { return E.filter(e => e.dev === DEV).sort((a, b) => a.seq - b.seq); }
async function reload() { E = await getAll('entries'); S = C.build(E); CHAIN_BAD = await C.verifyChains(E); FL = C.flags(S, { chainBad: CHAIN_BAD }); }
const meP = () => S.persons[ME] || null;
const role = () => (meP() || {}).role;
const can = type => C.canCreate(S, ME, type);

function toast(msg, err) { const d = document.createElement('div'); d.className = 'toast' + (err ? ' err' : ''); d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), err ? 4200 : 2200); }

/* ---------- proof: GPS and photos ---------- */
function getGPS() {
  return new Promise(res => { if (!navigator.geolocation) return res(null); let done = false; const fin = v => { if (!done) { done = true; res(v); } };
    navigator.geolocation.getCurrentPosition(p => fin({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6), acc: Math.round(p.coords.accuracy) }), () => fin(null), { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }); setTimeout(() => fin(null), 13000); });
}
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
function aHash(img) { const c = document.createElement('canvas'); c.width = c.height = 8; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 8, 8); const d = g.getImageData(0, 0, 8, 8).data, L = []; for (let i = 0; i < 64; i++) L.push(d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11); const m = L.reduce((a, v) => a + v, 0) / 64; let hex = ''; for (let i = 0; i < 64; i += 4) hex += (((L[i] > m) << 3) | ((L[i + 1] > m) << 2) | ((L[i + 2] > m) << 1) | (L[i + 3] > m)).toString(16); return hex; }
// take a photo with the phone camera, stamp date, time, GPS and name on it, keep a full copy and a thumbnail
function takePhoto(kind, front, gps) {
  return new Promise(resolve => {
    const inp = front ? $('#camf') : $('#cam'); inp.value = '';
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return resolve(null);
      const url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
      const img = await loadImg(url), ah = aHash(img), max = 1280, k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
      const now = new Date(), stamp = [(S.site || {}).name || 'BhuChain', C.day(now.toISOString()) + ' ' + C.timeOf(now.toISOString()) + ' IST', gps ? gps.lat + ', ' + gps.lng + ' ±' + gps.acc + 'm' : 'NO GPS', (meP() || { name: 'Anonymous' }).name + ' · ' + kind];
      const fs = Math.max(14, Math.round(c.width / 40)); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, c.height - fs * 4.6, c.width, fs * 4.6); g.fillStyle = '#fff'; g.font = 'bold ' + fs + 'px sans-serif'; stamp.forEach((s, i) => g.fillText(s, fs * 0.6, c.height - fs * (3.6 - i * 1.1)));
      const full = c.toDataURL('image/jpeg', 0.72), tc = document.createElement('canvas'), tk = 240 / Math.max(c.width, c.height); tc.width = Math.round(c.width * tk); tc.height = Math.round(c.height * tk); tc.getContext('2d').drawImage(c, 0, 0, tc.width, tc.height);
      const h = await C.sha256(full), old = Date.now() - (f.lastModified || Date.now()) > 10 * 60000;
      await putKey('photos', full, h);
      resolve({ h, kind, ts: now.toISOString(), ah, old, t: tc.toDataURL('image/jpeg', 0.6) });
    };
    inp.click();
  });
}

/* ---------- saving: permission checks, then an append-only entry ---------- */
async function save(type, d, x = {}) {
  if (!C.canCreate(S, type === 'tip' ? null : ME, type) && !(x.setup)) { toast('Aapka role ye entry nahi bana sakta', true); return null; }
  const e = await C.makeEntry(chain(), { dev: DEV, type, by: type === 'tip' ? 'anon' : (x.by !== undefined ? x.by : ME), d, gps: x.gps || null, photos: x.photos || [] });
  await tx('entries', 'readwrite', s => s.put(e)); await reload(); toast('✔ Saved · ' + e.id); syncSoon(); return e;
}
async function approve(id, ok, reason) {
  const chk = C.canApprove(S, ME, id); if (!chk.ok) { toast(chk.why, true); return; }
  await save(ok ? 'approve' : 'reject', ok ? { target: id } : { target: id, reason }, { gps: await getGPS() });
}

/* ---------- router ---------- */
const V = {}; let ROUTE = 'home', ARG = null;
function go(r, a) { ROUTE = r; ARG = a == null ? null : a; location.hash = '#/' + r + (a != null ? '/' + encodeURIComponent(a) : ''); }
window.addEventListener('hashchange', () => { const [r, a] = location.hash.replace(/^#\//, '').split('/'); ROUTE = r || 'home'; ARG = a ? decodeURIComponent(a) : null; render(); });
async function render() {
  const app = $('#app'), who = $('#who');
  who.innerHTML = meP() ? esc(meP().name) + '<br>' + esc(C.ROLES[meP().role]) : '';
  if (!S.site && ROUTE !== 'tip' && ROUTE !== 'guide' && ROUTE !== 'sync') return V.setup(app);
  if (!meP() && !['tip', 'guide', 'sync'].includes(ROUTE)) return V.login(app);
  (V[ROUTE] || V.home)(app, ARG);
  window.scrollTo(0, 0);
}
const head = (title, sub) => '<p class="noprint"><button class="btn ghost sm" data-go="home">← ' + t('back') + '</button></p><h2>' + title + '</h2>' + (sub ? '<p class="note">' + sub + '</p>' : '');
const bar = (label, act, extra) => '<div class="bar">' + (extra || '') + '<button class="btn" id="saveBtn" data-do="' + act + '">' + label + '</button></div>';
const tag = st => '<span class="tag ' + st + '">' + ({ approved: '✔ verified', pending: '⏳ pending', unverified: '✖ no proof', rejected: '✖ rejected', void: '✖ void' }[st] || st) + '</span>';
const thumb = p => p && p.t ? '<img src="' + p.t + '" alt="">' : '<img alt="">';
const personName = id => id === 'anon' ? 'Anonymous' : (S.persons[id] || {}).name || id || 'Setup';
const party = id => (S.contractors[id] || S.vendors[id] || {}).name || (id ? id : 'Direct');

/* ---------- form kit: chips, numbers, photos, GPS ---------- */
let FORM = {};
function chips(k, opts, multi) { return '<div class="chips" data-chips="' + k + '"' + (multi ? ' data-multi="1"' : '') + '>' + opts.map(([v, l]) => '<button type="button" class="chip' + ((multi ? (FORM[k] || []).includes(v) : FORM[k] === v) ? ' on' : '') + '" data-v="' + esc(v) + '">' + esc(l) + '</button>').join('') + '</div>'; }
function num(k, ph) { return '<input type="number" inputmode="decimal" data-k="' + k + '" value="' + esc(FORM[k] ?? '') + '" placeholder="' + esc(ph || '') + '">'; }
function txt(k, ph, type) { return '<input type="' + (type || 'text') + '" data-k="' + k + '" value="' + esc(FORM[k] ?? '') + '" placeholder="' + esc(ph || '') + '">'; }
function area(k, ph) { return '<textarea data-k="' + k + '" placeholder="' + esc(ph || '') + '">' + esc(FORM[k] ?? '') + '</textarea>'; }
function photos(slots) { FORM._photos = FORM._photos || {}; return '<div class="ph">' + slots.map(([k, l, front]) => { const p = FORM._photos[k]; return '<button type="button" class="phb' + (p ? ' done' : '') + '" data-photo="' + k + '"' + (front ? ' data-front="1"' : '') + '>' + (p ? '<img src="' + p.t + '" alt="">' : '<span class="ic">📷</span>' + esc(l)) + '</button>'; }).join('') + '</div>'; }
function gpsLine() { const g = FORM._gps; return '<p class="gps' + (g ? '' : ' bad') + '" id="gpsl">' + (g === undefined ? '📍 Location le rahe hain…' : g ? '📍 ' + g.lat + ', ' + g.lng + ' (±' + g.acc + ' m)' + siteDist(g) : '📍 Location nahi mili — GPS on karo. Bina GPS entry "unverified" rahegi. <button class="btn ghost sm" data-do="regps">Retry</button>') + '</p>'; }
function siteDist(g) { if (!S.site || !S.site.lat) return ''; const m = C.distM({ lat: +S.site.lat, lng: +S.site.lng }, g); return m > (+S.site.radius || 150) ? ' · ⚠ site se ' + Math.round(m) + ' m door' : ' · site par ✔'; }
function startGPS() { FORM._gps = undefined; getGPS().then(g => { FORM._gps = g; const el = $('#gpsl'); if (el) el.outerHTML = gpsLine(); }); }
const shot = keys => keys.map(k => FORM._photos && FORM._photos[k]).filter(Boolean).map(p => Object.assign({}, p));
const need = (cond, msg) => { if (!cond) { toast(msg, true); throw new Error('stop'); } };

/* ---------- screens ---------- */
V.setup = app => {
  FORM = FORM._setup ? FORM : { _setup: 1, radius: 150 };
  app.innerHTML = '<h2>Naya site setup</h2><p class="note">Ye ek baar owner karega. Site par khade ho kar location lo.</p><div class="card">' +
    '<label class="f">Site ka naam</label>' + txt('name', 'jaise Patia G+2, Bhubaneswar') + '<label class="f">Site location</label><button class="btn ghost sm" data-do="siteGps">📍 Abhi ki location lo</button> <span class="note" id="sloc">' + (FORM.lat ? FORM.lat + ', ' + FORM.lng : '') + '</span>' +
    '<label class="f">Site ka radius (meter) — isse bahar ki entry red flag</label>' + num('radius', '150') +
    '<label class="f">Shuru ka stock (agar site par pehle se maal hai)</label><div class="row2">' + Object.keys(C.MATERIALS).map(k => '<div><span class="note">' + C.MATERIALS[k].n + ' (' + C.MATERIALS[k].u + ')</span>' + num('op_' + k, '0') + '</div>').join('') + '</div>' +
    '<label class="f">Owner ka naam</label>' + txt('owner', 'aapka naam') + '<label class="f">Owner PIN (4 ank)</label>' + txt('pin', '••••', 'password') + '</div>' + bar('Site banao', 'setup');
};
V.login = app => {
  FORM = { pin: '' }; const P = Object.values(S.persons).filter(p => !p.inactive);
  app.innerHTML = '<h2>' + esc((S.site || {}).name || '') + '</h2><p class="note">Apna naam chuno, phir PIN.</p><div class="wgrid">' + P.map(p => '<button class="wk" data-who="' + p.id + '"><b>' + esc(p.name) + '</b><br><small>' + esc(C.ROLES[p.role]) + '</small></button>').join('') + '</div>' +
    '<div id="pinbox" class="hide"><p class="dots" id="dots"></p><div class="pin">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✔'].map(k => '<button data-pin="' + k + '">' + k + '</button>').join('') + '</div></div>' +
    '<div class="card"><button class="btn ghost wide" data-go="tip">🤫 ' + t('tip') + ' — ' + t('tipS') + '</button></div><p class="note">' + langPick() + '</p>';
};
function langPick() { return '<span class="lang">' + [['hl', 'Hinglish'], ['hi', 'हिंदी'], ['or', 'ଓଡ଼ିଆ']].map(([k, l]) => '<button class="chip' + (LANG === k ? ' on' : '') + '" data-lang="' + k + '">' + l + '</button>').join('') + '</span>'; }
V.home = app => {
  const r = role(), ymd = today(), present = C.presentNow(S, ymd).length, pend = pendingForMe().length, red = FL.filter(f => f.sev === 'red').length;
  const T = [['att', '🕗'], ['matIn', '🚚'], ['matOut', '📦'], ['stockCount', '🧮', 'stock'], ['work', '🏗️'], ['visit', '👷', 'visit'], ['recheck', '📏'], ['approve', '✅'], ['pay', '🧾'], ['paid', '💸'], ['worker', '🪪', 'workers'], ['flags', '🚩'], ['reports', '📊'], ['audit', '🎲'], ['plan', '📅'], ['people', '👥'], ['sync', '☁️'], ['guide', '📘'], ['tip', '🤫']];
  const show = ([k]) => k === 'approve' ? Object.values(C.CAN_APPROVE).some(L => L.includes(r)) : k === 'audit' ? can('auditPick') || can('headcount') : k === 'people' ? r === 'owner' : ['flags', 'reports', 'sync', 'guide', 'tip'].includes(k) ? true : k === 'worker' ? true : can(k);
  app.innerHTML = '<div class="stats"><div><b>' + present + '</b><span>abhi site par</span></div><div><b>' + pend + '</b><span>aapki approval baaki</span></div><div><b style="color:' + (red ? 'var(--red)' : 'var(--ok)') + '">' + red + '</b><span>red flags</span></div></div>' +
    (CHAIN_BAD.length ? '<div class="flag red"><b>⚠ Record se chhed-chhaad:</b> ' + CHAIN_BAD.length + ' entry ka hash match nahi karta. Owner ko turant batao.</div>' : '') +
    '<div class="tiles" style="margin-top:12px">' + T.filter(show).map(([k, ic, key]) => { const lk = key || k; return '<button class="tile' + ((k === 'approve' && pend) || (k === 'flags' && red) ? ' hot' : '') + '" data-go="' + (k === 'stockCount' ? 'stock' : k === 'worker' ? 'workers' : k) + '"><span class="ic">' + ic + '</span><b>' + esc(t(lk === 'stockCount' ? 'stock' : lk)) + '</b><small>' + esc(t((lk === 'stockCount' ? 'stock' : lk) + 'S')) + '</small></button>'; }).join('') + '</div>' +
    '<p style="margin-top:18px" class="noprint">' + langPick() + ' <button class="btn ghost sm" data-do="logout">' + t('logout') + '</button></p>';
};
function pendingForMe() { return S.all.filter(e => C.CAN_APPROVE[e.type] && e.by !== ME && ['pending', 'unverified'].includes(C.statusOf(S, e).state) && C.canApprove(S, ME, e.id).ok); }

/* attendance: pick IN/OUT, tap the worker (or scan the ID card QR), selfie, saved — about 20 seconds a worker */
V.att = app => {
  if (!FORM._att) { FORM = { _att: 1, dir: new Date().getHours() < 13 ? 'in' : 'out' }; startGPS(); }
  const ymd = today(), st = {}; C.ofType(S, 'att').filter(e => C.day(e.at) === ymd).forEach(e => { st[C.effective(S, e).worker] = C.effective(S, e).dir; });
  const W = Object.values(S.workers).filter(w => !w.inactive && C.statusOf(S, S.byId[w.id]).state !== 'rejected'), q = (FORM.q || '').toLowerCase();
  const list = W.filter(w => !q || (w.name || '').toLowerCase().includes(q) || (w.aadhaar4 || '').includes(q));
  app.innerHTML = head('🕗 ' + t('att'), 'Worker chuno ya ID card ka QR scan karo → selfie lo. Selfie mein worker ka chehra saaf ho.') +
    chips('dir', [['in', t('in')], ['out', t('out')]]) + gpsLine() +
    '<p><button class="btn ghost sm" data-do="scan">📷 QR scan</button> ' + txt('q', 'naam / Aadhaar ke last 4') + '</p>' +
    '<div class="wgrid">' + list.map(w => { const s = st[w.id], done = FORM.dir === 'in' ? s === 'in' || s === 'out' : s === 'out' || !s; return '<button class="wk' + (s === 'in' ? ' in' : '') + (done ? ' done' : '') + '" data-attw="' + w.id + '">' + thumb(w.photo) + '<b>' + esc(w.name) + '</b><br><small>' + esc(w.trade || '') + (s ? ' · ' + s.toUpperCase() : '') + '</small></button>'; }).join('') + '</div>' +
    (W.length ? '' : '<p class="note">Pehle workers register karo (Workers).</p>');
};
async function attFor(wid) {
  const w = S.workers[wid]; if (!w) return;
  const ymd = today(), mine = C.ofType(S, 'att').filter(e => C.day(e.at) === ymd && C.effective(S, e).worker === wid).map(e => C.effective(S, e).dir);
  if (mine.includes(FORM.dir)) { toast(w.name + ' ka ' + FORM.dir.toUpperCase() + ' aaj ho chuka hai', true); return; }
  if (FORM.dir === 'out' && !mine.includes('in')) { toast(w.name + ' ka IN nahi hua — pehle IN', true); return; }
  toast(w.name + ': selfie lo'); const gps = FORM._gps || await getGPS(); FORM._gps = gps;
  const p = await takePhoto('selfie-' + FORM.dir, true, gps); if (!p) return;
  await save('att', { worker: wid, dir: FORM.dir }, { gps, photos: [p] }); render();
}

/* workers: register with photo, ID card with QR */
V.workers = (app, id) => {
  if (id === 'new') return V.workerNew(app);
  if (id === 'cards') return V.cards(app);
  const W = Object.values(S.workers), days = C.workerDays(S, C.addDays(today(), -30), today());
  app.innerHTML = head('🪪 ' + t('workers'), W.length + ' registered · last 30 days attendance shown') + (can('worker') ? '<p><button class="btn" data-go="workers/new">+ Naya worker</button> <button class="btn ghost" data-go="workers/cards">🖨 ID cards</button></p>' : '') +
    '<div class="card list">' + W.map(w => '<div class="it">' + thumb(w.photo) + '<div class="t"><b>' + esc(w.name) + '</b><small>' + esc(w.trade) + ' · ' + esc(party(w.contractor)) + ' · ' + inr(w.wage) + '/day · Aadhaar …' + esc(w.aadhaar4) + ' · ' + (days[w.id] || 0) + ' days</small></div>' + tag(C.statusOf(S, S.byId[w.id]).state) + '</div>').join('') + '</div>';
};
const TRADES = ['Mason', 'Helper', 'Carpenter', 'Bar bender', 'Electrician', 'Plumber', 'Painter', 'Tile mason', 'Welder', 'Other'];
V.workerNew = app => {
  if (!FORM._wn) { FORM = { _wn: 1, trade: 'Helper' }; startGPS(); }
  const cons = Object.values(S.contractors).map(c => [c.id, c.name]).concat([['', 'Direct (no contractor)']]);
  app.innerHTML = head('+ Naya worker', 'Worker ki saaf photo lo (chehra seedha). Aadhaar ke sirf last 4 ank.') + '<div class="card">' + photos([['face', 'Worker ki photo']]) +
    '<label class="f">Naam</label>' + txt('name', 'poora naam') + '<label class="f">Aadhaar last 4</label>' + txt('aadhaar4', '1234', 'tel') + '<label class="f">Kaam</label>' + chips('trade', TRADES.map(x => [x, x])) +
    '<label class="f">Thekedar</label>' + chips('contractor', cons) + '<label class="f">Roz ki mazdoori ₹</label>' + num('wage', '600') + '<label class="f">Emergency phone</label>' + txt('phone', '98xxxxxxxx', 'tel') + '</div>' + bar(t('save'), 'saveWorker');
};
V.cards = app => {
  app.innerHTML = head('🖨 Worker ID cards', 'Print karke laminate karo. Hazri ke time QR scan karo.') + '<p class="noprint"><button class="btn" data-do="print">Print</button></p>' +
    Object.values(S.workers).map(w => '<div class="idc"><div class="q">' + qrSvg(w.id) + '</div>' + (w.photo ? '<img src="' + w.photo.t + '">' : '') + '<b>' + esc(w.name) + '</b><small>' + esc(w.trade) + ' · ' + esc(party(w.contractor)) + '</small><small>ID ' + esc(w.id) + ' · Aadhaar …' + esc(w.aadhaar4) + '</small><small>' + esc((S.site || {}).name || '') + '</small><div style="clear:both"></div></div>').join('');
};
function qrSvg(text) { try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 3, margin: 0 }); } catch (e) { return ''; } }

/* material in / out / stock */
const matOpts = () => Object.keys(C.MATERIALS).map(k => [k, C.MATERIALS[k].n + ' (' + C.MATERIALS[k].u + ')']);
V.matIn = app => {
  if (!FORM._mi) { FORM = { _mi: 1, material: 'cement' }; startGPS(); }
  const u = C.MATERIALS[FORM.material].u;
  app.innerHTML = head('🚚 ' + t('matIn'), 'Truck utarne se pehle photo lo. Maal gin / naap / tol ke "mila" likho — challan wala nahi.') + '<div class="card">' +
    '<label class="f">Kaunsa maal</label>' + chips('material', matOpts()) + '<label class="f">Supplier</label>' + chips('vendor', Object.values(S.vendors).map(v => [v.id, v.name])) +
    '<div class="row2"><div><label class="f">Challan / bill no.</label>' + txt('challanNo', 'CH-123') + '</div><div><label class="f">Truck no.</label>' + txt('truck', 'OD02 AB 1234') + '</div></div>' +
    '<div class="row2"><div><label class="f">Challan par (' + u + ')</label>' + num('challanQty') + '</div><div><label class="f">Asal mein mila (' + u + ')</label>' + num('recvQty') + '</div></div>' +
    '<div class="row2"><div><label class="f">Kata parchi no. (weighbridge)</label>' + txt('kata', 'optional') + '</div><div><label class="f">Rate ₹/' + u + ' (bill)</label>' + num('rate') + '</div></div>' +
    (['cement', 'steel'].includes(FORM.material) ? '<label class="f">Brand + batch / heat no.</label>' + txt('batch', 'jaise UltraTech · batch 0912') : '') +
    '<label class="f">Photo (challan, truck number plate, maal)</label>' + photos([['challan', 'Challan / bill'], ['truck', 'Truck plate'], ['goods', 'Maal / batch'], ['kata', 'Kata parchi']]) + gpsLine() + '</div>' + bar(t('save'), 'saveMatIn');
};
V.matOut = app => {
  if (!FORM._mo) { FORM = { _mo: 1, material: 'cement' }; startGPS(); }
  const s = C.stock(S)[FORM.material], works = C.ofType(S, 'work').filter(e => C.day(e.at) >= C.addDays(today(), -2)).map(e => [e.id, (C.WORKS[e.d.work] || {}).n || e.d.work]);
  app.innerHTML = head('📦 ' + t('matOut'), 'Stock mein: ' + s.closing + ' ' + C.MATERIALS[FORM.material].u) + '<div class="card">' + '<label class="f">Kaunsa maal</label>' + chips('material', matOpts()) +
    '<label class="f">Kitna (' + C.MATERIALS[FORM.material].u + ')</label>' + num('qty') + '<label class="f">Kis kaam ke liye</label>' + (works.length ? chips('workRef', works) : '') + txt('for', 'jaise GF slab, bay 2') +
    '<label class="f">Kisko diya (mistri / thekedar)</label>' + txt('to', 'naam') + '<label class="f">Photo</label>' + photos([['issue', 'Maal dete hue']]) + gpsLine() + '</div>' + bar(t('save'), 'saveMatOut');
};
V.stock = app => {
  if (!FORM._sc) { FORM = { _sc: 1, material: 'cement' }; startGPS(); }
  const st = C.stock(S);
  app.innerHTML = head('🧮 ' + t('stock'), 'Book stock = shuru + mila (verified) − diya. Asal mein gin ke likho; farq 2% se zyada = red flag.') +
    '<div class="card"><table><tr><th>Maal</th><th>Shuru</th><th>Mila ✔</th><th>Pending</th><th>Diya</th><th>Book</th><th>Last count</th></tr>' + Object.keys(st).map(k => { const s = st[k]; return '<tr><td>' + C.MATERIALS[k].n + '</td><td>' + s.opening + '</td><td>' + C.round2(s.inQty) + '</td><td>' + C.round2(s.pendingIn) + '</td><td>' + C.round2(s.outQty) + '</td><td><b>' + s.closing + '</b></td><td>' + (s.lastCount ? s.lastCount.qty + ' (' + C.day(s.lastCount.at) + ')' : '—') + '</td></tr>'; }).join('') + '</table></div>' +
    (can('stockCount') ? '<div class="card"><h3>Physical count</h3>' + chips('material', matOpts()) + '<label class="f">Gin ke mila (' + C.MATERIALS[FORM.material].u + ')</label>' + num('qty') + photos([['count', 'Stock ki photo']]) + gpsLine() + '</div>' + bar(t('save'), 'saveCount') : '');
};

/* work progress, site visit, re-check */
const LOCS = ['Foundation', 'Plinth', 'Ground floor', 'First floor', 'Second floor', 'Roof', 'Outside'];
V.work = app => {
  if (!FORM._wk) { FORM = { _wk: 1, work: 'brick230', quality: 'ok', location: 'Ground floor' }; startGPS(); }
  const W = C.WORKS[FORM.work];
  app.innerHTML = head('🏗️ ' + t('work'), 'Naap ke likho. Isi se maal ka hisaab check hota hai (kitna cement/steel lagna chahiye tha).') + '<div class="card">' +
    '<label class="f">Kaam</label>' + chips('work', Object.keys(C.WORKS).map(k => [k, C.WORKS[k].n]).concat([['other', 'Other']])) +
    (FORM.work === 'other' ? '<label class="f">Kaam ka naam + unit</label>' + txt('workName', 'jaise tile laying sqft') : '') +
    '<label class="f">Kitna (' + (W ? W.u + (W.u === 'm2' ? ' — sqft ÷ 10.76' : ' — cft ÷ 35.3') : 'unit') + ')</label>' + num('qty') +
    (W ? '<p class="note" id="needs">' + needText(W, +FORM.qty || 0) + '</p>' : '') +
    '<label class="f">Kahan</label>' + chips('location', LOCS.map(x => [x, x])) + txt('spot', 'jaise bay 2, north wall') +
    '<label class="f">Quality</label>' + chips('quality', [['ok', '✔ Theek'], ['issue', '⚠ Problem']]) + area('notes', 'curing, level, honeycomb…') +
    '<label class="f">Project ka kitna % (optional)</label>' + num('weight', 'jaise 2') + '<label class="f">Photo (do angle)</label>' + photos([['w1', 'Photo 1'], ['w2', 'Photo 2'], ['tape', 'Naap (tape)']]) + gpsLine() + '</div>' + bar(t('save'), 'saveWork');
};
function needText(W, q) { return 'Is kaam mein lagna chahiye: ' + Object.keys(W.use).map(k => C.round2(W.use[k] * q) + ' ' + C.MATERIALS[k].u + ' ' + C.MATERIALS[k].n.toLowerCase()).join(', '); }
V.visit = app => {
  if (!FORM._vs) { FORM = { _vs: 1, purpose: 'Inspection' }; startGPS(); }
  app.innerHTML = head('👷 ' + t('visit'), 'Site par aate hi aur jaate time. Isi se pata chalta hai engineer kitna time site par tha.') + '<div class="card">' + chips('purpose', ['Arrival', 'Inspection', 'Concrete pour', 'Measurement', 'Leaving'].map(x => [x, x])) + area('notes', 'kya dekha') + photos([['visit', 'Site par selfie', 1]]) + gpsLine() + '</div>' + bar(t('save'), 'saveVisit');
};
V.recheck = app => {
  if (!FORM._rc) { FORM = { _rc: 1, ok: 'yes' }; startGPS(); }
  const L = C.ofType(S, 'work').filter(w => C.statusOf(S, w).state === 'approved' && w.by !== ME && !(S.validApprovals(w.id) || []).some(a => a.by === ME)).slice(-25).reverse();
  app.innerHTML = head('📏 ' + t('recheck'), 'Kisi doosre ka certify kiya kaam khud naap ke dekho. 5% se zyada farq = red flag.') + '<div class="card list">' + (L.length ? L.map(w => '<div class="it">' + thumb(w.photos[0]) + '<div class="t"><b>' + esc((C.WORKS[w.d.work] || {}).n || w.d.workName) + ' — ' + esc(w.d.qty) + '</b><small>' + esc(w.d.location || '') + ' ' + esc(w.d.spot || '') + ' · ' + C.day(w.at) + ' · ' + esc(personName(w.by)) + '</small></div><button class="chip' + (FORM.target === w.id ? ' on' : '') + '" data-pickt="' + w.id + '">Chuno</button></div>').join('') : '<p class="note">Re-check ke liye koi certified kaam nahi.</p>') + '</div>' +
    (FORM.target ? '<div class="card"><label class="f">Aapka naap</label>' + num('measuredQty') + '<label class="f">Quality theek?</label>' + chips('ok', [['yes', 'Haan'], ['no', 'Nahi']]) + area('notes') + photos([['rc', 'Naap ki photo']]) + gpsLine() + '</div>' + bar(t('save'), 'saveRecheck') : '');
};

/* approvals: side by side proof, one tap */
V.approve = app => {
  const L = pendingForMe();
  app.innerHTML = head('✅ ' + t('approve'), 'Jo entry aapne nahi banayi, wahi yahan dikhegi. Photo dhyan se dekho, phir haan/naa.') + (L.length ? '' : '<div class="card"><p>Kuch baaki nahi 👍</p></div>') +
    L.map(e => '<div class="card">' + entryView(e) + '<div class="row2" style="margin-top:10px"><button class="btn ok" data-ap="' + e.id + '">✔ Sahi hai</button><button class="btn no" data-rj="' + e.id + '">✖ Galat</button></div></div>').join('');
};
function entryView(e) {
  const d = C.effective(S, e), st = C.statusOf(S, e), P = e.photos || [], W = d.worker ? S.workers[d.worker] : null;
  let body = '';
  if (e.type === 'att') body = '<div class="cmp"><div>' + thumb(W && W.photo) + '<span>Register photo</span></div><div>' + thumb(P[0]) + '<span>Aaj ki selfie ' + C.timeOf(e.at) + '</span></div></div><p><b>' + esc(W ? W.name : d.worker) + '</b> · ' + (d.dir || '').toUpperCase() + '</p>';
  else if (e.type === 'matIn') body = '<p><b>' + C.MATERIALS[d.material].n + '</b>: challan ' + esc(d.challanQty) + ', mila ' + esc(d.recvQty) + ' ' + C.MATERIALS[d.material].u + ' · ' + esc(party(d.vendor)) + ' · truck ' + esc(d.truck) + ' · challan ' + esc(d.challanNo) + (d.batch ? ' · ' + esc(d.batch) : '') + '</p>';
  else if (e.type === 'matOut') body = '<p><b>' + C.MATERIALS[d.material].n + '</b>: ' + esc(d.qty) + ' ' + C.MATERIALS[d.material].u + ' → ' + esc(d.to) + ' for ' + esc(d.for) + '</p>';
  else if (e.type === 'work') body = '<p><b>' + esc((C.WORKS[d.work] || {}).n || d.workName) + '</b> ' + esc(d.qty) + ' ' + esc((C.WORKS[d.work] || {}).u || '') + ' @ ' + esc(d.location) + ' ' + esc(d.spot || '') + ' · quality ' + esc(d.quality) + '</p>' + (C.WORKS[d.work] ? '<p class="note">' + needText(C.WORKS[d.work], +d.qty || 0) + '</p>' : '');
  else if (e.type === 'pay') body = '<p><b>' + esc(d.kind) + '</b> · ' + esc(party(d.payee)) + ' · bill ' + esc(d.billNo) + ' · <b>' + inr(d.amount) + '</b> · ' + esc(d.from) + ' → ' + esc(d.to) + '</p><ul class="chk">' + C.payChecks(S, e).map(c => '<li class="' + (c.ok ? '' : c.sev === 'red' ? 'bad' : 'amb') + '">' + esc(c.label) + '</li>').join('') + '</ul>';
  else if (e.type === 'worker') body = '<p><b>' + esc(d.name) + '</b> · ' + esc(d.trade) + ' · ' + esc(party(d.contractor)) + ' · ' + inr(d.wage) + '/day · Aadhaar …' + esc(d.aadhaar4) + '</p>';
  else if (e.type === 'correction') { const tg = S.byId[d.target]; body = '<p><b>Correction</b> of ' + esc(d.target) + ' (' + esc(tg ? tg.type : '?') + '): ' + (d.void ? 'VOID the entry' : esc(JSON.stringify(d.fix))) + '<br>Reason: ' + esc(d.reason) + '</p>'; }
  else body = '<p class="mono">' + esc(JSON.stringify(d)) + '</p>';
  const ph = e.type === 'att' ? '' : '<div class="ph">' + P.map(p => '<button class="phb done" data-full="' + p.h + '"><img src="' + p.t + '"></button>').join('') + '</div>';
  return '<p class="note">' + esc(C.ROLES_T[e.type] || e.type) + ' · ' + esc(e.id) + ' · ' + C.day(e.at) + ' ' + C.timeOf(e.at) + ' · by ' + esc(personName(e.by)) + ' ' + tag(st.state) + (e.gps ? ' · 📍' + siteDist(e.gps) : ' · ⚠ no GPS') + (P.some(p => p.old) ? ' · ⚠ old photo' : '') + '</p>' + body + ph;
}

/* payments */
V.pay = app => {
  if (!FORM._py) { FORM = { _py: 1, kind: 'wages', from: C.addDays(today(), -6), to: today(), items: [] }; startGPS(); }
  const kinds = [['wages', 'Mazdoori (wages)'], ['contractor', 'Thekedar bill'], ['vendor', 'Supplier bill'], ['advance', 'Advance']];
  const payees = FORM.kind === 'vendor' ? Object.values(S.vendors) : FORM.kind === 'advance' ? Object.values(S.contractors).concat(Object.values(S.vendors)) : Object.values(S.contractors);
  const works = C.ofType(S, 'work').filter(w => C.statusOf(S, w).state === 'approved' && C.day(w.at) >= FORM.from && C.day(w.at) <= FORM.to).map(w => [w.id, ((C.WORKS[w.d.work] || {}).n || w.d.workName) + ' ' + w.d.qty]);
  app.innerHTML = head('🧾 ' + t('pay'), 'Payment sirf tab: kaam verified + maal verified + hazri match + 2 approval (ek owner).') + '<div class="card">' +
    chips('kind', kinds) + '<label class="f">Kisko</label>' + chips('payee', payees.map(p => [p.id, p.name])) +
    '<div class="row2"><div><label class="f">Bill no.</label>' + txt('billNo') + '</div><div><label class="f">Amount ₹</label>' + num('amount') + '</div></div>' +
    '<div class="row2"><div><label class="f">Se (date)</label>' + txt('from', '', 'date') + '</div><div><label class="f">Tak</label>' + txt('to', '', 'date') + '</div></div>' +
    (['wages', 'contractor'].includes(FORM.kind) ? '<label class="f">Bill mein kitne man-days likhe</label>' + num('claimedDays') : '') +
    (FORM.kind === 'contractor' ? '<label class="f">Kis kaam ka bill (certified kaam)</label>' + (works.length ? chips('workRefs', works, true) : '<p class="note">Is period mein certified kaam nahi.</p>') : '') +
    (FORM.kind === 'vendor' ? '<label class="f">Bill ke items</label>' + itemsUI() : '') +
    (FORM.kind !== 'advance' ? '<label class="f">Advance adjust ₹</label>' + num('advanceAdjusted', '0') : '') +
    '<label class="f">Bill ki photo</label>' + photos([['bill', 'Bill / invoice']]) + gpsLine() + '</div><div class="card"><h3>Automatic checks</h3><ul class="chk" id="paychk">' + payChecksHtml() + '</ul><p class="note">Red check ho to bhi request ban sakti hai, par payment tab tak "Paid" nahi hoga jab tak theek na ho.</p></div>' + bar(t('save'), 'savePay');
};
function payChecksHtml() {
  const draft = { id: 'draft', dev: 'x', type: 'pay', at: new Date().toISOString(), by: ME, photos: FORM._photos && FORM._photos.bill ? [FORM._photos.bill] : [], d: payData() };
  const S2 = C.build(E.concat([draft]));
  return C.payChecks(S2, S2.byId.draft).filter(c => !/Two approvals/.test(c.label)).map(c => '<li class="' + (c.ok ? '' : c.sev === 'red' ? 'bad' : 'amb') + '">' + esc(c.label) + '</li>').join('');
}
function payData() { const d = { kind: FORM.kind, payee: FORM.payee, billNo: FORM.billNo, amount: +FORM.amount || 0, from: FORM.from, to: FORM.to }; if (FORM.claimedDays) d.claimedDays = +FORM.claimedDays; if (FORM.kind === 'contractor') d.workRefs = FORM.workRefs || []; if (FORM.kind === 'vendor') d.items = (FORM.items || []).filter(i => i.qty); if (+FORM.advanceAdjusted) d.advanceAdjusted = +FORM.advanceAdjusted; return d; }
function itemsUI() { FORM.items = FORM.items && FORM.items.length ? FORM.items : [{ material: 'cement', qty: '', rate: '' }]; return FORM.items.map((it, i) => '<div class="row2" style="grid-template-columns:2fr 1fr 1fr"><select data-item="' + i + '" data-f="material">' + matOpts().map(([k, l]) => '<option value="' + k + '"' + (it.material === k ? ' selected' : '') + '>' + l + '</option>').join('') + '</select><input type="number" placeholder="qty" data-item="' + i + '" data-f="qty" value="' + esc(it.qty) + '"><input type="number" placeholder="rate ₹" data-item="' + i + '" data-f="rate" value="' + esc(it.rate) + '"></div>').join('') + '<button class="btn ghost sm" data-do="addItem">+ item</button>'; }
V.paid = app => {
  if (!FORM._pd) { FORM = { _pd: 1, mode: 'Bank transfer' }; startGPS(); }
  const L = C.ofType(S, 'pay').filter(p => !C.ofType(S, 'paid').some(x => x.d.target === p.id));
  app.innerHTML = head('💸 ' + t('paid'), 'Sirf wahi payment yahan "paid" hoga jiske saare checks green aur 2 approval ho.') + '<div class="card list">' + (L.length ? L.map(p => { const ok = C.payReady(S, p); return '<div class="it"><div class="t"><b>' + esc(party(p.d.payee)) + ' · ' + inr(p.d.amount) + '</b><small>' + esc(p.d.kind) + ' · bill ' + esc(p.d.billNo) + ' · ' + esc(p.id) + '</small></div>' + (ok ? '<button class="chip' + (FORM.target === p.id ? ' on' : '') + '" data-pickt="' + p.id + '">Chuno</button>' : '<span class="tag pending">' + (C.statusOf(S, p).state === 'approved' ? 'checks red' : 'approval baaki') + '</span>') + '</div>'; }).join('') : '<p class="note">Koi payment pending nahi.</p>') + '</div>' +
    (FORM.target ? '<div class="card">' + chips('mode', [['Bank transfer', 'Bank'], ['UPI', 'UPI'], ['Cheque', 'Cheque'], ['Cash', 'Cash (avoid)']]) + '<label class="f">UTR / cheque no.</label>' + txt('utr') + photos([['receipt', 'Receipt / screenshot']]) + '</div>' + bar(t('save'), 'savePaid') : '');
};

/* flags, reports, audit, plan */
V.flags = app => {
  app.innerHTML = head('🚩 ' + t('flags'), '🔴 Red = kaam/payment roko, 🟠 Amber = 24 ghante mein jawab.') + (FL.length ? FL.map(f => '<div class="flag ' + f.sev + '"><b>' + (f.sev === 'red' ? '🔴' : '🟠') + ' ' + f.rule + '</b> ' + esc(f.text) + '<small>' + esc(f.action) + (f.ref ? ' · <a href="#/entry/' + encodeURIComponent(f.ref) + '">entry dekho</a>' : '') + '</small></div>').join('') : '<div class="card"><p>🟢 Koi flag nahi.</p></div>');
};
V.entry = (app, id) => {
  const e = S.byId[id]; if (!e) { app.innerHTML = head('Entry') + '<p>Not found</p>'; return; }
  const corr = (S.corrections[id] || []).map(c => '<li>' + esc(c.id) + ': ' + esc(c.d.reason) + ' — ' + C.statusOf(S, c).state + '</li>').join('');
  app.innerHTML = head('Entry ' + esc(id)) + '<div class="card">' + entryView(e) + '<p class="mono">hash ' + e.hash + '<br>prev ' + e.prev + '</p>' + (corr ? '<h3>Corrections</h3><ul>' + corr + '</ul>' : '') + '</div>' +
    (can('correction') && !['approve', 'reject', 'correction'].includes(e.type) ? '<div class="card"><h3>Galti hai? Correction entry</h3><p class="note">Purani entry nahi badlegi. Correction tabhi lagega jab owner/engineer approve kare.</p>' + chips('cmode', [['fix', 'Value theek karo'], ['void', 'Entry radd (void)']]) +
      (FORM.cmode === 'fix' ? Object.keys(e.d).filter(k => typeof e.d[k] !== 'object').map(k => '<label class="f">' + esc(k) + ' (abhi: ' + esc(e.d[k]) + ')</label><input type="text" data-k="fix_' + k + '" placeholder="naya value — khali chhodo agar theek hai">').join('') : '') +
      '<label class="f">Reason (zaroori)</label>' + area('reason') + '<button class="btn" data-do="saveCorr" data-t="' + esc(id) + '">Correction bhejo</button></div>' : '');
};
V.reports = (app, which) => {
  which = which || 'daily'; FORM.rdate = FORM.rdate || today();
  let body = '';
  if (which === 'daily') { const R = C.dailyReport(S, FORM.rdate, { chainBad: CHAIN_BAD }); FORM._text = C.dailyText(R); body = '<label class="f">Date</label>' + txt('rdate', '', 'date') + '<pre class="card" style="white-space:pre-wrap;font:14px/1.45 system-ui">' + esc(FORM._text) + '</pre><p><button class="btn" data-do="wa">WhatsApp par bhejo</button> <button class="btn ghost" data-do="copy">Copy</button> <button class="btn ghost" data-do="print">Print</button></p>'; }
  if (which === 'weekly') { const to = FORM.rdate, from = C.addDays(to, -6), R = C.weeklyReport(S, from, to); body = '<label class="f">Week ending</label>' + txt('rdate', '', 'date') + '<div class="card"><h3>Hazri vs bill vs payment (' + from + ' → ' + to + ')</h3><table><tr><th>Thekedar</th><th>Hazri days</th><th>Bill days</th><th>Gap</th><th>Wage due</th><th>Paid</th></tr>' + R.labour.map(l => '<tr><td>' + esc(l.contractor) + '</td><td>' + l.days + '</td><td>' + l.billedDays + '</td><td style="color:' + (l.gapDays > 0 ? 'var(--red)' : 'inherit') + '">' + l.gapDays + '</td><td>' + inr(l.wageDue) + '</td><td>' + inr(l.paid) + '</td></tr>').join('') + '</table></div><div class="card"><h3>Maal: kaam ke hisaab se vs diya</h3><table><tr><th>Maal</th><th>Lagna tha</th><th>Diya</th><th>Gap</th><th></th></tr>' + R.materials.map(u => '<tr><td>' + C.MATERIALS[u.material].n + '</td><td>' + u.theoretical + '</td><td>' + u.issued + '</td><td>' + u.gapPct + '% (allowed ' + u.allowedPct + '%)</td><td>' + (u.sev === 'red' ? '🔴' : u.sev === 'amber' ? '🟠' : '🟢') + '</td></tr>').join('') + '</table></div><div class="card"><h3>Surprise audits</h3>' + (R.audits.length ? R.audits.map(a => '<p>' + (a.ok ? '🟢' : '🔴') + ' ' + esc(a.id) + ' by ' + esc(a.by) + ' · ' + a.n + ' items</p>').join('') : '<p class="note">Is hafte koi audit nahi — kam se kam 1 karo.</p>') + '</div><div class="card"><h3>Flags</h3>' + R.flags.slice(0, 20).map(f => '<div class="flag ' + f.sev + '">' + esc(f.text) + '</div>').join('') + '</div>'; }
  if (which === 'monthly') { const ym = FORM.rdate.slice(0, 7), R = C.monthlyReport(S, ym); body = '<label class="f">Month (koi bhi date)</label>' + txt('rdate', '', 'date') + '<div class="stats"><div><b>' + inr(R.leakage) + '</b><span>leakage estimate</span></div><div><b>' + R.red + '</b><span>red flags</span></div><div><b>' + R.amber + '</b><span>amber</span></div></div><div class="card"><h3>Scorecard (100 = saaf)</h3><table><tr><th>Party</th><th></th><th>Score</th><th>Kyun</th></tr>' + R.parties.map(p => '<tr><td>' + esc(p.name) + '</td><td>' + p.kind + '</td><td><b style="color:' + (p.score < 70 ? 'var(--red)' : p.score < 90 ? 'var(--amb)' : 'var(--ok)') + '">' + p.score + '</b></td><td class="note">' + esc(p.notes.slice(0, 3).join('; ')) + '</td></tr>').join('') + '</table></div><div class="card"><h3>Flags by rule</h3><p>' + Object.keys(R.byRule).map(k => k + ': ' + R.byRule[k]).join(' · ') + '</p></div>'; }
  if (which === 'anchor') body = '<div class="card"><p class="note">Har din ki saari entries ka ek fingerprint (Merkle root). Isse BhuChain blockchain par daalenge — baad mein koi entry badli to root match nahi karega.</p><div id="roots">…</div></div>';
  app.innerHTML = head('📊 ' + t('reports')) + '<div class="chips noprint">' + [['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['anchor', 'Day hash']].map(([k, l]) => '<a class="chip' + (which === k ? ' on' : '') + '" href="#/reports/' + k + '">' + l + '</a>').join('') + '</div>' + body;
  if (which === 'anchor') { const days = [...new Set(E.map(e => C.day(e.at)))].sort().reverse().slice(0, 30); Promise.all(days.map(d => C.dayRoot(E, d))).then(R => { const el = $('#roots'); if (el) el.innerHTML = '<table><tr><th>Date</th><th>Entries</th><th>Root hash</th></tr>' + R.filter(Boolean).map(r => '<tr><td>' + r.date + '</td><td>' + r.count + '</td><td class="mono">' + r.root + '</td></tr>').join('') + '</table>'; }); }
};
V.audit = app => {
  const ymd = today(), pick = C.ofType(S, 'auditPick').filter(e => C.day(e.at) === ymd).pop(), done = pick && C.ofType(S, 'audit').some(a => a.d.pick === pick.id);
  if (!FORM._au) { FORM = { _au: 1 }; startGPS(); }
  const last = C.ofType(S, 'audit').slice(-2).map(a => a.by);
  let h = head('🎲 ' + t('audit'), 'Bina bataye. Pehle app random chunta hai (record ho jata hai), phir jaake check karo.');
  if (can('headcount')) h += '<div class="card"><h3>Surprise headcount</h3><p>App ke hisaab se abhi site par: <b>' + C.presentNow(S, ymd).length + '</b></p><label class="f">Aapne gine</label>' + num('counted') + photos([['crowd', 'Sab workers ki photo']]) + gpsLine() + '<p><button class="btn" data-do="saveHead">Headcount save</button></p></div>';
  if (can('auditPick')) {
    if (last.length === 2 && last.every(b => b === ME)) h += '<div class="flag amber">Pichhle 2 audit aapne kiye — is baar kisi aur ko bhejo (rotation).</div>';
    if (!pick) h += '<div class="card"><button class="btn wide" data-do="pick">🎲 Aaj ka random audit chuno</button></div>';
    else {
      const P = pick.d, st = C.stock(S);
      h += '<div class="card"><h3>Aaj ka audit (' + esc(pick.id) + ')' + (done ? ' — ho gaya ✔' : '') + '</h3>' + (done ? '' :
        P.workers.map((w, i) => '<label class="f">Worker: ' + esc((S.workers[w] || {}).name || w) + ' — site par hai aur chehra photo se milta hai?</label>' + chips('aw' + i, [['yes', 'Haan'], ['no', 'Nahi']])).join('') +
        P.materials.map((m, i) => '<label class="f">' + C.MATERIALS[m].n + ' — book ' + st[m].closing + ' ' + C.MATERIALS[m].u + '. Gin ke likho:</label>' + num('am' + i)).join('') +
        (P.work || []).map((w, i) => { const x = S.byId[w]; return x ? '<label class="f">Kaam ' + esc((C.WORKS[x.d.work] || {}).n || '') + ' ' + esc(x.d.qty) + ' @ ' + esc(x.d.location) + ' — naap ke likho:</label>' + num('aq' + i) : ''; }).join('') +
        photos([['au1', 'Audit photo 1'], ['au2', 'Audit photo 2']]) + gpsLine() + '<p><button class="btn" data-do="saveAudit" data-t="' + pick.id + '">Audit save</button></p>') + '</div>';
    }
  }
  app.innerHTML = h;
};
V.plan = app => { if (!FORM._pl) FORM = { _pl: 1 }; app.innerHTML = head('📅 ' + t('plan'), 'Har line ek kaam. Daily report mein jaata hai.') + '<div class="card">' + area('text', 'jaise\nFF slab shuttering\n20 bag cement chahiye') + '</div>' + bar(t('save'), 'savePlan'); };
V.tip = app => { if (!FORM._tp) FORM = { _tp: 1 }; app.innerHTML = head('🤫 ' + t('tip'), 'Aapka naam save nahi hota. Sach batao: kya, kab, kahan. Photo ho to lagao.') + '<div class="card">' + area('text', 'kya galat ho raha hai') + photos([['tip', 'Photo (optional)']]) + ((S.site && S.site.tipUrl) ? '<p class="note">Ya bahar se bhejo: <a href="' + esc(S.site.tipUrl) + '" target="_blank" rel="noopener">anonymous Google Form</a></p>' : '') + '</div>' + bar('Bhejo', 'saveTip'); };

/* people and parties (owner) */
V.people = (app, sec) => {
  sec = sec || 'staff'; if (!FORM._pp || FORM._pp !== sec) FORM = { _pp: sec, role: 'supervisor' };
  const tabs = [['staff', 'Staff'], ['contractor', 'Thekedar'], ['vendor', 'Supplier'], ['rate', 'Rates'], ['coi', 'Rishte (COI)'], ['site', 'Site']];
  let h = head('👥 ' + t('people')) + '<div class="chips">' + tabs.map(([k, l]) => '<a class="chip' + (sec === k ? ' on' : '') + '" href="#/people/' + k + '">' + l + '</a>').join('') + '</div>';
  if (sec === 'staff') h += '<div class="card list">' + Object.values(S.persons).map(p => '<div class="it"><div class="t"><b>' + esc(p.name) + '</b><small>' + esc(C.ROLES[p.role]) + ' · ' + esc(p.phone || '') + '</small></div></div>').join('') + '</div><div class="card"><h3>+ Staff</h3><label class="f">Naam</label>' + txt('name') + '<label class="f">Role</label>' + chips('role', Object.keys(C.ROLES).filter(r => r !== 'owner').map(r => [r, C.ROLES[r]])) + '<label class="f">Phone</label>' + txt('phone', '', 'tel') + '<label class="f">PIN (4 ank)</label>' + txt('pin', '', 'password') + '<p class="note">Ek aadmi = ek role. Hazri lene wala, maal lene wala, payment wala aur approve karne wala alag hon.</p><button class="btn" data-do="savePerson">Add</button></div>';
  if (sec === 'contractor') h += '<div class="card list">' + Object.values(S.contractors).map(c => '<div class="it"><div class="t"><b>' + esc(c.name) + '</b><small>Work order ' + inr(c.workOrder) + ' · advance limit ' + inr(c.advanceLimit) + '</small></div></div>').join('') + '</div><div class="card"><h3>+ Thekedar</h3><label class="f">Naam</label>' + txt('name') + '<label class="f">Phone</label>' + txt('phone', '', 'tel') + '<label class="f">Work order ₹</label>' + num('workOrder') + '<label class="f">Advance limit ₹ (jaise work order ka 10%)</label>' + num('advanceLimit') + '<button class="btn" data-do="saveParty" data-t="contractor">Add</button></div>';
  if (sec === 'vendor') h += '<div class="card list">' + Object.values(S.vendors).map(c => '<div class="it"><div class="t"><b>' + esc(c.name) + '</b><small>' + esc(c.phone || '') + ' · GST ' + esc(c.gst || '—') + '</small></div></div>').join('') + '</div><div class="card"><h3>+ Supplier</h3><label class="f">Naam</label>' + txt('name') + '<label class="f">Phone</label>' + txt('phone', '', 'tel') + '<label class="f">GSTIN</label>' + txt('gst') + '<label class="f">Advance limit ₹</label>' + num('advanceLimit') + '<button class="btn" data-do="saveParty" data-t="vendor">Add</button></div>';
  if (sec === 'rate') h += '<div class="card"><table><tr><th>Supplier</th><th>Maal</th><th>Approved rate</th></tr>' + Object.values(S.rates).map(r => '<tr><td>' + esc(r.vendor === '*' ? 'All' : party(r.vendor)) + '</td><td>' + C.MATERIALS[r.material].n + '</td><td>' + inr(r.rate) + '/' + C.MATERIALS[r.material].u + '</td></tr>').join('') + '</table><p class="note">Bina rate set kiye default market rate se check hota hai: ' + Object.keys(C.MATERIALS).map(k => C.MATERIALS[k].n + ' ' + inr(C.MATERIALS[k].rate)).join(', ') + '. Har mahine update karo.</p></div><div class="card"><h3>+ Approved rate</h3>' + chips('vendor', [['*', 'All suppliers']].concat(Object.values(S.vendors).map(v => [v.id, v.name]))) + chips('material', matOpts()) + '<label class="f">Rate ₹</label>' + num('rate') + '<button class="btn" data-do="saveRate">Add</button></div>';
  if (sec === 'coi') h += '<div class="card list">' + S.coi.map(c => '<div class="it"><div class="t"><b>' + esc(personName(c.person)) + ' ↔ ' + esc(party(c.party)) + '</b><small>' + esc(c.relation) + '</small></div></div>').join('') + '</div><div class="card"><h3>+ Rishta / conflict of interest</h3><p class="note">Har staff se likhwa lo: kisi thekedar/supplier se rishtedari, partnership, commission. Aisa aadmi us party ka bill approve nahi kar payega.</p>' + chips('person', Object.values(S.persons).map(p => [p.id, p.name])) + chips('party', Object.values(S.contractors).concat(Object.values(S.vendors)).map(p => [p.id, p.name])) + '<label class="f">Rishta</label>' + txt('relation', 'jaise saala, partner') + '<button class="btn" data-do="saveCoi">Add</button></div>';
  if (sec === 'site') h += '<div class="card"><p><b>' + esc(S.site.name) + '</b> · ' + esc(S.site.lat) + ', ' + esc(S.site.lng) + ' · radius ' + esc(S.site.radius) + ' m</p><label class="f">Anonymous complaint Google Form link (optional)</label>' + txt('tipUrl', 'https://forms.gle/…') + '<button class="btn" data-do="saveTipUrl">Save</button><p class="note">Site ki koi bhi setting correction entry se badalti hai — purani bhi record mein rehti hai.</p></div>';
  app.innerHTML = h;
};

/* sync and backup */
V.sync = async app => {
  const url = (await meta('syncUrl')) || '', key = (await meta('syncKey')) || '', sent = (await meta('sent')) || {}, unsent = E.filter(e => !sent[e.id]).length;
  app.innerHTML = head('☁️ ' + t('sync'), 'Sab data pehle phone mein save hota hai (internet na ho tab bhi). Internet aate hi Google Sheet + Drive mein chala jaata hai.') +
    '<div class="card"><p>Is phone par entries: <b>' + E.length + '</b> · bhejna baaki: <b>' + unsent + '</b> · device ID <span class="mono">' + DEV + '</span></p><label class="f">Google Apps Script URL</label><input type="text" id="surl" value="' + esc(url) + '" placeholder="https://script.google.com/macros/s/…/exec"><label class="f">Site key (owner se lo)</label><input type="text" id="skey" value="' + esc(key) + '"><p><button class="btn" data-do="syncSave">Save + sync now</button></p><p class="note">Setup: docs/GOOGLE-SETUP.md. Doosre phones ki entries bhi yahin se aati hain.</p></div>' +
    '<div class="card"><h3>Backup</h3><p><button class="btn ghost" data-do="export">⬇ Backup file (JSON)</button> <button class="btn ghost" data-do="csv">⬇ Sheets ke liye CSV</button> <button class="btn ghost" data-do="import">⬆ Backup / doosre phone ki file jodo</button></p><p class="note">File jodne par har entry ka hash check hota hai. Badli hui entry nahi judegi.</p></div>';
};
let syncT = 0; function syncSoon() { clearTimeout(syncT); syncT = setTimeout(() => syncNow(true), 1500); }
async function syncNow(quiet) {
  const url = await meta('syncUrl'), key = await meta('syncKey'); if (!url || !navigator.onLine) { if (!quiet) toast(url ? 'Internet nahi — baad mein' : 'Pehle URL daalo', true); return; }
  try {
    const sent = (await meta('sent')) || {}, todo = E.filter(e => !sent[e.id]).slice(0, 25);
    if (todo.length) {
      const photos = {}; for (const e of todo) for (const p of e.photos || []) photos[p.h] = await getKey('photos', p.h);
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ key, site: (S.site || {}).name, entries: todo.map(e => Object.assign({}, e, { photos: (e.photos || []).map(p => ({ h: p.h, kind: p.kind, ts: p.ts, ah: p.ah, old: p.old })) })), photos }) });
      const j = await r.json(); if (!j.ok) throw new Error(j.error || 'sync failed'); (j.saved || todo.map(e => e.id)).forEach(id => sent[id] = 1); await meta('sent', sent);
      if (E.some(e => !sent[e.id])) return syncNow(quiet);
    }
    const since = (await meta('pulled')) || '', r2 = await fetch(url + '?key=' + encodeURIComponent(key) + '&since=' + encodeURIComponent(since)), j2 = await r2.json();
    if (j2.ok && j2.entries) { const n = await mergeEntries(j2.entries, true); await meta('pulled', j2.now || new Date().toISOString()); if (n && !quiet) toast(n + ' nayi entries aayi'); }
    if (!quiet) toast('☁️ Sync ho gaya'); await reload(); if (ROUTE === 'sync' || ROUTE === 'home') render();
  } catch (err) { if (!quiet) toast('Sync nahi hua: ' + err.message, true); }
}
// add entries from another phone or a backup: each must hash correctly and fit its device chain
async function mergeEntries(list, fromServer) {
  const have = new Set(E.map(e => e.id)), add = [];
  for (const e of list) { if (have.has(e.id) || !e.hash) continue; if (await C.sha256(C.hashBody(e)) !== e.hash) continue; add.push(e); }
  for (const e of add) { await tx('entries', 'readwrite', s => s.put(e)); }
  if (add.length) { const sent = (await meta('sent')) || {}; if (fromServer) add.forEach(e => sent[e.id] = 1); await meta('sent', sent); await reload(); }
  return add.length;
}
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function toCSV() { const rows = [['id', 'device', 'seq', 'type', 'time_IST', 'by', 'lat', 'lng', 'gps_acc', 'photos', 'status', 'data', 'hash', 'prev']]; S.all.forEach(e => rows.push([e.id, e.dev, e.seq, e.type, C.day(e.at) + ' ' + C.timeOf(e.at), personName(e.by), e.gps ? e.gps.lat : '', e.gps ? e.gps.lng : '', e.gps ? e.gps.acc : '', (e.photos || []).map(p => p.h.slice(0, 12)).join(' '), C.statusOf(S, e).state, JSON.stringify(e.d), e.hash, e.prev])); return rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\n'); }

/* guide */
V.guide = app => {
  app.innerHTML = head('📘 ' + t('guide')) + '<div class="card"><h3>6 niyam</h3><ol><li><b>Do-aadmi:</b> jo entry banata hai wo approve nahi kar sakta. Payment ko 2 approval chahiye, ek owner ka.</li><li><b>Saboot:</b> har entry ke saath photo + GPS + time. Bina saboot = "unverified", ginti mein nahi.</li><li><b>Milaan:</b> hazri ↔ mazdoori, maal aaya ↔ bill, kaam ↔ maal kharch — app khud milaata hai.</li><li><b>No edit:</b> koi entry delete/edit nahi. Galti = correction entry + reason + approval.</li><li><b>Achanak jaanch:</b> app random worker/maal chunta hai, auditor jaake gine.</li><li><b>Kaam ka bantwara:</b> hazri, maal, payment aur approval alag-alag log.</li></ol></div>' +
    '<div class="card"><h3>Roz ka kaam (2–3 minute har step)</h3><table><tr><th>Time</th><th>Kaun</th><th>Kya</th></tr>' + [['8:00–8:30', 'Gate / supervisor', 'Hazri IN — har worker ki selfie'], ['8:30', 'Engineer', 'Site visit — Arrival selfie'], ['9:00', 'Supervisor', 'Hazri approve (photo milaao)'], ['Truck aaye tab', 'Storekeeper', 'Material aaya — challan, truck, kata parchi photo'], ['Truck ke baad', 'Engineer / supervisor', 'Material aaya approve'], ['Maal dete waqt', 'Storekeeper', 'Material diya — kis kaam ke liye'], ['Din bhar', 'Supervisor / engineer', 'Aaj ka kaam — naap + 2 photo'], ['5:00–5:30', 'Gate', 'Hazri OUT selfie'], ['5:30', 'Storekeeper', 'Stock check (ek maal roz)'], ['6:00', 'Engineer', 'Kaam certify + Kal ka plan'], ['6:15', 'Owner', 'Daily report WhatsApp, red flags dekho']].map(r => '<tr><td>' + r.join('</td><td>') + '</td></tr>').join('') + '</table></div><p class="note">Poora manual: integrity/docs/MANUAL.md · Hindi: docs/STAFF-GUIDE-HI.md · Odia: docs/STAFF-GUIDE-OR.md</p>';
};

/* ---------- events ---------- */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-go],[data-do],[data-v],[data-photo],[data-who],[data-pin],[data-attw],[data-ap],[data-rj],[data-pickt],[data-lang],[data-full]'); if (!el) return;
  if (el.dataset.go) { FORM = {}; return go(el.dataset.go.split('/')[0], el.dataset.go.split('/')[1]); }
  if (el.dataset.lang) { LANG = el.dataset.lang; try { localStorage.setItem('bsi_lang', LANG); } catch (x) {} return render(); }
  if (el.dataset.v != null && el.parentElement.dataset.chips) { const k = el.parentElement.dataset.chips; if (el.parentElement.dataset.multi) { const L = FORM[k] = FORM[k] || []; const i = L.indexOf(el.dataset.v); i < 0 ? L.push(el.dataset.v) : L.splice(i, 1); } else FORM[k] = el.dataset.v; return render(); }
  if (el.dataset.photo) { const p = await takePhoto(el.dataset.photo, !!el.dataset.front, FORM._gps); if (p) { FORM._photos = FORM._photos || {}; FORM._photos[el.dataset.photo] = p; render(); } return; }
  if (el.dataset.full) { const src = await getKey('photos', el.dataset.full); if (src) { const w = window.open(); if (w) w.document.write('<img src="' + src + '" style="max-width:100%">'); } return; }
  if (el.dataset.who) { FORM.who = el.dataset.who; FORM.pin = ''; $('#pinbox').classList.remove('hide'); $('#dots').textContent = ''; return; }
  if (el.dataset.pin != null) { const k = el.dataset.pin; if (k === '⌫') FORM.pin = FORM.pin.slice(0, -1); else if (k === '✔' || FORM.pin.length >= 3) { if (k !== '✔') FORM.pin += k; const p = S.persons[FORM.who], ok = p && p.pinHash === await C.sha256('bsi:' + p.id + ':' + FORM.pin); if (ok) { ME = p.id; sessionStorage.setItem('bsi_me', ME); FORM = {}; go('home'); render(); } else { toast('PIN galat', true); FORM.pin = ''; } } else FORM.pin += k; const d = $('#dots'); if (d) d.textContent = '•'.repeat(FORM.pin.length); return; }
  if (el.dataset.attw) return attFor(el.dataset.attw);
  if (el.dataset.ap) { await approve(el.dataset.ap, true); return render(); }
  if (el.dataset.rj) { const why = prompt('Kyun galat hai? (zaroori)'); if (!why) return; await approve(el.dataset.rj, false, why); return render(); }
  if (el.dataset.pickt) { FORM.target = el.dataset.pickt; return render(); }
  const act = el.dataset.do; if (!act) return;
  try { await (ACT[act] || (() => {}))(el); } catch (err) { if (err.message !== 'stop') toast(err.message, true); }
});
document.addEventListener('input', e => { const el = e.target; if (el.dataset.k) { FORM[el.dataset.k] = el.value; if (el.dataset.k === 'q' && ROUTE === 'att') { const pos = el.selectionStart; render(); const n = document.querySelector('[data-k="q"]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } if (el.dataset.k === 'qty' && ROUTE === 'work' && $('#needs') && C.WORKS[FORM.work]) $('#needs').textContent = needText(C.WORKS[FORM.work], +el.value || 0); } if (el.dataset.item != null) { FORM.items[+el.dataset.item][el.dataset.f] = el.dataset.f === 'material' ? el.value : el.value; } });
document.addEventListener('change', e => { const el = e.target; if (el.dataset.k === 'rdate' || (ROUTE === 'pay' && ['from', 'to'].includes(el.dataset.k))) render(); });
let payT = 0; document.addEventListener('input', () => { if (ROUTE !== 'pay') return; clearTimeout(payT); payT = setTimeout(() => { const el = $('#paychk'); if (el) el.innerHTML = payChecksHtml(); }, 250); });
$('#langBtn').addEventListener('click', () => { LANG = LANG === 'hl' ? 'hi' : LANG === 'hi' ? 'or' : 'hl'; try { localStorage.setItem('bsi_lang', LANG); } catch (x) {} render(); });
$('#imp').addEventListener('change', async () => { const f = $('#imp').files[0]; if (!f) return; try { const j = JSON.parse(await f.text()); for (const h of Object.keys(j.photos || {})) await putKey('photos', j.photos[h], h); const n = await mergeEntries(j.entries || []); toast(n + ' entries judi'); render(); } catch (err) { toast('File galat: ' + err.message, true); } });

const ACT = {
  regps: () => { startGPS(); render(); },
  siteGps: async () => { const g = await getGPS(); if (!g) return toast('GPS nahi mila', true); FORM.lat = g.lat; FORM.lng = g.lng; $('#sloc').textContent = g.lat + ', ' + g.lng + ' (±' + g.acc + ' m)'; },
  setup: async () => {
    need(FORM.name && FORM.owner, 'Site aur owner ka naam likho'); need(/^\d{4}$/.test(FORM.pin || ''), 'PIN 4 ank ka ho'); need(FORM.lat, 'Site ki location lo');
    const opening = {}; Object.keys(C.MATERIALS).forEach(k => { if (+FORM['op_' + k]) opening[k] = +FORM['op_' + k]; });
    await save('site', { name: FORM.name, lat: FORM.lat, lng: FORM.lng, radius: +FORM.radius || 150, opening }, { setup: 1, by: null, gps: { lat: FORM.lat, lng: FORM.lng, acc: 0 } });
    const id = DEV + '-' + (chain().length + 1), pinHash = await C.sha256('bsi:' + id + ':' + FORM.pin);
    const p = await save('person', { name: FORM.owner, role: 'owner', pinHash }, { setup: 1, by: null }); ME = p.id; sessionStorage.setItem('bsi_me', ME); FORM = {}; go('home'); render();
  },
  logout: () => { ME = null; sessionStorage.removeItem('bsi_me'); FORM = {}; go('home'); render(); },
  scan: async () => {
    if (!('BarcodeDetector' in window)) return toast('Is phone par QR scan nahi — naam se chuno', true);
    const p = await new Promise(r => { const inp = $('#cam'); inp.value = ''; inp.onchange = () => r(inp.files[0]); inp.click(); }); if (!p) return;
    const bmp = await createImageBitmap(p), codes = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(bmp);
    const id = codes[0] && codes[0].rawValue; if (!id || !S.workers[id]) return toast('QR pehchana nahi', true); attFor(id);
  },
  saveWorker: async () => {
    need(FORM._photos && FORM._photos.face, 'Worker ki photo lo'); need(FORM.name, 'Naam likho'); need(/^\d{4}$/.test(FORM.aadhaar4 || ''), 'Aadhaar ke last 4 ank'); need(+FORM.wage > 0, 'Mazdoori likho');
    await save('worker', { name: FORM.name.trim(), aadhaar4: FORM.aadhaar4, trade: FORM.trade, contractor: FORM.contractor || '', wage: +FORM.wage, phone: FORM.phone || '' }, { gps: await getGPS(), photos: shot(['face']) }); FORM = {}; go('workers');
  },
  saveMatIn: async () => {
    need(FORM.vendor, 'Supplier chuno'); need(+FORM.challanQty > 0 && +FORM.recvQty >= 0 && FORM.recvQty !== undefined && FORM.recvQty !== '', 'Challan aur mila — dono likho'); need(FORM.challanNo, 'Challan no.'); need(FORM._photos && FORM._photos.challan && FORM._photos.truck, 'Challan aur truck plate ki photo zaroori');
    await save('matIn', { material: FORM.material, vendor: FORM.vendor, challanNo: FORM.challanNo, truck: (FORM.truck || '').toUpperCase(), challanQty: +FORM.challanQty, recvQty: +FORM.recvQty, kata: FORM.kata || '', rate: +FORM.rate || 0, batch: FORM.batch || '' }, { gps: FORM._gps, photos: shot(['challan', 'truck', 'goods', 'kata']) }); FORM = {}; go('home');
  },
  saveMatOut: async () => {
    need(+FORM.qty > 0, 'Kitna diya likho'); need(FORM.for || FORM.workRef, 'Kis kaam ke liye'); need(FORM.to, 'Kisko diya');
    const st = C.stock(S)[FORM.material]; if (+FORM.qty > st.closing + st.pendingIn) toast('⚠ Stock se zyada diya — flag banega', true);
    await save('matOut', { material: FORM.material, qty: +FORM.qty, for: FORM.for || '', workRef: FORM.workRef || '', to: FORM.to }, { gps: FORM._gps, photos: shot(['issue']) }); FORM = {}; go('home');
  },
  saveCount: async () => { need(FORM.qty !== undefined && FORM.qty !== '', 'Gin ke likho'); await save('stockCount', { material: FORM.material, qty: +FORM.qty }, { gps: FORM._gps, photos: shot(['count']) }); FORM = {}; render(); },
  saveWork: async () => {
    need(+FORM.qty > 0, 'Kitna kaam — likho'); need(FORM._photos && (FORM._photos.w1 || FORM._photos.w2), 'Kam se kam ek photo'); need(FORM.work !== 'other' || FORM.workName, 'Kaam ka naam');
    await save('work', { work: FORM.work, workName: FORM.workName || '', qty: +FORM.qty, location: FORM.location, spot: FORM.spot || '', quality: FORM.quality, notes: FORM.notes || '', weight: +FORM.weight || 0 }, { gps: FORM._gps, photos: shot(['w1', 'w2', 'tape']) }); FORM = {}; go('home');
  },
  saveVisit: async () => { need(FORM._photos && FORM._photos.visit, 'Site par selfie lo'); await save('visit', { purpose: FORM.purpose, notes: FORM.notes || '' }, { gps: FORM._gps, photos: shot(['visit']) }); FORM = {}; go('home'); },
  saveRecheck: async () => { need(FORM.measuredQty !== undefined && FORM.measuredQty !== '', 'Naap likho'); await save('recheck', { target: FORM.target, measuredQty: +FORM.measuredQty, ok: FORM.ok !== 'no', notes: FORM.notes || '' }, { gps: FORM._gps, photos: shot(['rc']) }); FORM = {}; go('flags'); },
  savePay: async () => { need(FORM.payee, 'Kisko payment'); need(+FORM.amount > 0, 'Amount'); need(FORM.billNo || FORM.kind === 'advance', 'Bill no.'); await save('pay', payData(), { gps: await getGPS(), photos: shot(['bill']) }); FORM = {}; go('home'); },
  addItem: () => { FORM.items.push({ material: 'cement', qty: '', rate: '' }); render(); },
  savePaid: async () => { const p = S.byId[FORM.target]; need(p && C.payReady(S, p), 'Ye payment abhi ready nahi'); need(FORM.utr || FORM.mode === 'Cash', 'UTR / cheque no.'); need(FORM._photos && FORM._photos.receipt, 'Receipt ki photo'); await save('paid', { target: FORM.target, mode: FORM.mode, utr: FORM.utr || '' }, { gps: await getGPS(), photos: shot(['receipt']) }); FORM = {}; go('home'); },
  saveCorr: async el => { need(FORM.reason, 'Reason likho'); const fix = {}; Object.keys(FORM).filter(k => k.startsWith('fix_') && FORM[k] !== '').forEach(k => { const key = k.slice(4), old = S.byId[el.dataset.t].d[key]; fix[key] = typeof old === 'number' ? +FORM[k] : FORM[k]; }); need(FORM.cmode === 'void' || Object.keys(fix).length, 'Kya badalna hai likho'); await save('correction', { target: el.dataset.t, reason: FORM.reason, fix: FORM.cmode === 'void' ? {} : fix, void: FORM.cmode === 'void' }); FORM = {}; render(); },
  saveHead: async () => { need(FORM.counted !== undefined && FORM.counted !== '', 'Gin ke likho'); need(FORM._photos && FORM._photos.crowd, 'Photo lo'); await save('headcount', { counted: +FORM.counted, expected: C.presentNow(S, today()).length }, { gps: FORM._gps, photos: shot(['crowd']) }); FORM = { _au: 1, _gps: FORM._gps }; render(); },
  pick: async () => { const rnd = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; const P = C.pickAudit(S, rnd, today()); await save('auditPick', P, { gps: FORM._gps }); render(); },
  saveAudit: async el => {
    const pick = S.byId[el.dataset.t], P = pick.d, st = C.stock(S), res = [];
    P.workers.forEach((w, i) => res.push({ item: 'worker ' + ((S.workers[w] || {}).name || w), ok: FORM['aw' + i] === 'yes' }));
    P.materials.forEach((m, i) => { const f = +FORM['am' + i], b = st[m].closing; res.push({ item: C.MATERIALS[m].n, expected: b, found: f, ok: b ? Math.abs(f - b) / b <= 0.02 : f === 0 }); });
    (P.work || []).forEach((w, i) => { const x = S.byId[w]; if (!x) return; const f = +FORM['aq' + i], q = +x.d.qty; res.push({ item: 'work ' + w, expected: q, found: f, ok: q ? Math.abs(f - q) / q <= 0.05 : true }); });
    need(FORM._photos && FORM._photos.au1, 'Audit photo lo'); await save('audit', { pick: pick.id, results: res }, { gps: FORM._gps, photos: shot(['au1', 'au2']) }); FORM = {}; go('flags');
  },
  savePlan: async () => { need(FORM.text, 'Plan likho'); for (const line of FORM.text.split('\n').map(s => s.trim()).filter(Boolean)) await save('plan', { text: line }); FORM = {}; go('home'); },
  saveTip: async () => { need(FORM.text, 'Kya hua likho'); const keep = ME; ME = null; await save('tip', { text: FORM.text }, { photos: shot(['tip']), by: 'anon' }); ME = keep; FORM = {}; toast('Shukriya. Aapka naam save nahi hua.'); go('home'); },
  savePerson: async () => { need(FORM.name, 'Naam'); need(/^\d{4}$/.test(FORM.pin || ''), 'PIN 4 ank'); const id = DEV + '-' + (chain().length + 1); await save('person', { name: FORM.name, role: FORM.role, phone: FORM.phone || '', pinHash: await C.sha256('bsi:' + id + ':' + FORM.pin) }); FORM = { _pp: 'staff', role: 'supervisor' }; render(); },
  saveParty: async el => { need(FORM.name, 'Naam'); await save(el.dataset.t, { name: FORM.name, phone: FORM.phone || '', gst: FORM.gst || '', workOrder: +FORM.workOrder || 0, advanceLimit: +FORM.advanceLimit || 0 }); FORM = { _pp: el.dataset.t }; render(); },
  saveRate: async () => { need(FORM.material && +FORM.rate > 0, 'Maal aur rate'); await save('rate', { vendor: FORM.vendor || '*', material: FORM.material, rate: +FORM.rate }); FORM = { _pp: 'rate' }; render(); },
  saveCoi: async () => { need(FORM.person && FORM.party && FORM.relation, 'Sab bharo'); await save('coi', { person: FORM.person, party: FORM.party, relation: FORM.relation }); FORM = { _pp: 'coi' }; render(); },
  saveTipUrl: async () => { await save('correction', { target: S.site.id, reason: 'complaint form link', fix: { tipUrl: FORM.tipUrl || '' } }); toast('Engineer/owner ki approval ke baad lagega'); render(); },
  syncSave: async () => { await meta('syncUrl', $('#surl').value.trim()); await meta('syncKey', $('#skey').value.trim()); await syncNow(false); },
  export: async () => { const photos = {}; for (const e of E) for (const p of e.photos || []) photos[p.h] = await getKey('photos', p.h); download('bhuchain-integrity-' + DEV + '-' + today() + '.json', JSON.stringify({ app: 'bhuchain-integrity', v: C.VERSION, exported: new Date().toISOString(), entries: E, photos }), 'application/json'); },
  csv: () => download('bhuchain-ledger-' + today() + '.csv', toCSV(), 'text/csv'),
  import: () => $('#imp').click(),
  print: () => window.print(),
  wa: () => window.open('https://wa.me/?text=' + encodeURIComponent(FORM._text || ''), '_blank'),
  copy: async () => { try { await navigator.clipboard.writeText(FORM._text || ''); toast('Copied'); } catch (x) { toast('Copy nahi hua', true); } }
};

/* ---------- start ---------- */
(async () => {
  DB = await idb(); DEV = await meta('dev'); if (!DEV) { DEV = 'D' + Array.from(crypto.getRandomValues(new Uint8Array(3))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase(); await meta('dev', DEV); }
  await reload(); ME = sessionStorage.getItem('bsi_me'); if (ME && !S.persons[ME]) ME = null;
  const [r, a] = location.hash.replace(/^#\//, '').split('/'); ROUTE = r || 'home'; ARG = a ? decodeURIComponent(a) : null; render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  window.addEventListener('online', () => syncNow(true)); setInterval(() => syncNow(true), 5 * 60000);
  window.BSI = { C, get S() { return S; }, get E() { return E; }, get ME() { return ME; }, set ME(v) { ME = v; }, save, approve, reload, render, go, mergeEntries };
})();
