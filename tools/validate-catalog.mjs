// Checks assets/catalog.json against the files: run in CI on every pull request.
// Fails on: missing or changed model files, licences off the allow-list, CC-BY without attribution, bad sizes,
// unknown categories/rooms, duplicate ids or hashes, model files nobody references, thumbnails missing.
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { readCatalog, LICENSES, CATEGORIES, ROOMS, STATUS, MODELS, THUMBS, sha256 } from './asset-lib.mjs';
const cat = readCatalog(), errs = [], io = new NodeIO().registerExtensions(ALL_EXTENSIONS), seen = new Set(), hashes = new Map();
const bad = (a, m) => errs.push((a ? a.id + ': ' : '') + m);
for (const a of cat.assets) {
  if (seen.has(a.id)) bad(a, 'duplicate id'); seen.add(a.id);
  for (const k of ['name', 'category', 'file', 'license', 'author', 'sourceUrl', 'sha256', 'version', 'status']) if (a[k] == null || a[k] === '') bad(a, 'missing ' + k);
  if (!STATUS.includes(a.status)) bad(a, 'bad status ' + a.status);
  if (!LICENSES[a.license]) bad(a, 'licence not allowed: ' + a.license);
  else if (LICENSES[a.license].attribution && !a.attribution) bad(a, 'CC-BY asset without attribution text');
  if (!CATEGORIES.includes(a.category)) bad(a, 'unknown category ' + a.category);
  (a.rooms || []).forEach(r => { if (!ROOMS.includes(r)) bad(a, 'unknown room ' + r); });
  if (!Array.isArray(a.size) || a.size.length !== 3 || a.size.some(v => !(v > 0.02 && v < 6))) bad(a, 'size must be 3 numbers in metres');
  if (a.thumb && !fs.existsSync(path.join(THUMBS, a.thumb))) bad(a, 'thumbnail missing');
  if (a.status === 'active' && !a.thumb) bad(a, 'active asset without a thumbnail');
  const f = path.join(MODELS, a.file);
  if (!fs.existsSync(f)) { bad(a, 'model file missing: ' + a.file); continue; }
  const buf = fs.readFileSync(f);
  if (sha256(buf) !== a.sha256) bad(a, 'model file does not match its recorded sha256');
  if (hashes.has(a.sha256)) bad(a, 'same file as ' + hashes.get(a.sha256)); hashes.set(a.sha256, a.id);
  try {
    const doc = await io.readBinary(new Uint8Array(buf)), b = getBounds(doc.getRoot().listScenes()[0]), size = [0, 1, 2].map(k => b.max[k] - b.min[k]);
    if (size.some((v, k) => Math.abs(v - a.size[k]) > 0.01)) bad(a, 'recorded size ' + a.size.join('×') + ' m differs from the model ' + size.map(v => v.toFixed(3)).join('×'));
    if (Math.abs(b.min[1]) > 0.01 || Math.abs((b.min[0] + b.max[0]) / 2) > 0.01 || Math.abs((b.min[2] + b.max[2]) / 2) > 0.01) bad(a, 'pivot is not bottom-centre');
    if (doc.getRoot().listExtensionsUsed().some(e => e.extensionName === 'KHR_lights_punctual')) bad(a, 'model still carries lights');
  } catch (e) { bad(a, 'model does not parse: ' + e.message); }
}
const used = new Set(cat.assets.map(a => a.file));
fs.readdirSync(MODELS).filter(f => f.endsWith('.glb') && !used.has(f)).forEach(f => bad(null, 'unreferenced model file ' + f));
if (errs.length) { console.error(errs.map(e => '✗ ' + e).join('\n')); process.exit(1); }
console.log('✓ catalog ok — ' + cat.assets.length + ' assets (' + cat.assets.filter(a => a.status === 'active').length + ' active)');
