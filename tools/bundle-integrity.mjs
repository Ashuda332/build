// One self-contained HTML file of the Site Integrity app (no other files needed): node tools/bundle-integrity.mjs [out]
import fs from 'node:fs';
import path from 'node:path';
const dir = path.join(process.cwd(), 'integrity'), out = process.argv[2] || path.join(dir, 'dist', 'bhuchain-site-integrity.html');
const core = fs.readFileSync(path.join(dir, 'core.js'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const qr = fs.readFileSync(path.join(dir, 'vendor', 'qrcode.js'), 'utf8');
const names = [...core.matchAll(/^export (?:async )?(?:function|const|let) ([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
const coreBody = core.replace(/^export /gm, '');
const appBody = app.replace("import * as C from './core.js';", '');
if (appBody === app) throw new Error('import line not found in app.js');
const js = 'const C = (() => {\n' + coreBody + '\nreturn { ' + names.join(', ') + ' };\n})();\n' + appBody;
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const icon = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(dir, 'icon.svg')).toString('base64');
html = html.replace('<link rel="manifest" href="manifest.webmanifest">\n', '').replace('href="icon.svg"', 'href="' + icon + '"')
  .replace('<script src="vendor/qrcode.js"></script>', () => '<script>\n' + qr.replace(/<\/script/gi, '<\\/script') + '\n</script>')
  .replace('<script type="module" src="app.js"></script>', () => '<script type="module">\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>');
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
console.log('wrote ' + out + ' (' + Math.round(html.length / 1024) + ' KB, ' + names.length + ' core exports)');
