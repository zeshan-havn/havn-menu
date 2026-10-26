/* Miami, Phoenix and Boston menu pages (menu.havnclub.com/miami, /phoenix and their
   /welcome/quiz and /welcome/sms pages). These cities run on Havn OS.

   Loaded ONLY by cities.html, which qa/cities/build-cities-page.mjs generates
   from index.html with three changes: no havnclub.com/hybrid/tracking.js, no
   main-tasting/tracking.js (both report visitors as DC/SD), and this file in
   place of menu.js. DC and SD never load this file, and none of the files they
   do load are edited, so their pages are unchanged.

   Before anything reads them, this file:
     - points texts at the Havn OS number, +1 833-565-1133, and HAVN_CONFIG at
       Havn OS (no HQ retention API);
     - switches off HQ retention tokens: intake.js reads a /…/sms path as a
       "_dc" SMS campaign, which would make menu.js mint and register an HQ
       token. Here the campaign names the city and no token is minted.
   Then it asks Havn OS for the city (welcome offer, cutoff) and its menu status
   (open or not), and only then loads menu.js, so the page opens in the right
   mode. That wait is capped at OS_WAIT_MS; the DC page waits on its own menu
   status in the same way.

   After menu.js has drawn the page, the order text becomes
     "Hi Chef, Here's my order:" (or "Hi Chef, Here's my first week:" on the
     welcome pages) + the body menu.js composed + "(TOKEN)",
   where TOKEN comes from POST /api/public/order-drafts (or "(miami)" /
   "(phoenix)" if that is unavailable). The draft carries the cart, the window,
   the container, the notes and the visit's attribution. menu_view and
   composer_opened go to POST /api/public/events. */
