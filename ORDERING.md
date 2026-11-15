# Public ordering and menu publication

The current catalog remains orderable until an explicit menu publication replaces it.
The partner-city Saturday 3 p.m. local kitchen lock advances the fulfillment date to
the next unlocked week; it never expires the published dishes. Havn OS returns the
catalog week and item identities separately from the delivery date. City pauses,
order caps and existing kitchen safeguards remain authoritative.

Native city pages use the live menu-status endpoint, not a captured data URL. Shared
menu code polls every 30 seconds while visible and on focus/visibility. Pending and
closed pages recover in place when availability changes. Recovering from the prior
menu preview clears its selections and restores current menu cards, totals and CTA.
A same-catalog reopen retains its selections. A changed catalog week or eligible
slot/name set blocks ordering and refreshes static assets once per published menu ID.
No selections persist across that reload. Drafts carry the displayed menu ID and
exact item IDs; Havn OS rejects stale catalog identities.

DC/SD retain their explicit operator availability controls and now recover in place
too. Date-fixed archive pages do not poll. No marketing send, ad or budget setting
is changed by this behavior. Scheduled marketing still waits for its own explicit
weekly publication. Backend source: havn-os-next, domain/published-catalog.ts;
frontend source: cities.js and menu.js outside generated weekly-data markers.
