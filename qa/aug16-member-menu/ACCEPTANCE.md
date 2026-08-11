# Aug 16 current-customer menu acceptance

## Product boundary

This is the weekly ordering surface for existing Havn members. It borrows the acquisition lander's premium art direction—forest, cream, brass, Cormorant display type, real food photography, and calm editorial rhythm—but it does not inherit prospect signup, SMS-list opt-in, or welcome-offer framing.

The existing cart, minimum-order rules, delivery/container choices, dietary notes, and real SMS order draft remain the business behavior.

## Zeshan feedback — verbatim, 2026-08-11

> 1. Get rid of the hero section. It's unnecessary.
> 2. Get rid of the presets for the rest of the menu. Use the exact same format as the menu section of the landing page.
>
> Let's look at that and then that can be the foundation. Once that's ready, open it in the internal browser. Let me take a look and then Will move on to the next change

> I'm trying to:
> 1. Scrape your version of the menu page
> 2. Rebuild it as a replica of the menu section of the landing page
> 3. Make the necessary tweaks to make it work as the menu page for post-sign-up customers

> Again there's a hero section on top. I just told you to remove all hero sections

### Foundation gate

- Every hero or editorial intro block is absent; the page begins with the functional order controls.
- Preset cards are absent.
- The ten weekly dishes read as one continuous catalog using the live landing shelf's cream surface, brass rule, white photo cards, Cormorant names, and compact calorie/protein line.
- Member-only adaptations are limited to category filters, details, quantity controls, pricing context, and the existing order draft.
- Mobile keeps two weekly dish cards per row.

## Baseline teardown

The Aug 16 production page already has correct weekly data and a mature order drafter, but the main browsing surface is mostly text-only:

- mobile cards hide descriptions and all food photography;
- desktop stretches cards nearly edge-to-edge, leaving very little hierarchy;
- the prospect/promo compatibility code is interleaved with the member page;
- overlays are hand-rolled fixed layers rather than browser top-layer dialogs;
- the order state is real, so a visual rebuild must not replace it with a mock cart.

The preserved production file is `rollback/aug16-production/index.html`.

## Journeys

| Journey | Screen / affordance | Authoritative outcome |
| --- | --- | --- |
| M01 | Member opens this week's menu | Lands directly on the landing-shelf-style weekly catalog for Aug 16–22, with no hero, preset, offer, or opt-in prompt. |
| M02 | Member browses/filter cards | All 10 meals, 3 sides, and 2 collections remain discoverable; filters never lose selected quantities. |
| M03 | Member opens a dish | A native top-layer dialog shows description, 5 macros, dietary status, modifications, note field, and quantity; focus stays in the dialog and Escape returns it to the card. |
| M04 | Member composes an order | Quantities update the real shared order object, totals, minimum state, and visible draft. |
| M05 | Member reviews/sends | Delivery, container, selected items, and notes appear in the SMS body to Havn's production number; send is gated until four meal equivalents. |
| M06 | Operator needs immediate rollback | The pre-rebuild Aug 16 page can replace the root index with one local copy command and no data migration. |
| M07 | Member opens any secondary surface | Detail, delivery, container, wellness, bundle, help, and below-minimum surfaces all use the browser top layer, retain focus, close on Escape, and return focus to their trigger. |

## Capability catalog

- M-C01: Render exact Aug 16 lineup: 10 meals, 3 sides, Wellness Shots, Date Ball Collection.
- M-C02: Match every menu name and five-value macro row to `finalized-menu.json`.
- M-C03: Resolve all 10 generated meal images from local, credential-free assets.
- M-C04: Keep city-neutral member copy; no DC, DMV, SoCal, Southern California, or San Diego labels.
- M-C05: Keep the root member page free of welcome-offer and future-menu opt-in framing.
- M-C06: Preserve category filters and quantities while filtering.
- M-C07: Preserve the four-meal-equivalent minimum: meals and each collection count as one; every three sides count as one.
- M-C08: Preserve delivery window and container choice in the composed SMS body.
- M-C09: Preserve dietary modification and free-text notes in the composed SMS body.
- M-C10: Use native `<dialog>` top-layer behavior for interactive sheets; focus enters, Escape closes, and focus returns.
- M-C11: Prevent broken images, horizontal overflow, clipped content, and covered controls at 320, 390, 768, and 1440 CSS pixels.
- M-C12: Keep the production SMS number `+1 224 537 0344`; do not add intake/lead registration to the member order send.
- M-C13: Require no build-time credentials and contain no credential-shaped literals.
- M-C14: Preserve the pre-rebuild file under `rollback/aug16-production/`.
- M-C15: Pin all ten image outputs to a checked SHA-256 manifest and document the two-file release digest required for future generated-menu runs.
- M-C16: Remove every hero/editorial intro block and every visible preset card.
- M-C17: Present the ten meal cards as one landing-shelf-style catalog, with two cards per row on mobile.

## Scripted scenarios

The deterministic browser replay lives in `qa/aug16-member-menu/menu-scenarios.mjs`.

### MENU-01 — inventory and imagery

1. Open the root page in a fresh 390px Chromium context.
2. Assert the header says `Aug 16 – Aug 22` and does not display prospect/location copy.
3. Assert 15 orderable items and the exact expected names.
4. Assert 10 meal images are complete with non-zero natural dimensions.
5. Assert every local image byte-for-byte matches its checked manifest digest.
6. Assert document width does not exceed viewport width.
7. Assert the member hero and preset cards are absent, and the unified weekly catalog contains exactly 10 dishes.

### MENU-02 — detail dialog and customization

1. Open Ruby Goddess Salad from its card.
2. Assert the open element is a native dialog and focus is inside it.
3. Add `low carb`, enter `dressing on the side`, and set quantity to one.
4. Press Escape; assert the dialog closes and focus returns to the originating card.
5. Assert authoritative order state contains `salad_2: 1`.

### MENU-03 — four-meal order composition

1. Start from a fresh page.
2. Add Beef Bourguignon, Butter Chicken, Pomegranate Salmon, and Ruby Goddess Salad.
3. Assert the order state has four meal equivalents and Send is enabled.
4. Select Monday morning and reusable glass.
5. Assert the draft contains the four exact item lines, `Monday Morning (9a–12p)`, and `Reusable Glass`.
6. Intercept the send action; assert the decoded `sms:` body equals the visible authoritative draft and targets `+12245370344`.

### MENU-04 — side-equivalent gate

1. Add three Strawberry Overnight Oats and one Date Ball Collection.
2. Assert the page computes two meal equivalents and Send remains disabled.
3. Add two meals and assert Send becomes enabled at exactly four equivalents.

### MENU-05 — responsive and credential-free

1. Replay inventory checks at 320px, 768px, and 1440px.
2. Assert no horizontal overflow, broken image, uncaught exception, or failed local asset request.
3. Scan tracked web assets for private keys, bearer tokens, and credential-shaped assignments.

### MENU-06 — complete overlay matrix

1. Open Help, Wellness Shots, and the below-minimum prompt from their real controls.
2. Assert each is a native modal dialog and focus moves inside.
3. Press Escape and assert each closes through its normal state-saving path.
4. Assert focus returns to the exact originating control and all seven overlay elements are native dialogs.

## Simplicity lock

The rebuild keeps the current DOM keys, `dishes` object, order object, dormant preset compositions, and SMS functions. It adds an editorial visual layer, local photography, stable test IDs, and native dialog behavior. It does not introduce a framework, backend, account state, localStorage, or a second cart.
