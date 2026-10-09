#!/usr/bin/env node
/* Furniture asset ingestion — the admin workflow for adding a model to assets/catalog.json.

   node tools/ingest.mjs --src <url or .glb/.gltf path> --id velvet-sofa --name "Velvet sofa" \
     --category sofa --rooms living,lounge --license CC-BY-4.0 --author "Wayfair, LLC" \
     --source-url <page the licence is stated on> [--styles luxury-modern,contemporary] [--tiers 2,3] \
     [--front +z] [--height 1.2] [--max-texture 1024] [--simplify 0.5] [--allow-duplicate]
   node tools/ingest.mjs --approve <id>      publish a reviewed asset (status review → active)
   node tools/ingest.mjs --disable <id>      take an asset out of use (kept for saved designs)

   Steps: licence check → download → glTF validation → strip lights/cameras/animations → bottom-centre pivot,
   metres, front +Z → 1K WebP textures → measure size/triangles → hash + duplicate check → save as status "review".
   Nothing is shown in the app until it is approved. Run tools/validate-catalog.mjs (CI does) after any change. */
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, center, textureCompress, weld, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { LICENSES, CATEGORIES, ROOMS, MODELS, readCatalog, writeCatalog, sha256 } from './asset-lib.mjs';

const args = {}; const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) { const k = argv[i].slice(2), v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; args[k] = v; } }
const die = m => { console.error('✗ ' + m); process.exit(1); };
const cat = readCatalog();

if (args.approve || args.disable) {
  const id = args.approve || args.disable, a = cat.assets.find(x => x.id === id); if (!a) die('no asset ' + id);
  if (args.approve && !fs.existsSync(path.join(MODELS, a.file))) die('model file missing for ' + id);
  a.status = args.approve ? 'active' : 'disabled'; writeCatalog(cat); console.log('✓ ' + id + ' → ' + a.status); process.exit(0);
}

for (const k of ['src', 'id', 'name', 'category', 'rooms', 'license', 'author', 'source-url']) if (!args[k]) die('missing --' + k);
if (!/^[a-z0-9-]+$/.test(args.id)) die('--id must be lower-case words joined by dashes');
if (!LICENSES[args.license]) die('licence ' + args.license + ' is not on the allow-list: ' + Object.keys(LICENSES).join(', '));
if (!CATEGORIES.includes(args.category)) die('unknown category; use one of ' + CATEGORIES.join(', '));
const rooms = String(args.rooms).split(','); rooms.forEach(r => { if (!ROOMS.includes(r)) die('unknown room ' + r); });
const prev = cat.assets.find(x => x.id === args.id);

// 1. fetch the source
let srcBuf;
if (/^https?:\/\//.test(args.src)) { const r = await fetch(args.src); if (!r.ok) die('download failed: ' + r.status + ' ' + args.src); srcBuf = Buffer.from(await r.arrayBuffer()); }
else srcBuf = fs.readFileSync(args.src);
const srcHash = sha256(srcBuf);
const dupSrc = cat.assets.find(a => a.sourceSha256 === srcHash && a.id !== args.id);
if (dupSrc && !args['allow-duplicate']) die('same source file already in the library as ' + dupSrc.id);

// 2. parse and validate (throws on a broken file)
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
let doc; try { doc = await io.readBinary(new Uint8Array(srcBuf)); } catch (e) { die('not a valid GLB: ' + e.message); }
const root = doc.getRoot();
if (!root.listMeshes().length) die('model has no meshes');

// 3. normalise: no lights, cameras or animations
root.listExtensionsUsed().filter(e => e.extensionName === 'KHR_lights_punctual').forEach(e => e.dispose());
root.listCameras().forEach(c => c.dispose()); root.listAnimations().forEach(a => a.dispose());
// front of the piece faces +Z; rotate if the source faces another way
const turn = { '+z': 0, '-z': Math.PI, '+x': -Math.PI / 2, '-x': Math.PI / 2 }[args.front || '+z']; if (turn == null) die('--front must be +z, -z, +x or -x');
if (turn) { const s = root.listScenes()[0], q = [0, Math.sin(turn / 2), 0, Math.cos(turn / 2)]; s.listChildren().forEach(n => { const w = doc.createNode('front').setRotation(q); s.removeChild(n); w.addChild(n); s.addChild(w); }); }
// models authored in other units: scale uniformly so the model stands at the given real height (metres)
if (args.height) { const s0 = root.listScenes()[0], b0 = getBounds(s0), k = +args.height / (b0.max[1] - b0.min[1]); if (!(k > 0) || !isFinite(k)) die('cannot scale to --height'); s0.listChildren().forEach(n => { const w = doc.createNode('scale').setScale([k, k, k]); s0.removeChild(n); w.addChild(n); s0.addChild(w); }); }
const tex = +(args['max-texture'] || 1024);
// keep every vertex attribute: material variants can use a second UV set that prune cannot see
const steps = [weld(), dedup(), prune({ keepAttributes: true }), center({ pivot: 'below' }), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [tex, tex] })];
// optional: fewer triangles for heavy scans (ratio of triangles kept, error kept under 0.1 % of the size)
if (args.simplify) { await MeshoptSimplifier.ready; steps.splice(1, 0, simplify({ simplifier: MeshoptSimplifier, ratio: +args.simplify, error: 0.001 })); }
await doc.transform(...steps);

