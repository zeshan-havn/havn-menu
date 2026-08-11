/* HAVN · landing page configuration —— THE ONLY FILE THAT CHANGES PER CITY.
   Everything environment-specific lives here so the flip to production is a
   value change, never a code change (INTAKE-CONTRACT.md, "one number model").

   The production destination is deliberately centralized here. Both generated
   city builds must keep the same OS endpoint and one production SMS number;
   the city travels in the registered click payload, never in a second number. */

window.HAVN_CONFIG = {

  /* ── environment ──────────────────────────────────────────────
     SMS_NUMBER: the single front door for old AND new customers.
     One number serves BOTH cities — the city is carried in the
     intake payload, not by a second number.
     This is the production number, in E.164 with no formatting. */
  SMS_NUMBER: "+12245370344",

  /* OS intake base, no trailing slash. Click registration starts before the
     SMS composer opens; inbound then claims that token on this same service.
     The desktop QR registers through this same endpoint before it is drawn. */
  OS_BASE_URL: "https://os.havnclub.com",

  /* ── which build this is ──────────────────────────────────── */
  CITY: "DC",                       /* "DC" | "SD" — goes into the payload   */
  CITY_LABEL: "DC · MD · VA",      /* what the visitor reads on the page    */
  CITY_SHORT: "DC",                 /* the coupon serial                     */
  LANDING_VARIANT: "deck-v1-dmv",    /* attribution: which page they landed on */

  /* ── the draft bodies, one per CTA intent ─────────────────────
     Zeshan's wording, verbatim.

     {token} is replaced with the minted code. Keep it in PARENTHESES:
     the OS identifies the code by the brackets around it, so
     "(Q4JMG3)" is what ties this text back to the ad click. intake.js
     appends the code defensively if a template ever loses it, so a copy
     edit can't silently cost attribution.

     The OS matches a
     parenthesised Crockford code, falls back to scanning for a bare
     6-char code if the brackets are lost in transit, still honours the
     legacy "HAVN <token>" form, and treats no-match as organic rather
     than guessing. Registry membership gates every path.
     The order template also takes {body} — the composed selections. */
  DRAFTS: {
    /* dock "Text me the menus" + offer "Text me the weekly menus" */
    menus: "Hi Chef, I'd like to start getting the weekly menus ({token})",

    /* menu page "Skip this week — text me future menus" (×4).
       Same sentence as `menus` — Zeshan confirmed that is deliberate. */
    skip: "Hi Chef, I'd like to start getting the weekly menus ({token})",

    /* in-thread "Text Havn →" — reaching a person, not signing up */
    concierge: "Hi Chef, I have a question! ({token})",

    /* the order send: their selections are {body} */
    order: "Hi Chef, Here's my order ({token}):\n\n{body}"
  },

  /* ── contract intent per CTA (INTAKE-CONTRACT v1.2) ───────────
     Posted on /intake/click. The OS defaults a MISSING intent to
     "order", so every CTA states its own explicitly — silence here
     would file menu-list signups as orders.

     `question` was added in v1.3 for the concierge CTA — someone
     tapping "Text Havn →" is asking a question, not ordering and not
     joining the menu list. */
  INTENTS: {
    menus: "menu_list",
    skip: "menu_list",
    concierge: "question",
    order: "order"
  },

  /* ── Meta pixel ───────────────────────────────────────────────
     ONE pixel for BOTH cities (contract v1.4) — deliberately NOT a
     per-city value, and build-cities.mjs asserts it stays shared.
     The pixel is what sets the _fbp cookie that /intake/click reports,
     so without it fbp is always empty. Blank this to disable loading
     entirely; nothing third-party is fetched when it is empty. */
  META_PIXEL_ID: "1512896839934759",

  /* ── the desktop path ─────────────────────────────────────────
     REPLACED the old FORM block on Zeshan's call, Aug 10. A visitor
     whose device can't open an SMS composer (in practice: desktop)
     gets a QR code instead of a form, so no phone number is ever
     collected on the web. Meta traffic is overwhelmingly mobile, so
     this is an edge path either way.
     Zeshan owns this copy. */
  QR: {
    eyebrow: "On a computer?",
    title: "Scan to text us",
    numberLabel: "(224) 537-0344",
    imgAlt: "QR code that opens a text message to Havn Club"
  }
};

