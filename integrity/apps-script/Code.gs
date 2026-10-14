/**
 * BhuChain Site Integrity — Google Sheets + Drive backend (free, Google Apps Script).
 * One Google Sheet per site. The app POSTs its entries here; every phone pulls the others' entries back.
 *
 * Setup (owner, once): see docs/GOOGLE-SETUP.md
 *  1. Create a Google Sheet "BhuChain <site> Ledger". Extensions → Apps Script → paste this file.
 *  2. Project Settings → Script properties: SITE_KEY = a long random secret (share only with staff phones),
 *     DRIVE_FOLDER_ID = id of the Drive folder "BhuChain/<site>".
 *  3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone. Copy the /exec URL into the app (Sync).
 *  4. Protect the "Ledger" sheet: Data → Protect sheets → only you can edit. The script (running as you) appends rows.
 *
 * Rules kept here too: rows are only appended, never updated; an entry whose hash does not match is refused;
 * photos go to Drive as <Site>/<YYYY-MM-DD>/<category>/<entryId>_<kind>.jpg.
 */
const HEAD = ['id', 'device', 'seq', 'type', 'at_utc', 'date_ist', 'time_ist', 'by', 'lat', 'lng', 'gps_acc', 'photos', 'data_json', 'prev', 'hash', 'received_at'];
const CAT = { att: 'attendance', matIn: 'material-in', matOut: 'material-out', stockCount: 'stock', work: 'progress', visit: 'visits', recheck: 'progress', pay: 'payments', paid: 'payments', worker: 'workers', audit: 'audits', headcount: 'audits', tip: 'complaints' };

function props_() { return PropertiesService.getScriptProperties(); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sheet_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); if (name === 'Ledger') sh.getRange('F:G').setNumberFormat('@'); }  // IST date and time kept as text so formulas can match them
  return sh;
}
function canon_(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
  if (Array.isArray(v)) return '[' + v.map(canon_).join(',') + ']';
  return '{' + Object.keys(v).filter(function (k) { return v[k] !== undefined; }).sort().map(function (k) { return JSON.stringify(k) + ':' + canon_(v[k]); }).join(',') + '}';
}
function sha256_(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8).map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, '0'); }).join(''); }
function hashBody_(e) {
  return canon_({ id: e.id, dev: e.dev, seq: e.seq, type: e.type, at: e.at, by: e.by, gps: e.gps || null, d: e.d, prev: e.prev,
    photos: (e.photos || []).map(function (p) { return { h: p.h, kind: p.kind, ts: p.ts, ah: p.ah, old: !!p.old }; }) });
}
function ist_(iso) { return Utilities.formatDate(new Date(iso), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm'); }
function folder_(path) {
  let f = DriveApp.getFolderById(props_().getProperty('DRIVE_FOLDER_ID'));
  path.forEach(function (name) { const it = f.getFoldersByName(name); f = it.hasNext() ? it.next() : f.createFolder(name); });
  return f;
}

function doPost(ev) {
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const body = JSON.parse(ev.postData.contents);
    if (!body.key || body.key !== props_().getProperty('SITE_KEY')) return out_({ ok: false, error: 'wrong site key' });
    const sh = sheet_('Ledger', HEAD), have = {}, last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, 1).getValues().forEach(function (r) { have[r[0]] = 1; });
    const saved = [], refused = [], rows = [];
    (body.entries || []).forEach(function (e) {
      if (have[e.id]) { saved.push(e.id); return; }                 // already here: append-only, never overwrite
      if (sha256_(hashBody_(e)) !== e.hash) { refused.push(e.id); return; }
      const when = ist_(e.at).split(' ');
      (e.photos || []).forEach(function (p) {
        const data = body.photos && body.photos[p.h]; if (!data) return;
        const blob = Utilities.newBlob(Utilities.base64Decode(data.split(',')[1]), 'image/jpeg', e.id + '_' + p.kind + '.jpg');
        p.url = folder_([when[0], CAT[e.type] || 'other']).createFile(blob).getUrl();
      });
      rows.push([e.id, e.dev, e.seq, e.type, e.at, when[0], when[1], e.by, e.gps ? e.gps.lat : '', e.gps ? e.gps.lng : '', e.gps ? e.gps.acc : '',
        (e.photos || []).map(function (p) { return p.kind + ' ' + (p.url || p.h); }).join('\n'), JSON.stringify(e), e.prev, e.hash, new Date()]);
      saved.push(e.id);
    });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEAD.length).setValues(rows);
    return out_({ ok: true, saved: saved, refused: refused });
  } catch (err) { return out_({ ok: false, error: String(err) }); } finally { lock.releaseLock(); }
}

// every phone pulls the entries made on the other phones
function doGet(ev) {
  if (ev.parameter.key !== props_().getProperty('SITE_KEY')) return out_({ ok: false, error: 'wrong site key' });
  const sh = sheet_('Ledger', HEAD), last = sh.getLastRow(), since = ev.parameter.since ? new Date(ev.parameter.since) : null, out = [];
  if (last > 1) sh.getRange(2, 1, last - 1, HEAD.length).getValues().forEach(function (r) { if (!since || new Date(r[15]) > since) { try { out.push(JSON.parse(r[12])); } catch (e) {} } });
  return out_({ ok: true, now: new Date().toISOString(), entries: out });
}

/** Daily 8 pm trigger (Triggers → Add → dailyAnchor, time-driven, day timer 8–9 pm):
 *  writes the day's Merkle root to the "Anchors" sheet — the hash that goes on the BhuChain blockchain. */
function dailyAnchor() {
  const sh = sheet_('Ledger', HEAD), last = sh.getLastRow(); if (last < 2) return;
  const today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  let level = sh.getRange(2, 1, last - 1, HEAD.length).getValues().filter(function (r) { return r[5] === today || Utilities.formatDate(new Date(r[5]), 'Asia/Kolkata', 'yyyy-MM-dd') === today; }).map(function (r) { return r[14]; }).sort();
  if (!level.length) return; const n = level.length;
  while (level.length > 1) { const next = []; for (let i = 0; i < level.length; i += 2) next.push(sha256_(level[i] + (level[i + 1] || level[i]))); level = next; }
  sheet_('Anchors', ['date', 'entries', 'merkle_root', 'made_at', 'chain_tx']).appendRow([today, n, level[0], new Date(), '']);
}
