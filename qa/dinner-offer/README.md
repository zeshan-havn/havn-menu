# Older-lead dinner invitation

Frontend-only preview for invited older non-ordering leads in both cities:
`/welcome/dinner` (DC), `/sd/welcome/dinner` (SoCal). Existing weekly prefixes
and SMS suffixes resolve identically. Normal welcome and tasting routes retain
their existing gates and offers.

A qualifying invitation order with at least one actual meal promises $25 credit on a later meal order,
activated only after the first order is paid. The future credit never reduces
today's total. Sides/extras are charged normally and cannot replace the meal.
Two–four meals are allowed at normal price; five–six receive $20 off and seven+
receive $40 off in addition to the next-order credit. Orders include one of these
informational markers before the ordinary SMS body:

- `Chef J dinner offer: one meal`
- `Chef J dinner offer: regular welcome`

The browser does not establish eligibility or grant credit. Do not promote or
send these links until HQ accepts the verified invitation's one-meal orders and
implements durable, idempotent payment-triggered credit activation. Those comms
and billing changes are deliberately outside this frontend task.

Verification:

```sh
node qa/promo-routing/promo-routing.test.mjs
MENU_URL=http://127.0.0.1:4641 node qa/dinner-offer/dinner-offer-scenarios.mjs
```

Serve this directory with SPA fallback. The scenario runner mocks all external
integrations, including tracking and menu-status, and never sends an order.
Independent browser QA must also inspect both cities at narrow and desktop
widths, the review dialog, keyboard trapping and return focus. Pending menus
remain blocked. Runtime changes are limited to the dinner variant.

Comms handoff and deployment receipts are in the HQ task's
`.artifacts/older-lead-dinner-offer/` directory under
`/Users/zeshanafzal/.codex/worktrees/a9b2/HavnClub-HQ`.
