import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..');
const url = process.env.MENU_URL || 'http://127.0.0.1:4621';
const artifacts = join(here, 'artifacts');
mkdirSync(artifacts, { recursive: true });

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
const report = { url, generatedAt: new Date().toISOString(), scenarios: [] };

const expectedNames = [
  'Green Goddess Salad', 'Ruby Goddess Salad', 'Beef Bourguignon',
  'Beef Bolognese', 'Butter Chicken', 'Basil Pesto Chicken',
  'Braised Short Rib', 'Pomegranate Salmon', 'Garlic Butter Shrimp',
  'Thai Coconut Curry Bowl', 'Strawberry Overnight Oats',
  'Mango Chia Pudding', 'Tiramisu Chia Pudding',
  'Date Ball Collection', 'Wellness Shot Collection'
];

const expectedMacros = {
  salad: '479 cal 45g protein 20g fat 10g fiber 31g carbs',
  salad_2: '513 cal 47g protein 23g fat 12g fiber 30g carbs',
  special: '630 cal 49g protein 21g fat 7g fiber 41g carbs',
  pasta: '609 cal 48g protein 27g fat 5g fiber 43g carbs',
  chicken: '707 cal 58g protein 36g fat 6g fiber 43g carbs',
  chicken_2: '608 cal 62g protein 24g fat 10g fiber 35g carbs',
  beef: '617 cal 61g protein 24g fat 8g fiber 40g carbs',
  seafood: '677 cal 49g protein 43g fat 5g fiber 24g carbs',
  seafood_2: '558 cal 53g protein 23g fat 5g fiber 36g carbs',
  veg: '683 cal 46g protein 32g fat 9g fiber 47g carbs',
  oats: '430 cal 26g protein 11g fat 17g fiber 47g carbs',
  chia: '436 cal 22g protein 26g fat 11g fiber 30g carbs',
  chia_2: '320 cal 27g protein 11g fat 10g fiber 29g carbs'
};

const imageManifest = JSON.parse(readFileSync(join(repo, 'assets', 'current', 'manifest.json'), 'utf8'));
assert.deepEqual(imageManifest.week, { start: '2026-08-16', end: '2026-08-22' });
assert.deepEqual(imageManifest.menu_source, {
  path: 'CulinaryOps/Aug 16th Menu File/finalized-menu.json',
  sha256: 'a379a77bec675ff104cf7f346da80c50b7f5193072f990f804707b5546e44e79'
});
assert.deepEqual(Object.keys(imageManifest.items).sort(), [
  'beef', 'chicken', 'chicken_2', 'pasta', 'salad', 'salad_2',
  'seafood', 'seafood_2', 'special', 'veg'
]);
for (const [key, entry] of Object.entries(imageManifest.items)) {
  const bytes = readFileSync(join(repo, entry.output));
  const actual = createHash('sha256').update(bytes).digest('hex');
  assert.equal(actual, entry.output_sha256, `${key} output digest does not match manifest`);
}

async function fresh(viewport = { width: 390, height: 844 }) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  const localFailures = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const location = msg.location();
    consoleErrors.push(`${msg.text()}${location.url ? ` @ ${location.url}` : ''}`);
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith(url)) localFailures.push(`${request.url()}: ${request.failure()?.errorText}`);
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.order && document.querySelectorAll('.item-art img').length === 10);
  return { context, page, consoleErrors, localFailures };
}

async function scenario(id, title, run) {
  const started = Date.now();
  try {
    const detail = await run();
    report.scenarios.push({ id, title, verdict: 'PASS', durationMs: Date.now() - started, detail });
    console.log(`PASS ${id} — ${title}`);
  } catch (error) {
    report.scenarios.push({ id, title, verdict: 'FAIL', durationMs: Date.now() - started, error: error.stack || String(error) });
    console.error(`FAIL ${id} — ${title}\n${error.stack || error}`);
  }
}

