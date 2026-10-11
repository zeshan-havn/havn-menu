// Generates cities.html (the Miami/Phoenix menu page, a Havn OS city) from index.html.
// It is index.html with three changes, each asserted to apply exactly once:
//   - no havnclub.com/hybrid/tracking.js (it reports visitors as DC/SD to HQ),
//   - no havnclub.com/main-tasting/tracking.js (the DC/SD Tasting Menu tracker),
//   - /cities.js in place of /menu.js (cities.js loads menu.js once Havn OS has answered).
// Run after any edit to index.html:  node qa/cities/build-cities-page.mjs
// `--check` exits non-zero if cities.html is stale. DC/SD keep serving the untouched index.html.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const index = readFileSync(join(root, 'index.html'), 'utf8');

function once(html, find, replace) {
  if (html.split(find).length !== 2) throw new Error(`index.html must contain ${find} exactly once`);
  return html.replace(find, replace);
}
const tag = (src) => `<script src="${src}"></script>`;

let out = index;
out = once(out, tag('https://havnclub.com/hybrid/tracking.js') + '\n', '');
out = once(out, tag('https://havnclub.com/main-tasting/tracking.js') + '\n', '');
out = once(out, tag('/menu.js'), tag('/cities.js'));
for (const banned of ['hybrid/tracking.js', 'main-tasting/tracking.js', tag('/menu.js')]) {
  if (out.includes(banned)) throw new Error(`cities.html must not load ${banned}`);
}

const target = join(root, 'cities.html');
if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(target, 'utf8'); } catch { /* missing counts as stale */ }
  if (current !== out) { console.error('cities.html is stale: run node qa/cities/build-cities-page.mjs'); process.exit(1); }
  console.log('cities.html is current');
} else {
  writeFileSync(target, out);
  console.log('wrote cities.html');
}
