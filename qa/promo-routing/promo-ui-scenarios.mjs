import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const baseUrl = process.env.MENU_URL || 'http://127.0.0.1:4623';

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require('playwright'); } catch {}

  const npxRoot = join(process.env.HOME || '', '.npm', '_npx');
  if (existsSync(npxRoot)) {
    const candidates = readdirSync(npxRoot)
      .map((entry) => join(npxRoot, entry, 'node_modules', 'playwright'))
      .filter(existsSync)
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    for (const candidate of candidates) {
      try { return require(candidate); } catch {}
    }
  }
  throw new Error('Playwright is required');
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const mealIds = ['cheat', 'chicken', 'beef', 'seafood', 'pasta'];

const cases = [
  {
    path: '/sep6/in',
    mode: 'in',
    banner: /\$25 Credit · Welcome Back/i,
    extras: [],
    barTotal: '$100 after Welcome back credit',
    offerLabel: 'Welcome back credit',
    offerAmount: '–$25',
    receiptTotal: '$100'
  },
  {
    path: '/sep6/ws',
    mode: 'ws',
    banner: /\$25 Credit · Wellness Shots/i,
    extras: ['wellness_shots'],
    barTotal: '$125 after Wellness credit',
    offerLabel: 'Wellness credit',
    offerAmount: '–$25',
    receiptTotal: '$125'
  },
  {
    path: '/sep6/db',
    mode: 'db',
    banner: /\$25 Credit · Date Ball Collection/i,
    extras: ['date_balls'],
    barTotal: '$125 after Date Ball credit',
    offerLabel: 'Date Ball credit',
    offerAmount: '–$25',
    receiptTotal: '$125'
  },
  {
    path: '/sep6/welcome',
    mode: 'welcome',
    banner: /\$20 off[\s\S]*\$40 off/i,
    extras: [],
    barTotal: '$105 after Welcome offer',
    offerLabel: 'Welcome offer',
    offerAmount: '–$20',
    receiptTotal: '$105'
  },
  {
    path: '/sep6/sd/in',
    mode: 'in',
    banner: /\$25 Credit · Welcome Back/i,
    extras: [],
    barTotal: '$100 after Welcome back credit',
    offerLabel: 'Welcome back credit',
    offerAmount: '–$25',
    receiptTotal: '$100',
    city: 'SD'
  }
];

for (const testCase of cases) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(`${baseUrl}${testCase.path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.m-stepper[data-id="cheat"] .m-add');

  assert.equal(await page.evaluate(() => window.HAVN_MENU_MODE), testCase.mode);
  assert.equal(await page.evaluate(() => window.HAVN_MENU_CITY), testCase.city || 'DC');
  assert.match(await page.locator('.m-ribbon').innerText(), testCase.banner);

  for (const id of [...mealIds, ...testCase.extras]) {
    await page.locator(`.m-stepper[data-id="${id}"] .m-add`).click();
  }

  assert.equal((await page.locator('#m-bar-total').innerText()).trim(), testCase.barTotal);
  await page.locator('#m-bar-review').click();
  await page.waitForSelector('#m-sheet:not([hidden])');
  assert.equal(await page.locator('#m-r-offer-row').isVisible(), true);
  assert.equal((await page.locator('#m-r-offer-label').innerText()).trim(), testCase.offerLabel);
  assert.equal((await page.locator('#m-r-offer').innerText()).trim(), testCase.offerAmount);
  assert.equal((await page.locator('#m-r-total').innerText()).trim(), testCase.receiptTotal);
  assert.deepEqual(errors, []);
  await context.close();
  console.log(`PASS ${testCase.path} — ${testCase.barTotal}`);
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/sep6`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.m-stepper[data-id="cheat"] .m-add');
  assert.equal(await page.evaluate(() => window.HAVN_MENU_MODE), 'active');
  assert.equal(await page.locator('.m-ribbon').isVisible(), false);

  for (const id of mealIds) {
    await page.locator(`.m-stepper[data-id="${id}"] .m-add`).click();
  }

  assert.equal((await page.locator('#m-bar-total').innerText()).trim(), '$125');
  await page.locator('#m-bar-review').click();
  await page.waitForSelector('#m-sheet:not([hidden])');
  assert.equal(await page.locator('#m-r-offer-row').isVisible(), false);
  assert.equal((await page.locator('#m-r-total').innerText()).trim(), '$125');
  assert.deepEqual(errors, []);
  await context.close();
  console.log('PASS /sep6 — active menu has no promo');
}

await browser.close();
console.log(`PASS ${cases.length + 1}/${cases.length + 1} promo UI scenarios`);