await scenario('MENU-01', 'inventory, current-customer copy, and photography', async () => {
  const { context, page, consoleErrors, localFailures } = await fresh();
  const names = await page.locator('.item-name, .wellness-title').allTextContents();
  assert.deepEqual(names.map((v) => v.trim()), expectedNames);

  const macros = await page.locator('.menu-item[data-key]').evaluateAll((cards) => Object.fromEntries(cards.map((card) => {
    const row = card.querySelector('.item-macros');
    const source = row.querySelector('.macros-full') || row;
    return [card.dataset.key, source.textContent.replace(/\s+/g, ' ').trim()];
  })));
  assert.deepEqual(macros, expectedMacros);

  await page.locator('.item-art img').evaluateAll((nodes) => nodes.forEach((img) => { img.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.querySelectorAll('.item-art img')].every((img) => img.complete && img.naturalWidth > 0));
  const images = await page.locator('.item-art img').evaluateAll((nodes) => nodes.map((img) => ({
    src: img.getAttribute('src'), complete: img.complete, width: img.naturalWidth, height: img.naturalHeight
  })));
  assert.equal(images.length, 10);
  images.forEach((img) => {
    assert.equal(img.complete, true, `${img.src} incomplete`);
    assert.ok(img.width > 0 && img.height > 0, `${img.src} broken`);
  });
  assert.deepEqual(images.map((img) => img.src).sort(), Object.values(imageManifest.items).map((entry) => entry.output).sort());

  const visible = await page.locator('body').innerText();
  assert.match(visible, /Aug 16\s*[–-]\s*Aug 22/);
  assert.doesNotMatch(visible, /Welcome Offer|text me future menus|opt(?:s|ed)? you in/i);
  assert.doesNotMatch(visible, /San Diego|Southern California|SoCal|Washington DC|\bDMV\b/);
  assert.match(visible, /5 handcrafted date balls/);

  const geometry = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    content: document.getElementById('content').scrollWidth
  }));
  assert.ok(geometry.document <= geometry.viewport, JSON.stringify(geometry));
  assert.ok(geometry.content <= geometry.viewport, JSON.stringify(geometry));
  assert.deepEqual(localFailures, []);
  assert.deepEqual(consoleErrors, []);
  await page.screenshot({ path: join(artifacts, 'menu-mobile-top.png') });
  await context.close();
  return { names: names.length, macroRows: Object.keys(macros).length, images: images.length, imageManifest: 'verified', geometry };
});

await scenario('MENU-02', 'native detail dialog, customization, and focus return', async () => {
  const { context, page, consoleErrors } = await fresh();
  const trigger = page.locator('[data-testid="menu-detail-trigger-salad_2"]');
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const dialog = page.locator('#detailOverlay');
  await dialog.waitFor({ state: 'visible' });
  assert.equal(await dialog.evaluate((el) => el instanceof HTMLDialogElement && el.open), true);
  await page.waitForTimeout(100);
  const focusState = await page.evaluate(() => ({
    inside: document.getElementById('detailOverlay').contains(document.activeElement),
    tag: document.activeElement?.tagName,
    id: document.activeElement?.id,
    className: document.activeElement?.className
  }));
  assert.equal(focusState.inside, true, JSON.stringify(focusState));
  assert.match(await page.locator('#detailMacros').innerText(), /513 cal · 47g protein · 23g fat · 12g fiber · 30g carbs/);

  await page.locator('.mod-pill[data-mod="low carb"]').click();
  await page.locator('#customInput').fill('dressing on the side');
  await page.locator('#detailPlus').click();
  assert.equal(await page.evaluate(() => window.order.salad_2), 1);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('detailOverlay').open);
  assert.equal(await page.evaluate(() => document.activeElement?.dataset?.testid), 'menu-detail-trigger-salad_2');
  assert.deepEqual(consoleErrors, []);
  await context.close();
  return { order: { salad_2: 1 }, dialog: 'native', focusReturned: true };
});

