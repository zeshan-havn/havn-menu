# New-customer pricing acceptance

## Product boundary

This change updates the public price display on the existing Aug 16 member-menu surface. It does not change the weekly lineup, photography, welcome offers, minimum-order rules, SMS ordering flow, or the server-side charge. The browser presents an estimate; the concierge/billing server remains authoritative.

Existing members need one quiet reassurance: when they order from the saved number associated with their membership, Havn retains their legacy pricing. The page does not expose a legacy dollar amount or attempt to decide member eligibility.

## Baseline teardown

The Aug 16 member-menu branch is the correct visual and behavioral baseline, but its pricing has five contradictions:

- the order bar says every meal is $25;
- regular-meal metadata is still $25 while new-customer regular meals are $28;
- Wellness Shots and Date Ball metadata are generated as $10 even though both collections are $25;
- preset cards, bundle sheets, and cart subtotal each repeat their own flat-price arithmetic;
- the `/in` nudge asks for seven meals even though its configured offer unlocks at five.

The pricing repair must preserve the member menu's one-cart architecture and consume one slot-aware price resolver everywhere.

## Approved display contract

| Slot family | Public new-customer price |
| --- | ---: |
| Regular meals (`special`, `chicken`, `chicken_2`, `beef`, `seafood`, `seafood_2`, `veg`, `pasta`) | $28 |
| Salads (`salad`, `salad_2`) | $25 |
| Sides (`oats`, `chia`, `chia_2`) | $10 |
| Wellness Shot Collection | $25 |
| Date Ball Collection | $25 |

## Journeys

| Journey | Screen / affordance | Authoritative outcome |
| --- | --- | --- |
| P01 | Customer scans the order bar | Sees the four approved category prices without a universal `$25/meal` claim. |
| P02 | Existing member scans the reassurance | Learns that ordering from the saved number retains legacy pricing; no client-side eligibility claim is made. |
| P03 | Customer mixes regular meals, salads, sides, and collections | Sees a subtotal derived from each selected slot's generated unit price. |
| P04 | Customer opens or edits a preset | Card and bundle-sheet totals stay identical because both use the same slot resolver. |
| P05 | Promo customer follows `/welcome`, `/ws`, `/db`, or `/in` | Existing offer rules and amounts remain intact; the discount is applied to the new slot-aware subtotal. |
| P06 | Customer reaches the order minimum | The existing four-equivalent rule remains unchanged and independent of price. |
| P07 | Customer sends the SMS | The message contains choices and notes, not a browser-authored charge; the server owns final pricing. |

## Capability catalog

- P-C01: Generate `price` metadata from one slot-aware Python resolver.
- P-C02: Resolve browser prices from generated dish metadata, failing loudly for an unknown or invalid slot.
- P-C03: Display `$28 entrées · $25 salads · $10 sides · $25 collections` on the public menu.
- P-C04: Display `$25` on both collection cards.
- P-C05: Display the approved legacy-pricing reassurance without exposing a legacy amount.
- P-C06: Price the Basic, Standard, and Signature presets at `$147`, `$225`, and `$309` before promo discounts.
- P-C07: Keep preset-card, bundle-sheet, and mixed-cart totals in agreement.
- P-C08: Keep `/welcome` at `$20 off / 5 meals` and `$40 off / 7 meals`; keep `/ws`, `/db`, and `/in` at their existing `$25` offer rules.
- P-C09: Derive `/in` nudge thresholds from `PROMO_CONFIG` so the five-meal offer never tells a customer to add up to seven.
- P-C10: Keep the minimum at four meal equivalents: each meal/salad/collection is one; every three sides is one.
- P-C11: Keep the SMS draft free of subtotal, discount, or final-charge claims.
- P-C12: Preserve Aug 16 inventory, photography, overlays, responsive behavior, and city-neutral design.

## Scripted scenarios

The deterministic browser replay lives in `qa/new-customer-pricing/pricing-scenarios.mjs`.

### PRICE-01 — generated price contract and public reassurance

1. Open the root menu at 390px.
2. Assert the exact 15-slot price map and generated `dishes[*].price` metadata.
3. Assert the order-bar category summary and both visible `$25` collection labels.
4. Assert the saved-number legacy-pricing reassurance.

### PRICE-02 — mixed-cart subtotal and server-owned SMS

1. Add one regular meal, one salad, one side, Wellness Shots, and Date Balls.
2. Assert the subtotal is `$113` (`28 + 25 + 10 + 25 + 25`).
3. Assert the order is sendable at four equivalents.
4. Assert the visible/outgoing SMS contains no dollar amount, subtotal, discount, or charge.

### PRICE-03 — preset cards and bundle sheets

1. Assert Basic, Standard, and Signature show `$147`, `$225`, and `$309`.
2. Open each preset and assert its bundle total matches its card.
3. Add one regular meal and one salad in the sheet and assert each adds `$28` and `$25` respectively.

### PRICE-04 — all stable promo variants

1. Assert `/welcome`, `/ws`, `/db`, and `/in` plus their weekly-prefixed forms remain routed to the shared page.
2. In `?welcome` mode, assert five regular meals subtotal to `$140`, discount by `$20`, and total `$120`.
3. Assert promo preset strikethroughs are computed from the new bases.
4. In `?ws` mode, assert five meals require the Wellness Shots Collection, then unlock the existing `$25` credit when it is added.
5. In `?db` mode, assert five meals require the Date Ball Collection, then unlock the existing `$25` credit when it is added.
6. In `?in` mode, assert four meals say `Add 1 more meal for $25 off`.
7. Add the fifth meal and assert the existing `$25` credit unlocks.

### PRICE-05 — minimum logic is price-independent

1. Add three sides and one Date Ball Collection; assert two equivalents and Send disabled.
2. Add two regular meals; assert four equivalents, subtotal `$111`, and Send enabled.

### PRICE-06 — responsive price disclosure

1. Replay the public summary/reassurance at 320px, 768px, and 1440px.
2. Assert no horizontal overflow, covered text, console error, or failed local request.

## Simplicity lock

Keep the existing `dishes`, `PRESETS`, `order`, promo config, and SMS flow. Do not add a second cart, pricing API, member lookup, account state, storage, framework, or backend mutation. The existing weekly generator owns per-slot numeric metadata; one browser resolver reads it for every displayed calculation.
