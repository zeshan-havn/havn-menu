# Inactive four-week credit menu

HQ treatment links use `/c/{14-character-code}` on the chosen menu host. The
compact code carries the city, first delivery Sunday, offer week, campaign id
and message kind. `menu-link.js` decodes it before intake and pricing, retaining
SMS attribution without a separate long source tag. Rotation shims can prepend
`/sd`; the encoded city remains authoritative. Existing long paths such as
`/oct11/sd/in/100/2026-10-11/1` continue working. Normal `/in` remains the control.

Week one explains that ordering this week claims four weekly $25 credits. The
four dates remain anchored to the first delivery Sunday. Later links show the
corresponding week and never make a fresh first-week claim promise. Earlier
weeks say "Week ended", not "used": this public page does not know customer
redemption history or account balances.

All four variants retain inactive pricing: a $25 deduction at the existing
five-meal threshold. The $100 is never deducted from one order. Claim eligibility
and weekly grants are owned by HQ; visiting this page does not grant anything.
HQ only changes the rendered link, preserving stored segment/grant inputs.

Verification: `node qa/promo-routing/promo-routing.test.mjs`,
`node qa/four-week-credit/short-links.test.mjs`, HQ offer routing and
promo-grant regressions, plus independent real-browser QA at mobile and desktop
widths in both cities, four-week variants, four/five-meal receipts, Escape/focus,
unchanged control pages and pending-menu blocking. Task evidence is in the HQ
chat's `.artifacts/inactive-credit-menu/`.