// 4. measure
const b = getBounds(root.listScenes()[0]), size = [0, 1, 2].map(k => +(b.max[k] - b.min[k]).toFixed(3));
if (size.some(v => !(v > 0.02 && v < 6))) die('size ' + size.join(' × ') + ' m looks wrong (expect metres, 2 cm – 6 m per side)');
let tris = 0; root.listMeshes().forEach(m => m.listPrimitives().forEach(p => { const ix = p.getIndices(); tris += (ix ? ix.getCount() : p.getAttribute('POSITION').getCount()) / 3; }));
const vx = root.listExtensionsUsed().find(e => e.extensionName === 'KHR_materials_variants'), variants = vx ? vx.listVariants().map(v => v.getName()) : [];
const out = await io.writeBinary(doc), outHash = sha256(out);
const dupOut = cat.assets.find(a => a.sha256 === outHash && a.id !== args.id); if (dupOut && !args['allow-duplicate']) die('identical model already in the library as ' + dupOut.id);
const near = cat.assets.find(a => a.id !== args.id && a.category === args.category && a.size.every((v, k) => Math.abs(v - size[k]) < 0.01));
if (near && !args['allow-duplicate']) die('looks like a duplicate of ' + near.id + ' (same category and size); pass --allow-duplicate if it is not');

// 5. store as a new version, waiting for review
const version = prev ? prev.version + 1 : 1, file = args.id + (version > 1 ? '.v' + version : '') + '.glb';
fs.writeFileSync(path.join(MODELS, file), out);
const entry = {
  id: args.id, version, status: 'review', name: args.name, category: args.category, rooms,
  styles: args.styles ? String(args.styles).split(',') : [], tiers: args.tiers ? String(args.tiers).split(',').map(Number) : [0, 1, 2, 3],
  file, thumb: prev ? prev.thumb : null, size, front: '+z', pivot: 'bottom-centre', units: 'm',
  triangles: Math.round(tris), bytes: out.length, perf: out.length > 1.5e6 || tris > 50000 ? 'heavy' : tris > 15000 ? 'medium' : 'light',
  variants, license: args.license, author: args.author, sourceUrl: args['source-url'], downloadUrl: /^https?:/.test(args.src) ? args.src : null,
  attribution: LICENSES[args.license].attribution ? `"${args.name}" by ${args.author}, ${LICENSES[args.license].name} — ${args['source-url']}` : null,
  sha256: outHash, sourceSha256: srcHash, imported: new Date().toISOString().slice(0, 10)
};
if (prev) Object.assign(prev, entry); else cat.assets.push(entry);
writeCatalog(cat);
console.log(`✓ ${args.id} v${version}: ${size.join(' × ')} m, ${Math.round(tris)} triangles, ${(out.length / 1024).toFixed(0)} KB, variants: ${variants.join(', ') || 'none'} — status review (approve with --approve ${args.id})`);
