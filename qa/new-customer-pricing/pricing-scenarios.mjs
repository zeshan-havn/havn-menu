import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const url = process.env.MENU_URL || 'http://127.0.0.1:4622';

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
  throw new Error('Playwright is required. Run `npx playwright --version` once, then retry.');
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];

const expectedPrices = {
  salad: 25,
  salad_2: 25,
  special: 28,
  chicken: 28,
  chicken_2: 28,
  beef: 28,
  seafood: 28,
  seafood_2: 28,
  veg: 28,
  pasta: 28,
  oats: 10,
  chia: 10,
  chia_2: 10,
  wellness_shots: 25,
  date_balls: 25
};

async function fresh(query = '', viewport = { width: 390, height: 844 }) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  const localFailures = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith(url)) localFailures.push(`${request.url()}: ${request.failure()?.errorText}`);
  });
  await page.goto(`${url}/${query}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.order && typeof window.unitPriceForSlot === 'function');
  return { context, page, consoleErrors, localFailures };
}

async function scenario(id, title, run) {
  try {
    const detail = await run();
    results.push({ id, verdict: 'PASS', detail });
    console.log(`PASS ${id} — ${title}`);
  } catch (error) {
    results.push({ id, verdict: 'FAIL', error: error.stack || String(error) });
    console.error(`FAIL ${id} — ${title}\n${error.stack || error}`);
  }
}

async function clickPlus(page, key, times = 1) {
  const selector = key === 'wellness_shots'
    ? '#wellnessShotsCard .plus'
    : key === 'date_balls'
      ? '#dateBallsCard .plus'
      : `[data-testid="menu-plus-${key}"]`;
  for (let i = 0; i < times; i++) await page.locator(selector).click();
}

async function pricingMap(page) {
  return page.evaluate((keys) => ({
    resolver: Object.fromEntries(keys.map((key) => [key, window.unitPriceForSlot(key)])),
    metadata: Object.fromEntries(keys.map((key) => [key, dishes[key].price]))
  }), Object.keys(expectedPrices));
}

await scenario('PRICE-01', 'generated prices and public reassurance', async () => {
  const { context, page, consoleErrors, localFailures } = await fresh();
  assert.deepEqual(await pricingMap(page), { resolver: expectedPrices, metadata: expectedPrices });
  assert.equal(
    (await page.locator('[data-testid="pricing-summary"]').innerText()).replace(/\s+/g, ' ').trim(),
    '$28 entrées · $25 salads · $10 sides · $25 collections'
  );
  assert.equal(
    (await page.locator('[data-testid="legacy-pricing-note"]').innerText()).replace(/\s+/g, ' ').trim(),
    'Existing members keep legacy pricing when ordering from their saved number.'
  );
  assert.match(await page.locator('#dateBallsCard .wellness-subtitle').innerText(), /\$25/);
  assert.match(await page.locator('#wellnessShotsCard .wellness-subtitle').innerText(), /\$25/);
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(localFailures, []);
  await context.close();
  return expectedPrices;
});

await scenario('PRICE-02', 'mixed subtotal and server-owned SMS', async () => {
  const { context, page, consoleErrors } = await fresh();
  for (const key of ['special', 'salad', 'oats', 'wellness_shots', 'date_balls']) await clickPlus(page, key);
  assert.equal(await page.locator('#priceSubtotal').innerText(), '$113');
  assert.equal(await page.locator('[data-testid="send-order"]').evaluate((el) => el.classList.contains('active')), true);
  const draft = await page.locator('[data-testid="order-draft"]').innerText();
  assert.doesNotMatch(draft, /\$|subtotal|discount|charge/i);
  await page.locator('[data-testid="send-order"]').click();
  const smsHref = await page.locator('[data-testid="send-order"]').getAttribute('data-sms-href');
  assert.ok(smsHref, 'send control did not expose its SMS intent');
  assert.doesNotMatch(decodeURIComponent(smsHref), /\$|subtotal|discount|charge/i);
  assert.deepEqual(consoleErrors, []);
  await context.close();
  return { subtotal: 113, finalChargeInSms: false };
});

await scenario('PRICE-03', 'preset cards and bundle sheets share the resolver', async () => {
  const { context, page, consoleErrors } = await fresh();
  const expected = { basic: 147, standard: 225, signature: 309 };
  for (const [key, total] of Object.entries(expected)) {
    const card = page.locator(`.preset-card[data-preset="${key}"]`);
    assert.equal((await card.locator('.preset-price').innerText()).trim(), `$${total}`);
    await card.click();
    assert.equal((await page.locator('#bundleTotal').innerText()).trim(), `$${total}`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('bundleOverlay').open);
  }

  await page.locator('.preset-card[data-preset="basic"]').click();
  await page.locator('[data-bundle-add="chicken_2"]').click();
  assert.equal((await page.locator('#bundleTotal').innerText()).trim(), '$175');
  await page.locator('[data-bundle-add="salad_2"]').click();
  assert.equal((await page.locator('#bundleTotal').innerText()).trim(), '$200');
  assert.deepEqual(consoleErrors, []);
  await context.close();
  return expected;
});

await scenario('PRICE-04', 'welcome and returning-customer promos use configured tiers', async () => {
  const welcome = await fresh('?welcome');
  for (const key of ['special', 'chicken', 'chicken_2', 'beef', 'seafood']) await clickPlus(welcome.page, key);
  assert.equal(await welcome.page.locator('#priceSubtotal').innerText(), '$140');
  assert.equal(await welcome.page.locator('#priceDiscount').innerText(), '–$20');
  assert.equal(await welcome.page.locator('#priceTotal').innerText(), '$120');
  assert.deepEqual(
    await welcome.page.locator('.preset-price').allInnerTexts(),
    ['$147 $127', '$225 $185', '$309 $269']
  );
  assert.deepEqual(welcome.consoleErrors, []);
  await welcome.context.close();

  const returning = await fresh('?in');
  for (const key of ['special', 'chicken', 'chicken_2', 'beef']) await clickPlus(returning.page, key);
  assert.equal(await returning.page.locator('#priceNudge').innerText(), 'Add 1 more meal for $25 off');
  await clickPlus(returning.page, 'seafood');
  assert.equal(await returning.page.locator('#priceSubtotal').innerText(), '$140');
  assert.equal(await returning.page.locator('#priceDiscount').innerText(), '–$25');
  assert.equal(await returning.page.locator('#priceTotal').innerText(), '$115');
  assert.deepEqual(returning.consoleErrors, []);
  await returning.context.close();
  return { welcome: { subtotal: 140, discount: 20 }, returning: { threshold: 5, discount: 25 } };
});

await scenario('PRICE-05', 'minimum logic remains price-independent', async () => {
  const { context, page, consoleErrors } = await fresh();
  await clickPlus(page, 'oats', 3);
  await clickPlus(page, 'date_balls');
  assert.equal(await page.locator('[data-testid="send-order"]').evaluate((el) => el.classList.contains('active')), false);
  await clickPlus(page, 'special');
  await clickPlus(page, 'chicken');
  assert.equal(await page.locator('#priceSubtotal').innerText(), '$111');
  assert.equal(await page.locator('[data-testid="send-order"]').evaluate((el) => el.classList.contains('active')), true);
  assert.deepEqual(consoleErrors, []);
  await context.close();
  return { equivalentsBefore: 2, equivalentsAfter: 4, subtotal: 111 };
});

await scenario('PRICE-06', 'responsive price disclosure', async () => {
  const geometry = [];
  for (const width of [320, 768, 1440]) {
    const { context, page, consoleErrors, localFailures } = await fresh('', { width, height: width < 700 ? 844 : 1000 });
    await page.locator('[data-testid="legacy-pricing-note"]').scrollIntoViewIfNeeded();
    const state = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      summary: document.querySelector('[data-testid="pricing-summary"]').getBoundingClientRect(),
      note: document.querySelector('[data-testid="legacy-pricing-note"]').getBoundingClientRect()
    }));
    assert.ok(state.document <= state.viewport, JSON.stringify(state));
    assert.ok(state.summary.left >= 0 && state.summary.right <= state.viewport, JSON.stringify(state));
    assert.ok(state.note.left >= 0 && state.note.right <= state.viewport, JSON.stringify(state));
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(localFailures, []);
    geometry.push({ width, document: state.document });
    await context.close();
  }
  return geometry;
});

await browser.close();
const failed = results.filter((result) => result.verdict === 'FAIL');
if (failed.length) {
  console.error(`FAIL ${failed.length}/${results.length} pricing scenarios`);
  process.exitCode = 1;
} else {
  console.log(`PASS ${results.length}/${results.length} pricing scenarios`);
}
