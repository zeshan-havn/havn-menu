import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const pricingSource = readFileSync(new URL('../../pricing.js', import.meta.url), 'utf8');

function resolveMenuLocation(pathname, search = '') {
  const window = { location: { pathname, search } };
  vm.runInNewContext(pricingSource, { window, URLSearchParams });
  return { mode: window.HAVN_MENU_MODE, city: window.HAVN_MENU_CITY };
}

const promoModes = ['welcome', 'ws', 'in'];
const representativeWeeks = ['jan1', 'may17', 'aug02', 'sep6', 'dec31'];

for (const mode of promoModes) {
  assert.deepEqual(resolveMenuLocation(`/${mode}`), { mode, city: 'DC' });
  assert.deepEqual(resolveMenuLocation(`/sd/${mode}`), { mode, city: 'SD' });

  for (const week of representativeWeeks) {
    assert.deepEqual(
      resolveMenuLocation(`/${week}/${mode}`),
      { mode, city: 'DC' },
      `/${week}/${mode} must preserve its promo`
    );
    assert.deepEqual(
      resolveMenuLocation(`/${week}/sd/${mode}`),
      { mode, city: 'SD' },
      `/${week}/sd/${mode} must preserve its promo and city`
    );
  }
}

for (const queryMode of promoModes) {
  assert.deepEqual(resolveMenuLocation('/sep6', `?${queryMode}`), { mode: queryMode, city: 'DC' });
  assert.deepEqual(resolveMenuLocation('/sep6/sd', `?${queryMode}`), { mode: queryMode, city: 'SD' });
}

// Old Date Ball Credit links remain safe, but now resolve to Wellness Credit.
for (const path of ['/db', '/sd/db', '/sep6/db', '/sep6/sd/db']) {
  assert.equal(resolveMenuLocation(path).mode, 'ws');
}
assert.equal(resolveMenuLocation('/sep6', '?db').mode, 'ws');

assert.deepEqual(resolveMenuLocation('/sep6'), { mode: 'active', city: 'DC' });
assert.deepEqual(resolveMenuLocation('/sep6/sd'), { mode: 'active', city: 'SD' });
assert.deepEqual(resolveMenuLocation('/seasonal/in'), { mode: 'active', city: 'DC' });

console.log(`PASS ${promoModes.length * (2 + representativeWeeks.length * 2 + 2) + 3} promo route cases`);
