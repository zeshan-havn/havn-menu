/* Miami and Phoenix menu pages (menu.havnclub.com/miami, /phoenix).

   Loaded ONLY by cities.html (the page the /miami and /phoenix routes serve),
   after pricing.js and before menu.js. DC and SD never load this file, and
   none of the files they do load are edited, so their pages are unchanged.

   What it changes, and nothing else:
     1. Orders are drafted to the Miami/Phoenix number, +1 833-565-1133, not the
        DC/SD number (menu.js reads HAVN_CONFIG.SMS_NUMBER when it loads).
     2. The order text is "Hi Chef, Here's my order:" + the same body the menu
        already composes (dishes, window, container, notes).
     3. The text ends with "(TOKEN)" from POST /api/public/order-drafts, or
        "(miami)" / "(phoenix)" if that call is unavailable.
   The same weekly menu data (menu.js) is used; nothing is copied. */
(function (root) {
  "use strict";

  var CITIES = {
    miami: { label: "Miami" },
    phoenix: { label: "Phoenix" }
  };
  var SMS_NUMBER = "+18335651133";
  var ORDER_DRAFTS_URL = "https://havn-os-next-production.up.railway.app/api/public/order-drafts";
  var GREETING = "Hi Chef, Here's my order:";
  /* order-drafts tokens are exactly 6 upper-case letters/digits (Crockford). */
  var TOKEN_RE = /^[0-9A-Z]{6}$/;
  var DRAFT_DELAY_MS = 450;
  var DRAFT_TIMEOUT_MS = 6000;
  var WINDOW_IDS = { "sunday morning": "sun_am", "sunday evening": "sun_pm", "monday morning": "mon_am" };

  var match = (root.location.pathname || "").match(
    /^\/(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\d{1,2}\/)?(miami|phoenix)(?:\/|$)/i
  );
  if (!match) return;
  var slug = match[1].toLowerCase();
  var city = CITIES[slug];

  root.HAVN_CITY_SLUG = slug;
  /* pricing.js labels every non-SD path "DC"; say which city this really is. */
  root.HAVN_MENU_CITY = city.label;
  if (root.HAVN_CONFIG) {
    root.HAVN_CONFIG.SMS_NUMBER = SMS_NUMBER;
    root.HAVN_CONFIG.CITY = city.label;
    root.HAVN_CONFIG.CITY_LABEL = city.label;
    root.HAVN_CONFIG.CITY_SHORT = city.label;
    root.HAVN_CONFIG.QR = Object.assign({}, root.HAVN_CONFIG.QR, { numberLabel: "(833) 565-1133" });
  }

  /* ── cart, read from the page the shopper sees ────────────────────────── */
  function cartLines() {
    var seen = {};
    Array.prototype.forEach.call(document.querySelectorAll(".m-stepper[data-id]"), function (st) {
      var q = st.querySelector(".m-qty");
      var n = q ? parseInt(q.textContent, 10) : 0;
      var id = st.getAttribute("data-id");
      if (n > 0 && (!seen[id] || n > seen[id])) seen[id] = n;
    });
    return Object.keys(seen).map(function (id) { return { slot: id, qty: seen[id] }; });
  }

  function selected(attr) {
    var el = document.querySelector(".m-chip.on[" + attr + "]");
    return el ? el.getAttribute(attr) : "";
  }

  function notesFrom(body) {
    var blocks = body.split("\n\n");
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].indexOf("Notes:\n") === 0) return blocks[i].slice(7);
    }
    return "";
  }

  /* ── href handling ───────────────────────────────────────────────────── */
  function hrefParts(href) {
    var at = (href || "").indexOf("?&body=");
    if (at === -1) return null;
    var body = "";
    try { body = decodeURIComponent(href.slice(at + 7)); } catch (e) { return null; }
    return { prefix: href.slice(0, at), body: body };
  }

  function build(prefix, text, tag) {
    return prefix + "?&body=" + encodeURIComponent(text + "\n\n(" + tag + ")");
  }

  var cache = { key: "", token: "" };
  var inflight = 0;
  var timer = null;
  var writing = false;
  var lastHref = ""; /* what we last wrote to the send button */

  function fetchToken(payload) {
    var ctrl = typeof root.AbortController === "function" ? new root.AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, DRAFT_TIMEOUT_MS) : null;
    return root.fetch(ORDER_DRAFTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error("order-drafts " + r.status);
      return r.json();
    }).then(function (data) {
      if (t) clearTimeout(t);
      if (!data || typeof data.token !== "string" || !TOKEN_RE.test(data.token)) {
        throw new Error("order-drafts: no token");
      }
      return data.token;
    }, function (e) { if (t) clearTimeout(t); throw e; });
  }

  function bind(send) {
    /* menu.js rewrites the href on every change. Rewrite it once more so it is
       always a complete, tagged draft: instantly with "(city)", upgraded to
       "(TOKEN)" once the draft is saved. */
    function apply() {
      if (writing) return;
      var parts = hrefParts(send.getAttribute("href"));
      if (!parts) return; /* no href: pending-menu mode or nothing selected */
      var base = parts.body;
      /* Skip only our own write, recognised by its exact value. Never by what the text ends with: a
         customer's note can end in "(anything)" and must still get the greeting and the tag. */
      if (send.getAttribute("href") === lastHref) return;
      var text = GREETING + "\n\n" + base;
      var key = text;
      if (timer) clearTimeout(timer);
      var mine = ++inflight; /* any older pending draft is now stale */
      writing = true;
      lastHref = build(parts.prefix, text, cache.key === key && cache.token ? cache.token : slug);
      send.setAttribute("href", lastHref);
      writing = false;

      if (cache.key === key && cache.token) return;
      var payload = {
        citySlug: slug,
        lines: cartLines(),
        windowId: WINDOW_IDS[selected("data-window").toLowerCase()] || "",
        container: /plastic|bpa/i.test(selected("data-container")) ? "plastic" : "glass",
        notes: notesFrom(base)
      };
      if (!payload.lines.length || !payload.windowId) return;
      timer = setTimeout(function () {
        fetchToken(payload).then(function (token) {
          if (mine !== inflight) return; /* the cart changed meanwhile */
          cache = { key: key, token: token };
          var cur = hrefParts(send.getAttribute("href"));
          if (!cur) return;
          writing = true;
          lastHref = build(cur.prefix, text, token);
          send.setAttribute("href", lastHref);
          writing = false;
        })["catch"](function () { /* keep the "(city)" fallback already in the href */ });
      }, DRAFT_DELAY_MS);
    }
    new root.MutationObserver(apply).observe(send, { attributes: true, attributeFilter: ["href"] });
    apply();
  }

  function init() {
    var send = document.getElementById("m-send");
    if (send) bind(send);
    var label = document.querySelector(".topbar-city");
    if (label) label.textContent = city.label;
    /* The skip shortcut texts the same number menu.js already read. */
  }

  /* menu.js builds #m-send's href while it loads, so attach after it ran. */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 0); });
  else setTimeout(init, 0);
})(window);