await scenario('MENU-03', 'four-meal order composes the real SMS intent', async () => {
  const { context, page, consoleErrors } = await fresh();
  for (const key of ['special', 'chicken', 'seafood', 'salad_2']) {
    await page.locator(`[data-testid="menu-plus-${key}"]`).click();
  }
  assert.deepEqual(await page.evaluate(() => ({
    special: window.order.special,
    chicken: window.order.chicken,
    seafood: window.order.seafood,
    salad_2: window.order.salad_2
  })), { special: 1, chicken: 1, seafood: 1, salad_2: 1 });
  assert.equal(await page.locator('[data-testid="send-order"]').evaluate((el) => el.classList.contains('active')), true);

  await page.locator('[data-testid="delivery-trigger"]').click();
  await page.locator('#deliveryOverlay .option-row', { hasText: 'Monday Morning' }).click();
  await page.waitForFunction(() => !document.getElementById('deliveryOverlay').open);
  await page.locator('[data-testid="container-trigger"]').click();
  await page.locator('#containerOverlay .option-row', { hasText: 'Reusable Glass' }).click();
  await page.waitForFunction(() => !document.getElementById('containerOverlay').open);

  const draft = await page.locator('[data-testid="order-draft"]').innerText();
  for (const line of [
    'Monday Morning (9a–12p)', 'Reusable Glass', '1x Beef Bourguignon',
    '1x Butter Chicken', '1x Pomegranate Salmon', '1x Ruby Goddess Salad'
  ]) assert.ok(draft.includes(line), `draft missing ${line}\n${draft}`);

  await page.evaluate(() => document.getElementById('sendBtn').click());
  await page.waitForFunction(() => document.getElementById('sendBtn').dataset.smsHref);
  const smsHref = await page.locator('[data-testid="send-order"]').getAttribute('data-sms-href');
  assert.match(smsHref, /^sms:\+12245370344\?body=/);
  const decoded = decodeURIComponent(smsHref.split('?body=')[1]);
  assert.equal(decoded, draft);
  assert.deepEqual(consoleErrors, []);
  await context.close();
  return { target: '+12245370344', bodyMatchesVisibleDraft: true };
});

await scenario('MENU-04', 'side and collection equivalents gate Send correctly', async () => {
  const { context, page } = await fresh();
  for (let i = 0; i < 3; i++) await page.locator('[data-testid="menu-plus-oats"]').click();
  await page.locator('#dateBallsCard .plus').click();
  assert.equal(await page.locator('[data-testid="send-order"]').evaluate((el) => el.classList.contains('active')), false);
  assert.deepEqual(await page.evaluate(() => ({ oats: window.order.oats, date_balls: window.order.date_balls })), { oats: 3, date_balls: 1 });
  await page.locator('[data-testid="menu-plus-special"]').click();
  await page.locator('[data-testid="menu-plus-chicken"]').click();
  assert.equal(await page.locator('[data-testid="send-order"]').evaluate((el) => el.classList.contains('active')), true);
  await context.close();
  return { equivalentsBefore: 2, equivalentsAfter: 4 };
});

await scenario('MENU-05', 'responsive geometry and local assets', async () => {
  const results = [];
  for (const width of [320, 768, 1440]) {
    const { context, page, consoleErrors, localFailures } = await fresh({ width, height: width < 700 ? 844 : 1000 });
    if (width === 1440) await page.screenshot({ path: join(artifacts, 'menu-1440-top.png') });
    await page.evaluate(async () => {
      await document.fonts?.ready;
      const content = document.getElementById('content');
      const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      content.scrollTop = content.scrollHeight;
      await frame();
      await frame();
      content.scrollTop = content.scrollHeight;
    });
    const geometry = await page.evaluate(() => ({
      width: innerWidth,
      root: document.documentElement.scrollWidth,
      content: document.getElementById('content').scrollWidth,
      bottom: document.getElementById('content').scrollTop + document.getElementById('content').clientHeight,
      scrollHeight: document.getElementById('content').scrollHeight
    }));
    assert.ok(geometry.root <= width, JSON.stringify(geometry));
    assert.ok(geometry.content <= width, JSON.stringify(geometry));
    assert.ok(geometry.bottom >= geometry.scrollHeight - 2, `content cannot reach bottom ${JSON.stringify(geometry)}`);
    assert.deepEqual(localFailures, []);
    assert.deepEqual(consoleErrors, []);
    if (width === 320 || width === 1440) await page.screenshot({ path: join(artifacts, `menu-${width}-bottom.png`) });
    results.push(geometry);
    await context.close();
  }
  return results;
});

