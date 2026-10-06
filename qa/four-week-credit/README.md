# Inactive four-week credit menu

HQ treatment links use `/in/100/{first-delivery-Sunday}/{1-4}`, preserving optional
weekly/city prefixes and the existing SMS source suffix. For example:
`/oct11/sd/in/100/2026-10-11/1`. Normal `/in` remains the control page.

Week one explains that ordering this week claims four weekly $25 credits. The
four dates remain anchored to the first delivery Sunday. Later links show the
corresponding week and never make a fresh first-week claim promise. Earlier
weeks say "Week ended", not "used": this public page does not know customer
redemption history or account balances.

All four variants retain inactive pricing: a $25 deduction at the existing
five-meal threshold. The $100 is never deducted from one order. Claim eligibility
and weekly grants are owned by HQ; visiting this page does not grant anything.
HQ only changes the rendered link, preserving stored segment/grant inputs.

Verification: `node qa/promo-routing/promo-routing.test.mjs`, HQ offer routing and
promo-grant regressions, plus independent real-browser QA at mobile and desktop
widths in both cities, four-week variants, four/five-meal receipts, Escape/focus,
unchanged control pages and pending-menu blocking. Task evidence is in the HQ
chat's `.artifacts/inactive-credit-menu/`.
