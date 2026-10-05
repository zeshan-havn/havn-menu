import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch {
  for (const folder of readdirSync(join(process.env.HOME, '.npm/_npx'))) {
    const path = join(process.env.HOME, '.npm/_npx', folder, 'node_modules/playwright');
    if (existsSync(path)) { playwright = require(path); break; }
  }
}
assert(playwright, 'Playwright required');
const base = process.env.MENU_URL || 'http://127.0.0.1:4641';
const browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
let checked = 0;
async function context(viewport = { width: 390, height: 844 }) {
  const context = await browser.newContext({ viewport });
  // No production tracking, token registration, signups, texts or credits.
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === new URL(base).origin) return route.continue();
    if (url.pathname.endsWith('/menu-status')) return route.fulfill({ contentType: 'application/json', body: '{"ordering":"open"}' });
    return route.fulfill({ contentType: 'application/javascript', body: '' });
  });
  return context;
}
try {
  for (const prefix of ['', '/sd']) {
    const ctx = await context(); const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + prefix + '/welcome/dinner');
    await page.waitForSelector('body:not(.m-menu-checking)');
    assert.equal(await page.evaluate(() => window.HAVN_MENU_CITY), prefix ? 'SD' : 'DC');
    assert.equal(await page.evaluate(() => window.HAVN_MENU_VARIANT), 'dinner');
    assert.match(await page.locator('.dinner-promise').innerText(), /after this dinner is paid/);
    assert.match(await page.locator('#m-howto-cutoff').innerText(), prefix ? /Friday at 8pm Pacific/ : /Friday at 8pm Eastern/);
    assert.equal(await page.locator('.dinner-choose').getAttribute('href'), '#m-menu');
    // Every whole-meal slot can be the single dinner; sides/extras are not substitutes.
    const meals = await page.locator('.m-stepper').evaluateAll(nodes => nodes.filter(node => !node.closest('.m-sec-side, .m-sec-collection')).map(node => node.dataset.id));
    const wholeMealIds = meals.filter(id => !['oats','chia','chia_2','broth','broth_2','wellness_shots','date_balls'].includes(id));
    assert(wholeMealIds.length >= 8);
    for (const id of wholeMealIds) {
      const card = page.locator(`.m-stepper[data-id="${id}"]`);
      await card.locator('.m-add').click();
      await page.locator('#m-bar-review').click();
      assert.equal(await page.locator('#m-r-total').innerText(), '$25');
      assert.equal(await page.locator('#m-r-offer-row').isVisible(), false);
      assert.equal(await page.locator('#m-r-deliv').innerText(), 'Free');
      assert.equal(await page.locator('#m-send').evaluate(el => el.classList.contains('m-send-off')), false);
      assert.match(decodeURIComponent(await page.locator('#m-send').getAttribute('href')), /Chef J dinner offer: one meal/);
      assert.match(await page.locator('#dinner-credit').innerText(), /activates after this dinner is paid/);
      await page.locator('#m-sheet-close').click();
      await page.waitForSelector('#m-sheet[hidden]', { state: 'attached' });
      await card.locator('.m-dec').click(); checked++;
    }
    const card = page.locator('.m-stepper[data-id="cheat"]');
    await card.locator('.m-add').click();
    await page.locator('#m-bar-review').click();
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'm-sheet-close');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('#m-sheet').evaluate(el => el.contains(document.activeElement)), true);
    await page.keyboard.press('Escape');
    await page.waitForSelector('#m-sheet[hidden]', { state: 'attached' });
    assert.equal(await page.evaluate(() => document.activeElement.id), 'm-bar-review');
    // Upgrades show today's welcome discount, never subtract the future credit.
    for (let quantity = 2; quantity <= 7; quantity++) {
      await card.locator('.m-inc').click();
      await page.locator('#m-bar-review').click();
      const discount = quantity >= 7 ? 40 : quantity >= 5 ? 20 : 0;
      assert.equal(await page.locator('#m-r-total').innerText(), '$' + (quantity * 25 - discount));
      assert.equal(await page.locator('#m-r-offer-row').isVisible(), discount > 0);
      assert.equal(await page.locator('#m-send').evaluate(el => el.classList.contains('m-send-off')), false);
      assert.match(decodeURIComponent(await page.locator('#m-send').getAttribute('href')), /Chef J dinner offer: regular welcome/);
      assert.doesNotMatch(await page.locator('#dinner-credit').innerText(), /activates after/);
      await page.locator('#m-sheet-close').click();
      await page.waitForSelector('#m-sheet[hidden]', { state: 'attached' }); checked++;
    }
    for (let i = 0; i < 6; i++) await card.locator('.m-dec').click();
    await page.locator('#m-bar-review').click();
    assert.equal(await page.locator('#m-r-total').innerText(), '$25');
    assert.match(await page.locator('#dinner-credit').innerText(), /activates after/);
    await page.locator('#m-sheet-close').click(); await page.waitForSelector('#m-sheet[hidden]', { state: 'attached' });
    await card.locator('.m-dec').click();
    await page.locator('.m-stepper[data-id="chia_2"] .m-add').click();
    await page.locator('#m-bar-review').click();
    assert.equal(await page.locator('#m-send').evaluate(el => el.classList.contains('m-send-off')), true);
    assert.deepEqual(errors, []); checked += 3;
    await ctx.close();
  }
  // Special invitation must not lower the regular welcome minimum or change tasting.
  for (const path of ['/welcome','/sd/welcome/quiz','/welcome/tasting']) {
    const ctx = await context(); const page = await ctx.newPage(); await page.goto(base + path);
    await page.waitForSelector('body:not(.m-menu-checking)');
    assert.equal(await page.locator('.dinner-intro').count(), 0);
    await page.locator('.m-stepper[data-id="cheat"] .m-add').click();
    await page.locator('#m-bar-review').click();
    assert.equal(await page.locator('#m-send').evaluate(el => el.classList.contains('m-send-off')), true);
    await ctx.close(); checked++;
  }
  const ctx = await context(); const page = await ctx.newPage();
  await page.goto(base + '/sd/welcome/dinner?pending=1');
  await page.locator('#m-pend-ok').click();
  await page.locator('.m-stepper[data-id="cheat"] .m-add').click(); await page.locator('#m-bar-review').click();
  assert.equal(await page.locator('#m-send').getAttribute('href'), null);
  assert.match(await page.locator('#m-send').innerText(), /Ordering opens/); checked++;
  await ctx.close();
  console.log('PASS ' + checked + ' dinner-offer browser scenarios; all production integrations mocked.');
} finally { await browser.close(); }