(function (root) {
  "use strict";

  var OS_BASE = "https://havn-os-next-production.up.railway.app";
  var SMS_NUMBER = "+18335651133";
  var SMS_LABEL = "(833) 565-1133";
  var CITIES = {
    miami: { label: "Miami" },
    phoenix: { label: "Phoenix" },
    boston: { label: "Boston" }
  };
  /* Partner welcome amounts come from Havn OS; the menu supports 5/7 meal tiers. */
  var GREETING = "Hi Chef, Here's my order:";
  var WELCOME_GREETING = "Hi Chef, Here's my first week:";
  /* Havn OS draft tokens: 6 characters from ABCDEFGHJKMNPQRSTUVWXYZ23456789. */
  var TOKEN_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;
  var OS_WAIT_MS = 3000;
  var DRAFT_DELAY_MS = 450;
  var DRAFT_TIMEOUT_MS = 6000;
  var WINDOW_IDS = { "sunday morning": "sun_am", "sunday evening": "sun_pm", "monday morning": "mon_am" };
  var TAG_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid",
    "meta_campaign_id", "meta_adset_id", "meta_ad_id", "meta_creative_id", "placement"];
  var DAYS = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };

  var path = root.location.pathname || "/";
  var match = path.match(
    /^\/(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\d{1,2}\/)?(miami|phoenix|boston)((?:\/[^/]*)*)$/i
  );
  if (!match) return;
  var slug = match[1].toLowerCase();
  var city = CITIES[slug];
  var rest = match[2].split("/").filter(Boolean).map(function (p) { return p.toLowerCase(); });
  /* /:slug/welcome/quiz (quiz signups), /:slug/welcome/sms[/…] and /:slug/welcome
     are the first-order pages; everything else is the regular menu. */
  var welcome = rest[0] === "welcome";
  var variant = welcome && rest[1] === "quiz" ? "quiz" : "";
  var smsSource = /\/sms(?:\/[a-z0-9_]+){0,2}\/?$/i.test(path);
  var test = false;
  try { test = new URLSearchParams(root.location.search || "").get("havn_test") === "1"; } catch (e) { /* ignore */ }

  /* ── 1. config, before menu.js reads it ─────────────────────────────── */
  root.HAVN_CITY_SLUG = slug;
  root.HAVN_MENU_CITY = slug;
  var cfg = root.HAVN_CONFIG || (root.HAVN_CONFIG = {});
  cfg.SMS_NUMBER = SMS_NUMBER;
  cfg.OS_BASE_URL = OS_BASE;
  cfg.RETENTION_API_BASE_URL = "";
  cfg.CITY = city.label;
  cfg.CITY_LABEL = city.label;
  cfg.CITY_SHORT = city.label;
  cfg.EXCLUDED_MENU_ITEM_IDS = slug === "miami" || slug === "phoenix" ? ["wellness_shots"] : [];
  cfg.LANDING_VARIANT = "os-" + slug;
  cfg.QR = Object.assign({}, cfg.QR, { numberLabel: SMS_LABEL });
  /* menu.js fetches this once; it is replaced with Havn OS's answer below. */
  cfg.MENU_STATUS_URL = statusUrl(true);

  /* ── 2. no HQ retention token ───────────────────────────────────────── */
  var intake = root.HAVN_INTAKE;
  if (intake) {
    root.HAVN_INTAKE = Object.assign({}, intake, {
      attribution: function () {
        var a = Object.assign({}, intake.attribution());
        /* menu.js mints an HQ token only for a "…_dc" / "…_sd" campaign: name the city instead. */
        var own = attribution().utm_campaign;
        if (own) a.utm_campaign = own;
        else if (a.utm_campaign) a.utm_campaign = String(a.utm_campaign).replace(/_(dc|sd)$/i, "_" + slug);
        return a;
      },
      mintToken: function () { return ""; },
      registerClick: function () { return Promise.reject(new Error("no HQ click registration on Havn OS city pages")); }
    });
  }

  /* ── visitor ids and attribution, shared with the havnclub.com quiz ─── */
  function cookie(name) {
    try {
      var m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
      return m ? decodeURIComponent(m.pop()) : "";
    } catch (e) { return ""; }
  }
  function setCookie(name, value, maxAge) {
    try {
      document.cookie = name + "=" + encodeURIComponent(value) + "; path=/; max-age=" + maxAge + "; SameSite=Lax" +
        (root.location.protocol === "https:" ? "; Secure" : "") +
        (/(^|\.)havnclub\.com$/.test(root.location.hostname) ? "; Domain=havnclub.com" : "");
    } catch (e) { /* ignore */ }
  }
  function randomId(prefix) {
    var s = "";
    try {
      var b = new Uint8Array(22);
      root.crypto.getRandomValues(b);
      for (var i = 0; i < b.length; i++) s += (b[i] % 36).toString(36);
    } catch (e) {
      while (s.length < 22) s += Math.random().toString(36).slice(2);
    }
    return prefix + s.slice(0, 22);
  }
  var ID_RE = /^[A-Za-z0-9_.:-]{6,80}$/;
  function visitorId() {
    var v = cookie("havn_os_vid");
    if (!ID_RE.test(v)) v = randomId("v_");
    setCookie("havn_os_vid", v, 60 * 60 * 24 * 365);
    return v;
  }
  function sessionId() {
    var s = cookie("havn_os_sid");
    if (!ID_RE.test(s)) s = randomId("s_");
    setCookie("havn_os_sid", s, 60 * 30);
    return s;
  }
  function landingPath() { return (path + (root.location.search || "")).slice(0, 500); }

  /* {first, last} from the havn_ft / havn_lt cookies plus this visit's tags. */
  function touch(name) {
    try {
      var v = JSON.parse(cookie(name) || "null");
      if (!v || typeof v !== "object" || Array.isArray(v)) return null;
      var out = {}, n = 0;
      Object.keys(v).forEach(function (k) {
        if (n < 40 && k.length <= 60 && typeof v[k] === "string") { out[k] = v[k].slice(0, 500); n++; }
      });
      return n ? out : null;
    } catch (e) { return null; }
  }
  function attribution() {
    var out = {};
    var first = touch("havn_ft"), last = touch("havn_lt");
    if (first) out.first = first;
    if (last) out.last = last;
    var q;
    try { q = new URLSearchParams(root.location.search || ""); } catch (e) { q = null; }
    TAG_KEYS.forEach(function (k) {
      var v = q && q.get(k);
      if (v) out[k] = v.slice(0, 500);
    });
    /* An HQ-style /sms link (query strings can be dropped by carriers). */
    if (smsSource && !out.utm_campaign) {
      out.utm_source = "sms";
      out.utm_medium = "text";
      out.utm_campaign = "sms_" + (rest[0] || "active") + "_" + slug;
    }
    var fbp = cookie("_fbp"), fbc = cookie("_fbc");
    if (fbp) out.fbp = fbp;
    if (fbc) out.fbc = fbc;
    return out;
  }

  function beacon(name) {
    if (test) return;
    try {
      root.fetch(OS_BASE + "/api/public/events", {
        method: "POST",
        /* text/plain keeps it a simple request (no preflight); Havn OS parses it as JSON */
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ citySlug: slug, visitorId: visitorId(), sessionId: sessionId(), name: name, landingPath: landingPath() }),
        keepalive: true,
        credentials: "omit"
      })["catch"](function () { /* ignore */ });
    } catch (e) { /* ignore */ }
  }

  /* ── 3. Havn OS: the city and its menu status ───────────────────────── */
  function statusUrl(open, publishedDate) {
    return "data:application/json," + encodeURIComponent(JSON.stringify({
      ordering: open ? "open" : publishedDate ? "closed" : "pending",
      deliveryDate: publishedDate || null
    }));
  }
  function getJSON(url) {
    return root.fetch(url, { cache: "no-cache", credentials: "omit" }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }
  function settle(p) {
    return p.then(function (v) { return v; }, function () { return null; });
  }
  function tiersOf(c) {
    var t = c && c.welcomeOffer && c.welcomeOffer.tiers;
    if (!Array.isArray(t)) return null;
    return t.filter(function (x) {
      return x && isFinite(x.minMeals) && isFinite(x.offCents) && x.offCents > 0;
    }).sort(function (a, b) { return a.minMeals - b.minMeals; });
  }
  function supportedLadder(t) {
    return !!t && t.length === 2 && t[0].minMeals === 5 && t[1].minMeals === 7 &&
      t.every(function (x) { return Number.isInteger(x.offCents) && x.offCents > 0; });
  }
  function cutoffText(label) {
    return String(label).replace(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b\.? ?/, function (m, d) { return DAYS[d] + " at "; });
  }

  var osCity = null, osStatus = null, started = false;

  function start() {
    if (started) return;
    started = true;
    var tiers = tiersOf(osCity);
    var mode = "active";
    if (welcome) {
      if (supportedLadder(tiers)) {
        mode = "welcome";
        cfg.WELCOME_OFFER_TIERS = tiers;
      }
      else if (root.console) root.console.warn("[havn] " + slug + ": no matching welcome offer from Havn OS; showing the regular menu.");
    }
    root.HAVN_MENU_MODE = mode;
    root.HAVN_MENU_VARIANT = mode === "welcome" ? variant : "";
    root.HAVN_MENU_CITY = slug;
    /* Open unless Havn OS says otherwise; menu.js fails open the same way. */
    cfg.MENU_STATUS_URL = statusUrl(!(osStatus && osStatus.open === false),
      osStatus && osStatus.menuId ? osStatus.deliveryDate : null);
    var s = document.createElement("script");
    s.src = "/menu.js";
    s.async = false;
    s.onload = function () { afterMenu(mode, tiers); };
    document.body.appendChild(s);
  }

  Promise.all([
    settle(getJSON(OS_BASE + "/api/public/cities/" + slug)),
    settle(getJSON(OS_BASE + "/api/public/cities/" + slug + "/menu-status"))
  ]).then(function (r) { osCity = r[0]; osStatus = r[1]; start(); });
  setTimeout(start, OS_WAIT_MS);

  /* ── 4. after menu.js: cutoff, offer, order text, beacons ───────────── */
  function afterMenu(mode, tiers) {
    var label = document.querySelector(".topbar-city");
    var topbar = document.getElementById("topbar");
    if (!label && topbar) {
      label = document.createElement("span");
      label.className = "topbar-city";
      topbar.appendChild(label);
    }
    if (label) label.textContent = city.label;
    var cutoffLabel = (osStatus && osStatus.cutoffLabel) || (osCity && osCity.cutoffLabel) || "";
    var cutoff = document.getElementById("m-howto-cutoff");
    if (cutoff) cutoff.textContent = cutoffLabel ? "Order by " + cutoffText(cutoffLabel) + "." : "";
    if (mode === "welcome" && tiers) ribbon(tiers);
    var send = document.getElementById("m-send");
    if (send) bind(send, mode === "welcome" ? WELCOME_GREETING : GREETING);
    beacon("menu_view");
    document.addEventListener("click", function (e) {
      var el = e.target && e.target.closest ? e.target.closest("a[href^='sms:']") : null;
      if (!el || el.hasAttribute("data-skip-direct") || el.classList.contains("m-send-off")) return;
      beacon("composer_opened");
    }, true);
  }

  function ribbon(tiers) {
    var nums = [document.getElementById("m-rb-0"), document.getElementById("m-rb-1")];
    tiers.slice(0, 2).forEach(function (t, i) {
      var n = nums[i];
      if (!n) return;
      n.textContent = String(t.offCents / 100);
      var qual = n.parentNode && n.parentNode.querySelector("i");
      if (qual) qual.textContent = i === tiers.length - 1 && i > 0 ? "on " + t.minMeals + "+" : "on " + t.minMeals + " meals";
    });
    var rib = document.querySelector(".m-ribbon");
    if (rib && tiers.length >= 2) {
      rib.setAttribute("aria-label", "Welcome offer: " + tiers[0].offCents / 100 + " dollars off " + tiers[0].minMeals +
        " meals, " + tiers[1].offCents / 100 + " dollars off " + tiers[1].minMeals + " or more, applied automatically");
    }
  }

  /* ── cart, read from the page the shopper sees ──────────────────────── */
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

  function windowId() {
    var name = selected("data-window").split("(")[0].trim().toLowerCase();
    if (WINDOW_IDS[name]) return WINDOW_IDS[name];
    var w = osCity && Array.isArray(osCity.windows) ? osCity.windows : [];
    for (var i = 0; i < w.length; i++) {
      if (w[i] && typeof w[i].label === "string" && w[i].label.split("(")[0].trim().toLowerCase() === name) return w[i].id;
    }
    return "";
  }

  function notesFrom(body) {
    var blocks = body.split("\n\n");
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].indexOf("Notes:\n") === 0) return blocks[i].slice(7);
    }
    return "";
  }

  /* ── href handling ──────────────────────────────────────────────────── */
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

  function fetchToken(payload) {
    var ctrl = typeof root.AbortController === "function" ? new root.AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, DRAFT_TIMEOUT_MS) : null;
    return root.fetch(OS_BASE + "/api/public/order-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit",
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

  function bind(send, greeting) {
    var cache = { key: "", token: "" };
    var inflight = 0;
    var timer = null;
    var writing = false;
    var lastHref = ""; /* what we last wrote to the send button */

    /* menu.js rewrites the href on every change. Rewrite it once more so it is
       always a complete, tagged draft: instantly with "(city)", upgraded to
       "(TOKEN)" once the draft is saved. */
    function apply() {
      if (writing) return;
      var parts = hrefParts(send.getAttribute("href"));
      if (!parts) return; /* no href: pending-menu mode or nothing selected */
      /* Skip only our own write, recognised by its exact value. Never by what the text ends with: a
         customer's note can end in "(anything)" and must still get the greeting and the tag. */
      if (send.getAttribute("href") === lastHref) return;
      var base = parts.body;
      var text = greeting + "\n\n" + base;
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
        windowId: windowId(),
        container: /plastic|bpa/i.test(selected("data-container")) ? "plastic" : "glass",
        notes: notesFrom(base),
        attribution: attribution(),
        landingPath: landingPath(),
        visitorId: visitorId(),
        sessionId: sessionId()
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
})(window);