await scenario('MENU-06', 'every remaining overlay uses the native top layer', async () => {
  const { context, page, consoleErrors } = await fresh();
  const cases = [
    { trigger: '#helpBtn', dialog: 'helpOverlay', returnId: 'helpBtn' },
    { trigger: '.preset-card[data-preset="basic"]', dialog: 'bundleOverlay', returnPreset: 'basic' },
    { trigger: '[data-testid="menu-detail-trigger-wellness_shots"]', dialog: 'wellnessOverlay', returnTestId: 'menu-detail-trigger-wellness_shots' }
  ];

  for (const item of cases) {
    const trigger = page.locator(item.trigger);
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await page.waitForFunction((id) => {
      const dialog = document.getElementById(id);
      return dialog instanceof HTMLDialogElement && dialog.open && dialog.contains(document.activeElement);
    }, item.dialog);
    await page.keyboard.press('Escape');
    await page.waitForFunction((id) => !document.getElementById(id).open, item.dialog);
    const returned = await page.evaluate(() => ({
      id: document.activeElement?.id,
      preset: document.activeElement?.dataset?.preset,
      testid: document.activeElement?.dataset?.testid
    }));
    if (item.returnId) assert.equal(returned.id, item.returnId);
    if (item.returnPreset) assert.equal(returned.preset, item.returnPreset);
    if (item.returnTestId) assert.equal(returned.testid, item.returnTestId);
  }

  await page.locator('[data-testid="menu-plus-special"]').click();
  await page.locator('[data-testid="send-order"]').click();
  await page.waitForFunction(() => {
    const dialog = document.getElementById('belowMinModal');
    return dialog instanceof HTMLDialogElement && dialog.open && dialog.contains(document.activeElement);
  });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('belowMinModal').open);
  assert.equal(await page.evaluate(() => document.activeElement?.dataset?.testid), 'send-order');

  assert.deepEqual(await page.locator('dialog').evaluateAll((dialogs) => dialogs.map((dialog) => dialog.id).sort()), [
    'belowMinModal', 'bundleOverlay', 'containerOverlay', 'deliveryOverlay',
    'detailOverlay', 'helpOverlay', 'wellnessOverlay'
  ]);
  assert.deepEqual(consoleErrors, []);
  await context.close();
  return { nativeDialogs: 7, escapeAndFocusReturn: true };
});

const webFiles = ['index.html', '_headers', '_redirects'];
const credentialPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:sk_live|rk_live|pat[a-zA-Z0-9_-]{10,})_[A-Za-z0-9_-]{12,}\b/,
  /(?:api[_-]?key|client[_-]?secret|bearer)\s*[:=]\s*["'][A-Za-z0-9_\-.]{24,}["']/i
];
for (const rel of webFiles) {
  const text = readFileSync(join(repo, rel), 'utf8');
  credentialPatterns.forEach((pattern) => assert.doesNotMatch(text, pattern, `credential-shaped literal in ${rel}`));
}

const indexHtml = readFileSync(join(repo, 'index.html'), 'utf8');
assert.doesNotMatch(indexHtml, /https:\/\/fonts\.(?:googleapis|gstatic)\.com/i, 'menu fonts must be first-party');
const expectedFontPaths = [
  '/assets/fonts/cormorant-latin-300-italic.woff2',
  '/assets/fonts/cormorant-latin-300-normal.woff2',
  '/assets/fonts/cormorant-latin-400-italic.woff2',
  '/assets/fonts/cormorant-latin-400-normal.woff2',
  '/assets/fonts/cormorant-latin-500-italic.woff2',
  '/assets/fonts/cormorant-latin-500-normal.woff2',
  '/assets/fonts/cormorant-latin-600-italic.woff2',
  '/assets/fonts/cormorant-latin-600-normal.woff2',
  '/assets/fonts/dm-sans-latin-variable.woff2'
];
const referencedFontPaths = [...indexHtml.matchAll(/url\(['"]?(\/assets\/fonts\/[^'"\)]+)['"]?\)/g)]
  .map((match) => match[1]);
assert.deepEqual([...new Set(referencedFontPaths)].sort(), expectedFontPaths);
for (const fontPath of expectedFontPaths) {
  const bytes = readFileSync(join(repo, fontPath.slice(1)));
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'wOF2', `${fontPath} is not a WOFF2 font`);
}

await browser.close();
report.summary = {
  pass: report.scenarios.filter((s) => s.verdict === 'PASS').length,
  fail: report.scenarios.filter((s) => s.verdict === 'FAIL').length
};
writeFileSync(join(artifacts, 'last-scenario-report.json'), JSON.stringify(report, null, 2) + '\n');

if (report.summary.fail) process.exitCode = 1;
else console.log(`PASS ${report.summary.pass}/${report.scenarios.length} member-menu scenarios`);
