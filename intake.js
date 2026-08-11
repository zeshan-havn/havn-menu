/* HAVN · intake — the landing-page half of INTAKE-CONTRACT.md v1.

   What happens when a visitor taps any "text us" CTA:
     1. mint a URL-safe token (>=8 chars, unique)
     2. register it with the OS: POST /intake/click with the ad attribution
        we captured on arrival
     3. open the SMS composer with the token embedded in the draft body

   The registration request starts inside the same activation that opens the
   native SMS composer. It uses fetch keepalive so switching to Messages does
   not cancel the request. Waiting for the server before opening `sms:` is not
   viable: browsers expire the tap's user-activation permission while the
   network is in flight and then block the composer.

   Attribution is captured at PAGE LOAD, not at click: the fbclid is in the
   URL Meta sent them to, and it must survive index.html -> menu.html. It
   lives in sessionStorage for that reason.

   No frameworks, no build step, ES5-safe — same as every other file here. */

(function () {
  "use strict";

  var CFG = window.HAVN_CONFIG || {};
  var STORE_KEY = "havn_attr_v1";
  var REGISTRATION_TIMEOUT_MS = 2500;
  var REGISTRATION_ATTEMPTS = 2;

  /* ── attribution ──────────────────────────────────────────────
     Captured once on arrival and pinned for the whole visit. A later
     page (menu.html) has no fbclid in its URL, so re-reading the URL
     there would silently drop the ad that paid for the visit. */

  function readCookie(name) {
    try {
      var m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
      return m ? decodeURIComponent(m.pop()) : "";
    } catch (e) { return ""; }
  }

  function captureAttribution() {
    var stored = null;
    try { stored = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null"); } catch (e) {}

    var q;
    try { q = new URLSearchParams(window.location.search); } catch (e) { q = null; }
    var get = function (k) { return (q && q.get(k)) || ""; };

    var fresh = {
      fbclid: get("fbclid"),
      utm_source: get("utm_source"),
      utm_medium: get("utm_medium"),
      utm_campaign: get("utm_campaign"),
      utm_content: get("utm_content")
    };

    /* a fresh fbclid always wins — it means Meta just sent them again */
    var any = false;
    for (var k in fresh) { if (fresh[k]) { any = true; break; } }
    var attr = (any || !stored) ? fresh : stored;

    /* _fbp is set by the Meta pixel and can appear AFTER first paint,
       so read it live every time rather than trusting the snapshot */
    attr.fbp = readCookie("_fbp") || (stored && stored.fbp) || "";

    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(attr)); } catch (e) {}
    return attr;
  }

  var attribution = captureAttribution();

  /* ── token ────────────────────────────────────────────────────
     Crockford base32: the digits plus the letters MINUS I, L, O and U.
     I/L look like 1, O looks like 0, and dropping U keeps a random
     string from spelling something unfortunate in a text to a stranger.
     The visitor SEES this token in their Messages app and may retype or
     read it aloud to the concierge, so surviving human handling matters
     more than density here.

     Exactly 32 characters, so `& 31` maps a random byte uniformly —
     `% 31` on a 31-character alphabet would bias the early letters.

     SIX chars (Zeshan's call; contract v1.8 caps it at 8). This string is
     user-visible copy sitting in the customer's own editable message, so
     length is a real cost.

     Six is the floor, and the reason is NOT collisions — the OS
     collision-checks at registration and regenerates, so a duplicate is
     invisible. It is MIS-ATTRIBUTION from a typo. What matters is how
     much of the keyspace is live at once: with ~5k tokens alive in the
     7-day window, 6 chars leaves 0.0005% of the space occupied, so a
     mistyped character has ~1-in-200,000 odds of landing on a different
     real person's pending token and crediting them to the wrong click.
     At 4 chars that occupancy is 0.48% — about 1 in 200, which is a real
     rate of silently wrong attribution. */

  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";   /* 32 chars */
  var TOKEN_LEN = 6;

  function mintToken() {
    var n = TOKEN_LEN, out = "", i;   /* 6 chars x 5 bits = 30 bits */
    try {
      var buf = new Uint8Array(n);
      window.crypto.getRandomValues(buf);
      for (i = 0; i < n; i++) out += ALPHABET.charAt(buf[i] & 31);
      return out;
    } catch (e) {
      /* crypto missing is not a reason to lose the lead */
      for (i = 0; i < n; i++) out += ALPHABET.charAt(Math.floor(Math.random() * 32));
      return out;
    }
  }

  /* ── register the click ───────────────────────────────────────
     text/plain avoids a CORS preflight. Unlike the earlier fire-and-forget
     path, a click is only called registered after the OS returns 2xx. A retry
     reuses the exact same token, so the OS's token uniqueness contract makes
     a timeout safe even when the first request finished after the browser gave
     up waiting. */

  function intentFor(key) {
    return (CFG.INTENTS && CFG.INTENTS[key]) || "menu_list";
  }

  /* city is REQUIRED on both endpoints (contract v1.4). The city build
     always sets it, so an empty value means a broken build rather than a
     missing visitor attribute — say so loudly instead of posting "" and
     letting the OS file leads against no market. */
  function requiredCity() {
    var c = CFG.CITY || "";
    if (!c && window.console) {
      console.warn("[havn] CITY is empty — check config.js; intake requires it.");
    }
    return c;
  }

  /* the pixel can set _fbp AFTER first paint, so read the cookie at POST
     time rather than trusting the snapshot taken on arrival */
  function liveFbp() {
    return readCookie("_fbp") || attribution.fbp || "";
  }

  function clickPayload(token, intentKey) {
    return JSON.stringify({
      token: token,
      /* always explicit: a missing intent is defaulted to "order" by the
         OS, which would file every menu-list signup as an order */
      intent: intentFor(intentKey),
      city: requiredCity(),
      fbclid: attribution.fbclid || "",
      fbp: liveFbp(),
      utm_source: attribution.utm_source || "",
      utm_medium: attribution.utm_medium || "",
      utm_campaign: attribution.utm_campaign || "",
      utm_content: attribution.utm_content || "",
      landing_variant: CFG.LANDING_VARIANT || "",
      landing_path: window.location.pathname,
      ts: new Date().toISOString()
    });
  }

  function registerAttempt(url, payload) {
    var PromiseCtor = window.Promise;
    if (!window.fetch || !PromiseCtor) {
      return PromiseCtor ? PromiseCtor.reject(new Error("registration unavailable")) : null;
    }

    return new PromiseCtor(function (resolve, reject) {
      var settled = false;
      var controller = window.AbortController ? new window.AbortController() : null;
      var timeout = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        if (controller) controller.abort();
        reject(new Error("registration timed out"));
      }, REGISTRATION_TIMEOUT_MS);

      var options = {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "text/plain" },
        /* The CTA immediately hands control to the native Messages app. Keep
           this request alive while the landing page moves to the background. */
        keepalive: true
      };
      if (controller) options.signal = controller.signal;

      try {
        window.fetch(url, options).then(function (response) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          if (!response || !response.ok) {
            reject(new Error("registration was not accepted"));
            return;
          }
          resolve();
        })["catch"](function (error) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          reject(error || new Error("registration failed"));
        });
      } catch (error) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        reject(error);
      }
    });
  }

  function registerClick(token, intentKey, prepared) {
    var PromiseCtor = window.Promise;
    if (!PromiseCtor) return null;
    if (!CFG.OS_BASE_URL) {
      return PromiseCtor.reject(new Error("intake is not configured"));
    }
    var registration = prepared || {
      payload: clickPayload(token, intentKey),
      url: CFG.OS_BASE_URL.replace(/\/+$/, "") + "/intake/click"
    };
    var payload = registration.payload;
    var url = registration.url;
    var attempts = 0;

    function attempt() {
      attempts += 1;
      return registerAttempt(url, payload)["catch"](function (error) {
        if (attempts < REGISTRATION_ATTEMPTS) return attempt();
        throw error;
      });
    }

    return attempt();
  }

  /* ── the SMS href ─────────────────────────────────────────────
     "HAVN <token>" is the contractual prefix the OS matches on; the
     rest is Zeshan's wording. The ORDER draft passes its own composed
     body and still carries the prefix, so a first-time visitor who
     orders straight away is still attributable. */

  function smsHref(body) {
    var num = CFG.SMS_NUMBER || "";
    return "sms:" + num + "?&body=" + encodeURIComponent(body);
  }

  /* Compose one draft from its template. The author decides where the code
     sits — Zeshan put it inline in parentheses rather than as a leading
     stamp — so this is a substitution, not a prefix.

     The code is identified by the PARENTHESES around it — "(Q4JMG3)".
     If a template ever loses it, this appends it and says so, because the
     failure would otherwise be invisible: the text still sends, still
     reads fine, and just quietly arrives unattributable. */
  function draftBody(token, template, bodyText) {
    var t = String(template == null ? "" : template);

    t = t.split("{token}").join(token);

    if (t.indexOf("{body}") !== -1) {
      t = t.split("{body}").join(bodyText || "");
    } else if (bodyText) {
      t += "\n\n" + bodyText;
    }

    t = t.replace(/[ \t]+$/gm, "");   /* trailing spaces are invisible cruft */

    /* the code must survive INSIDE brackets — that is how the OS finds it */
    if (t.indexOf("(" + token + ")") === -1) {
      if (window.console) {
        console.warn("[havn] draft is missing \"(" + token + ")\" — appending; " +
                     "check DRAFTS in config.js or this lead arrives unattributable.");
      }
      t = t ? t + " (" + token + ")" : "(" + token + ")";
    }
    return t;
  }

  /* ── public ───────────────────────────────────────────────────
     arm(el, intent) makes any anchor a live intake CTA. Pointer-down begins
     the keepalive registration early. The click queues the same immutable
     payload with sendBeacon while it is still pending, then opens sms:
     synchronously so browser user activation is retained. */

  /* key indexes DRAFTS (the wording), INTENTS (the contract value) and the
     template. bodyFn supplies {body} — the order send composes its own. */
  function templateFor(key) {
    var d = (CFG.DRAFTS || {});
    return d[key] || d.menus || "";
  }

  /* what this CTA would actually send, for previewing it on the page */
  function composeDraft(key, bodyText, token) {
    return draftBody(token || mintToken(), templateFor(key), bodyText);
  }

  function statusNode(el) {
    var node = el.__havnRegistrationStatus;
    if (node) return node;
    node = document.createElement("span");
    node.className = "havn-intake-status";
    node.setAttribute("aria-live", "polite");
    node.style.display = "block";
    node.style.marginTop = "8px";
    node.style.fontSize = "12px";
    node.style.lineHeight = "1.4";
    if (el.parentNode) el.parentNode.insertBefore(node, el.nextSibling);
    el.__havnRegistrationStatus = node;
    return node;
  }

  function clearStatus(el) {
    var node = el.__havnRegistrationStatus;
    if (node) node.textContent = "";
  }

  function setStatus(el, message, actions) {
    var node = statusNode(el);
    node.textContent = message || "";
    for (var i = 0; actions && i < actions.length; i++) {
      var action = actions[i];
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = action.label;
      button.style.marginLeft = "8px";
      button.style.padding = "4px 0";
      button.style.font = "inherit";
      button.style.fontSize = "inherit";
      button.style.color = "inherit";
      button.style.background = "transparent";
      button.style.border = "0";
      button.style.textDecoration = "underline";
      button.style.cursor = "pointer";
      button.addEventListener("click", action.onClick);
      node.appendChild(button);
    }
  }

  function fallbackControls(el, state) {
    setStatus(el, "We couldn't save your request.", [
      { label: "Retry", onClick: function () { startRegistration(el, state); } },
      { label: "Continue to Messages", onClick: function () {
        var href = el.getAttribute("data-havn-sms-href");
        if (href) window.location.href = href;
      } }
    ]);
  }

  function prepareRegistration(state) {
    if (state.registration) return state.registration;
    if (!CFG.OS_BASE_URL || !requiredCity()) return null;
    state.registration = {
      url: CFG.OS_BASE_URL.replace(/\/+$/, "") + "/intake/click",
      payload: clickPayload(state.token, state.key)
    };
    return state.registration;
  }

  function startRegistration(el, state) {
    if (state.phase === "pending" || state.phase === "registered") return state.promise;
    if (!prepareRegistration(state)) {
      state.phase = "failed";
      fallbackControls(el, state);
      return null;
    }
    state.phase = "pending";
    clearStatus(el);
    state.promise = registerClick(state.token, state.key, state.registration);
    if (!state.promise || !state.promise.then) {
      state.phase = "failed";
      fallbackControls(el, state);
      return state.promise;
    }
    state.promise = state.promise.then(function () {
      state.phase = "registered";
      clearStatus(el);
    })["catch"](function () {
      state.phase = "failed";
      fallbackControls(el, state);
    });
    return state.promise;
  }

  function queueRegistrationBeacon(state) {
    if (state.beaconQueued || state.phase === "registered") return;
    if (!state.registration || !navigator.sendBeacon) return;
    try {
      state.beaconQueued = navigator.sendBeacon(
        state.registration.url,
        state.registration.payload
      );
    } catch (e) {}
  }

  function requestOpen(el, state) {
    if (!prepareRegistration(state)) {
      fallbackControls(el, state);
      return;
    }
    startRegistration(el, state);
    queueRegistrationBeacon(state);
    var href = el.getAttribute("data-havn-sms-href");
    if (href) window.location.href = href;
  }

  function arm(el, key, bodyFn) {
    if (!el || el.__havnArmed) return;
    el.__havnArmed = true;

    var refresh = function () {
      var token = mintToken();
      el.setAttribute("data-havn-token", token);
      var body = (typeof bodyFn === "function") ? bodyFn() : null;
      el.setAttribute("data-havn-sms-href", smsHref(draftBody(token, templateFor(key), body)));
      return token;
    };
    var state = {
      key: key,
      token: refresh(),
      phase: "idle",
      promise: null,
      beaconQueued: false,
      registration: null
    };
    el.__havnRegistration = state;
    el.setAttribute("href", "#");

    el.addEventListener("pointerdown", function (event) {
      if (event.button && event.button !== 0) return;
      startRegistration(el, state);
    });
    el.addEventListener("click", function (event) {
      /* Keyboard and assistive-technology activation skips pointerdown. Keep
         every operation through the sms: assignment synchronous: awaiting the
         server here causes browsers to reject the external-protocol launch. */
      event.preventDefault();
      requestOpen(el, state);
    });
  }

  function armAll(root) {
    var scope = root || document;
    var els = scope.querySelectorAll("[data-havn-cta]");
    for (var i = 0; i < els.length; i++) {
      arm(els[i], els[i].getAttribute("data-havn-cta"));
    }
  }

  /* ── form fallback (INTAKE-CONTRACT v1.1) ─────────────────────
     A device that cannot open an SMS composer — in practice desktop —
     would otherwise hit a dead CTA. Meta traffic is overwhelmingly
     mobile so this is an edge path, and it is built in JS rather than
     in the markup so it adds nothing to the designed page until it is
     actually needed.

     Frozen by the conductor: honeypot field is `company` (hidden;
     non-empty => silent drop), `source` is a free string, and the
     payload is the /intake/click keys plus name and phone. */

  function smsLikely() {
    try {
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return true;
      return /iPhone|iPad|iPod|Android|Mobile|Silk/i.test(navigator.userAgent || "");
    } catch (e) { return true; }   /* when unsure, assume the phone */
  }

  /* CHANGE 7's earlier shape — a consent-gated lead form posting
     sms_consent* to /intake/lead — is GONE, along with postLead(),
     CONSENT_TEXT and plausiblePhone(). The QR path collects nothing, so
     there is no payload and no client-side consent text to keep in sync.
     The five consent columns still need writing, but on the SMS path in
     the OS, which is where the consent actually happens.

  /* ═══════════════════════════════════════════════════════════════
     ▓▓▓ MOCKUP · CHANGE 7 (REVISED, Aug 10) — QR, not a form ▓▓▓

     Zeshan's call: the desktop lead form is replaced entirely by a QR
     code that opens the SMS composer on the visitor's phone.

     Why this is the better answer and not just the simpler one:
       · No phone number is ever collected on the web, so there is no
         web-collected consent to disclose, gate, or store. The whole
         consent-record problem on this path disappears rather than
         getting solved.
       · Every opt-in in the system becomes customer-initiated, so there
         is ONE consent shape to defend instead of two.
       · The disclosure still has to be shown here, because the QR is a
         call-to-action for the messaging program.

     ATTRIBUTION — SOLVED, Aug 10 (Zeshan's ask). The QR is no longer a
     static file. Opening the modal now runs the SAME front-door sequence
     the phone path runs:

         mintToken()  ->  registerClick()  ->  composeDraft()  ->  smsHref()

     and only THEN encodes that href into a QR, in the browser. So the
     scanned message arrives carrying "(Q4JMG3)" exactly like a tap on a
     phone, and desktop attribution becomes identical to mobile instead
     of landing as organic.

     This is also the fbp/fbc-into-SMS bridge that was designed and never
     built: the DESKTOP browser's _fbp/_fbc go up in the click payload
     (that is the device that saw the ad), the inbound arrives from the
     PHONE's number, and the token is what ties the two together. Neither
     device alone can make that join.

     ORDER MATTERS. Registry membership gates every attribution path in
     the OS, so the token has to be registered BEFORE it can be scanned —
     a QR rendered ahead of a 2xx would hand out a code the OS has never
     heard of. Hence: register, then draw.

     FAILURE POSTURE. If registration fails after its retries we still
     draw a QR, just without the token. Losing attribution on one desktop
     visitor is bad; losing the visitor is worse.
     ═══════════════════════════════════════════════════════════════ */
  var qrEl = null;
  var qrToken = null;          /* minted once per page, not per open */
  var qrEncoderLoading = null;

  /* The encoder is ~56KB and only desktop ever needs it, so it is fetched
     on first open rather than shipped to the 95% of visitors on a phone
     who will never see this modal. */
  function loadQrEncoder() {
    if (window.qrcode) return window.Promise.resolve(window.qrcode);
    if (qrEncoderLoading) return qrEncoderLoading;
    qrEncoderLoading = new window.Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "vendor-qrcode.js";
      s.async = true;
      s.onload = function () {
        window.qrcode ? resolve(window.qrcode) : reject(new Error("encoder absent"));
      };
      s.onerror = function () { reject(new Error("encoder failed to load")); };
      document.head.appendChild(s);
    });
    return qrEncoderLoading;
  }

  /* Draw at module scale 1 and let CSS size it — a QR is a bitmap of
     modules, so scaling the SVG viewBox keeps every edge crisp at any
     rendered size. Quiet zone is 4 modules per the spec; scanners fail
     without it. */
  function qrSvg(text) {
    var q = window.qrcode(0, "M");
    q.addData(text);
    q.make();
    var n = q.getModuleCount();
    var B = 4;
    var total = n + 2 * B;
    var rects = [];
    for (var y = 0; y < n; y++) {
      var x = 0;
      while (x < n) {
        if (q.isDark(y, x)) {
          var run = 1;
          while (x + run < n && q.isDark(y, x + run)) run += 1;
          rects.push('<rect x="' + (x + B) + '" y="' + (y + B) +
                     '" width="' + run + '" height="1"/>');
          x += run;
        } else {
          x += 1;
        }
      }
    }
    return '<svg viewBox="0 0 ' + total + ' ' + total + '" ' +
           'xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" ' +
           'role="img" aria-label="QR code that opens a text message to Havn Club">' +
           '<rect width="' + total + '" height="' + total + '" fill="#FBF8F1"/>' +
           '<g fill="#0A1612">' + rects.join("") + '</g></svg>';
  }

  function buildQr() {
    if (qrEl) return qrEl;
    var Q = CFG.QR || {};
    var wrap = document.createElement("div");
    wrap.className = "qr-modal";
    wrap.setAttribute("hidden", "");
    wrap.innerHTML =
      '<div class="qr-card" role="dialog" aria-modal="true" aria-labelledby="qr-title">' +
        '<button type="button" class="qr-close" aria-label="Close">&times;</button>' +
        '<p class="qr-eyebrow">' + (Q.eyebrow || "On a computer?") + '</p>' +
        '<h2 class="qr-title" id="qr-title">' + (Q.title || "") + '</h2>' +
        '<div class="qr-code" id="qr-code" data-state="loading">' +
          '<p class="qr-wait">Preparing your code&hellip;</p>' +
        '</div>' +
        /* The instructions Zeshan asked for: what happens AFTER the scan.
           Three numbered steps, because the scan is not the finish line —
           the visitor still has to press send, and they should know a
           reply is coming. */
        '<ol class="qr-steps">' +
          '<li><b>Scan it</b> with your phone camera.</li>' +
          '<li>Your messages app opens with a note to us <b>already written</b>.</li>' +
          '<li><b>Press send.</b> We\'ll text you this week\'s menu straight back.</li>' +
        '</ol>' +
        '<p class="qr-or">Or text <b>' + (Q.numberLabel || "") + '</b> yourself.</p>' +
        '<p class="qr-fine">' +
          'Texting opts you in to recurring automated Havn&nbsp;Club texts. ' +
          'Frequency varies; msg &amp; data rates may apply. Reply <b>STOP</b> ' +
          'to cancel, <b>HELP</b> for help. ' +
          '<a href="/terms">SMS Terms</a> &middot; <a href="/privacy">Privacy</a>' +
        '</p>' +
      '</div>';

    wrap.querySelector(".qr-close").addEventListener("click", closeQr);
    wrap.addEventListener("click", function (e) { if (e.target === wrap) closeQr(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !wrap.hasAttribute("hidden")) closeQr();
    });

    document.body.appendChild(wrap);
    qrEl = wrap;
    return wrap;
  }

  function openQr() {
    var w = buildQr();
    w.removeAttribute("hidden");
    var c = w.querySelector(".qr-close");
    if (c) c.focus();
    prepareQr(w);
  }

  /* register the click, then draw the code that carries it */
  function prepareQr(w) {
    var host = w.querySelector("#qr-code");
    if (!host) return;
    /* "ready" alone is not enough: a second open before the first resolves
       slipped past it and registered the memoised token twice */
    var state = host.getAttribute("data-state");
    if (state === "ready" || state === "preparing") return;
    host.setAttribute("data-state", "preparing");

    if (!qrToken) qrToken = mintToken();
    var token = qrToken;

    function draw(withToken) {
      var body = composeDraft("menus", null, withToken ? token : mintToken());
      return loadQrEncoder().then(function () {
        host.innerHTML = qrSvg(smsHref(body));
        host.setAttribute("data-state", "ready");
        host.setAttribute("data-attributed", withToken ? "yes" : "no");
      })["catch"](function () {
        /* no encoder at all: fall back to the number, which still works */
        host.innerHTML = '<p class="qr-wait">Text us at ' +
          ((CFG.QR && CFG.QR.numberLabel) || "") + '</p>';
        host.setAttribute("data-state", "failed");
      });
    }

    var reg = registerClick(token, "menus");
    if (!reg) return draw(false);
    return reg.then(function () { return draw(true); })
      ["catch"](function () { return draw(false); });
  }
  function closeQr() { if (qrEl) qrEl.setAttribute("hidden", ""); }

  /* On desktop the sms: CTAs do nothing, so THEY open the QR — which also
     retires the odd "Not on a phone?" link Zeshan asked to remove. The
     buttons keep their own copy; only their behaviour changes, and only
     where a composer won't open. */
  function armDesktopCtas() {
    var ctas = document.querySelectorAll("[data-havn-cta]");
    for (var i = 0; i < ctas.length; i++) {
      /* claim the element so a later armAll() cannot double-bind it */
      ctas[i].__havnArmed = true;
      ctas[i].setAttribute("href", "#");
      ctas[i].addEventListener("click", function (e) {
        e.preventDefault();
        openQr();
      });
    }
  }

  /* ── Meta pixel ───────────────────────────────────────────────
     Loaded here because the pixel is what sets the _fbp cookie that
     /intake/click reports — without it that field is always empty.
     ONE pixel across both cities (contract v1.4). Nothing third-party
     is fetched when META_PIXEL_ID is blank. */
  function loadPixel() {
    var id = CFG.META_PIXEL_ID;
    if (!id || window.fbq) return;
    /* standard Meta bootstrap, ES5-safe */
    var n = window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    window.fbq("init", id);
    window.fbq("track", "PageView");
  }

  window.HAVN_INTAKE = {
    arm: arm,
    armAll: armAll,
    openQr: openQr,
    closeQr: closeQr,
    smsLikely: smsLikely,
    mintToken: mintToken,
    smsHref: smsHref,
    draftBody: draftBody,
    composeDraft: composeDraft,
    registerClick: registerClick,
    attribution: function () { return attribution; },
    config: function () { return CFG; }
  };

  /* EXCLUSIVE, not stacked. arm() binds a pointerdown that registers its
     own click token; armDesktopCtas() registers a token inside the QR.
     Running both meant one desktop click produced TWO registrations — the
     QR's, which the inbound can claim, and an orphan that nothing ever
     claims but which still lands in the events table and skews the
     click-to-inbound rate. Caught by counting registrations against a
     local stub: one click, two tokens. */
  function init() {
    loadPixel();
    if (smsLikely()) {
      armAll();               /* phone: tap -> register -> composer */
    } else {
      armDesktopCtas();       /* desktop: click -> register -> tokenised QR */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

