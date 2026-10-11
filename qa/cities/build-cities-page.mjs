// Generates cities.html from index.html: identical except cities.js is loaded just before menu.js.
// Run after any edit to index.html:  node qa/cities/build-cities-page.mjs
// `--check` exits non-zero if cities.html is stale. DC/SD keep serving the untouched index.html.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const anchor = '<script src="/menu.js"></script>';
const index = readFileSync(join(root, 'index.html'), 'utf8');
if (index.split(anchor).length !== 2) throw new Error('index.html must load /menu.js exactly once');
const out = index.replace(anchor, `<script src="/cities.js"></script>\n${anchor}`);
const target = join(root, 'cities.html');
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== out) { console.error('cities.html is stale: run build-cities-page.mjs'); process.exit(1); }
  console.log('cities.html is current');
} else {
  writeFileSync(target, out);
  console.log('wrote cities.html');
}
