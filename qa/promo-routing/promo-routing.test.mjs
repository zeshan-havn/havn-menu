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

// Quiz signups: /welcome/quiz keeps the welcome offer and adds the quiz variant.
function resolveVariant(pathname, search = '') {
  const window = { location: { pathname, search } };
  vm.runInNewContext(pricingSource, { window, URLSearchParams });
  return { mode: window.HAVN_MENU_MODE, city: window.HAVN_MENU_CITY, variant: window.HAVN_MENU_VARIANT };
}
for (const [path, city] of [['/welcome/quiz', 'DC'], ['/oct04/welcome/quiz', 'DC'], ['/sd/welcome/quiz', 'SD'], ['/oct04/sd/welcome/quiz', 'SD']]) {
  assert.deepEqual(resolveVariant(path), { mode: 'welcome', city, variant: 'quiz' }, `${path} must open the quiz welcome`);
}
for (const path of ['/welcome', '/oct04/welcome', '/ws', '/in', '/quiz', '/ws/quiz']) {
  assert.equal(resolveVariant(path).variant, '', `${path} must not open the quiz welcome`);
}

// Every shape HQ has sent: an optional /dc city segment, and the SMS
// attribution suffix /via/sms/{campaign}/{kind}/{city} (intake/return_links.py)
// whose labels ("welcome", "sd", …) must never be read as a mode or city.
const sentShapes = [
  ['/welcome/via/sms/welcome/welcome/dc', 'welcome', 'DC', ''],
  ['/sd/welcome/via/sms/welcome/welcome/sd', 'welcome', 'SD', ''],
  ['/welcome/quiz/via/sms/welcome/welcome/dc', 'welcome', 'DC', 'quiz'],
  ['/welcome/tasting/via/sms/welcome/welcome/dc', 'welcome', 'DC', 'tasting'],
  ['/sd/welcome/tasting/via/sms/welcome/welcome/sd', 'welcome', 'SD', 'tasting'],
  ['/oct04/via/sms/abc123/menu_blast/dc', 'active', 'DC', ''],
  ['/oct04/sd/via/sms/abc123/menu_blast/sd', 'active', 'SD', ''],
  ['/oct04/ws/via/sms/abc123/reminder_1/dc', 'ws', 'DC', ''],
  ['/oct04/sd/in/via/sms/abc123/reminder_2/sd', 'in', 'SD', ''],
  ['/welcome/via/sms/sd/welcome/dc', 'welcome', 'DC', ''],
  ['/via/sms/abc123/menu_blast/sd', 'active', 'SD', ''],
  ['/welcome/dc', 'welcome', 'DC', ''],
  ['/dc/welcome', 'welcome', 'DC', ''],
  ['/oct04/dc/welcome/tasting', 'welcome', 'DC', 'tasting'],
  ['/welcome/sd', 'welcome', 'SD', ''],
  // The short source tag HQ sends from Oct 2: /sms[/{campaign}[/{kind}]].
  ['/welcome/sms', 'welcome', 'DC', ''],
  ['/sd/welcome/sms', 'welcome', 'SD', ''],
  ['/welcome/quiz/sms', 'welcome', 'DC', 'quiz'],
  ['/sd/welcome/tasting/sms', 'welcome', 'SD', 'tasting'],
  ['/oct04/sms/7f3eabcd01234/menu_blast', 'active', 'DC', ''],
  ['/oct04/sd/sms/7f3eabcd01234/menu_blast', 'active', 'SD', ''],
  ['/oct04/ws/sms/7f3eabcd01234/reminder_2', 'ws', 'DC', ''],
  ['/oct04/sd/welcome/tasting/sms/7f3eabcd01234', 'welcome', 'SD', 'tasting'],
  ['/in/sms/7f3eabcd01234/menu_blast/', 'in', 'DC', ''],
];
for (const [path, mode, city, variant] of sentShapes) {
  assert.deepEqual(resolveVariant(path), { mode, city, variant }, `${path} must resolve`);
}

console.log(`PASS ${promoModes.length * (2 + representativeWeeks.length * 2 + 2) + 3 + sentShapes.length} promo route cases`);
