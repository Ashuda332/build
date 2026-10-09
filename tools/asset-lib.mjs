// Shared helpers for the furniture asset library (catalog read/write, hashing, licence rules).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CATALOG = path.join(ROOT, 'assets', 'catalog.json');
export const MODELS = path.join(ROOT, 'assets', 'models');
export const THUMBS = path.join(ROOT, 'assets', 'thumbs');

// Only licences that allow use in a public web app. CC-BY needs visible credit (shown in the app's library and 3D view).
export const LICENSES = {
  'CC0-1.0': { name: 'CC0 1.0 (public domain)', url: 'https://creativecommons.org/publicdomain/zero/1.0/', attribution: false },
  'CC-BY-4.0': { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/', attribution: true }
};
export const CATEGORIES = ['sofa', 'armchair', 'ottoman', 'coffee-table', 'side-table', 'tv-unit', 'bed', 'nightstand', 'wardrobe', 'dresser', 'desk', 'chair', 'dining-table', 'dining-chair', 'bookshelf', 'kitchen', 'appliance', 'bath', 'lamp', 'plant', 'decor', 'rug', 'door', 'window', 'outdoor', 'outdoor-light', 'pooja'];
export const ROOMS = ['living', 'lounge', 'dining', 'kitchen', 'master', 'bedroom', 'study', 'bath', 'pooja', 'utility', 'balcony', 'terrace', 'foyer', 'exterior', 'any'];
export const STATUS = ['review', 'active', 'disabled'];

export const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');
export function readCatalog() { return JSON.parse(fs.readFileSync(CATALOG, 'utf8')); }
export function writeCatalog(c) {
  c.assets.sort((a, b) => a.id.localeCompare(b.id));
  c.updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(CATALOG, JSON.stringify(c, null, 2) + '\n');
}
