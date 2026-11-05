// Generates cities.html (the Miami/Phoenix/Chicago Havn OS menu page) from index.html.
// It is index.html with these changes, each asserted to apply exactly once:
//   - static Open Graph metadata for SMS link previews (crawlers do not run cities.js),
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
// All city/menu/welcome routes rewrite to cities.html. Keep this generic so one
// city cannot inherit another city's deadline or welcome offer in a cached card.
// Use the same public preview image as the DC/SoCal campaign links.
const preview = [
  '<meta property="og:title" content="Havn Club - Weekly Menu">',
  `<meta property="og:description" content="Explore this week's chef-made Havn menu and choose your meals.">`,
  '<meta property="og:image" content="https://menu.havnclub.com/menu-preview.jpg">',
  '<meta property="og:type" content="website">',
  '<meta property="og:site_name" content="Havn Club">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:title" content="Havn Club - Weekly Menu">',
  '<meta name="twitter:image" content="https://menu.havnclub.com/menu-preview.jpg">',
].join('\n');
out = once(out, '</title>', '</title>\n' + preview);
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
