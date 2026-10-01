/* HAVN · This week's menu — selections → draft text → send or skip.
   Deterministic, no frameworks. State lives here; nothing persists.
   Meals $25 · sides $10 · collections $25. Each
   collection counts as one meal equivalent; three sides count as one.
   Dish data is generated from the explicitly selected finalized weekly menu. Tapping a card
   opens its detail sheet (description, full macros, dietary tags,
   Make-it mods, free-text note) — same shape as menu.havnclub.com. */

(function () {
  "use strict";

  var priceForSlot = window.HAVN_PRICING && window.HAVN_PRICING.priceForSlot;
  if (!priceForSlot) throw new Error("Havn acquisition pricing did not load");
  var MODE = window.HAVN_MENU_MODE || "active";
  var ARCHIVED_DELIVERY_DATE = /^\/sep13(?:\/|$)/i.test(window.location.pathname || "")
    ? new Date("2026-09-13T12:00:00")
    : null;
  /* Section labels derive from the same resolver as the cart and receipt, so
     a future price adjustment cannot leave the visible menu out of sync. */
  var mealPrice = priceForSlot("cheat");

  /* ── BEGIN GENERATED: SECTIONS ───────────────────────────────────
     Written by scripts/sync_design_lab_menu.py from the weekly menu
     build's Menu Detail CSV. DO NOT HAND-EDIT between these markers —
     the next weekly run overwrites it. Authored content that is not in
     the CSV (collection flavors/notes, bespoke art, short display
     names) lives in menu-data.overrides.json and survives every run. */
  /* delivery-week: 2026-10-04 */
  var SECTIONS = [
    {
      label: "Chef Special",
      items: [
        {
          id: "cheat", name: "Beef Bourguignon", tag: "Chef special", img: "/assets/current/special.jpg",
          desc: "Slow braised beef chuck with a red wine reduction and cremini mushrooms and pearl onions over whipped Yukon Gold purée.",
          cal: 621, protein: 49, fat: 21, fiber: 7, carbs: 40,
          diet: [["Dairy (potato purée)", "allergen"], ["Gluten free", "safe"]]
        }
      ]
    },
    {
      label: "Chicken",
      items: [
        {
          id: "chicken", name: "Peri Peri Chicken", tag: "Chicken", img: "/assets/current/chicken.jpg",
          desc: "Charred chicken with a peri peri glaze and fire charred sweet corn and roasted cauliflower over coconut rice.",
          cal: 739, protein: 53, fat: 32, fiber: 6, carbs: 62,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        },
        {
          id: "chicken_2", name: "Lemon Herb Feta Chicken", tag: "Chicken", img: "/assets/current/chicken_2.jpg",
          desc: "Lemon herb chicken with a ruby whipped feta and roasted sweet potato and lacinato kale with a house pickled vegetable medley.",
          cal: 675, protein: 66, fat: 31, fiber: 7, carbs: 33,
          diet: [["Dairy (feta)", "allergen"], ["Gluten free", "safe"]]
        }
      ]
    },
    {
      label: "Beef",
      items: [
        {
          id: "beef", name: "Carne Asada Steak", tag: "Beef", img: "/assets/current/beef.jpg",
          desc: "Carne asada steak with a creamy Peruvian aji verde and roasted sweet plantains and pickled red onions over cilantro lime rice.",
          cal: 708, protein: 54, fat: 22, fiber: 3, carbs: 71,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        }
      ]
    },
    {
      label: "Seafood",
      items: [
        {
          id: "seafood", name: "Pomegranate Salmon", tag: "Seafood", img: "/assets/current/seafood.jpg",
          desc: "Pomegranate salmon with a whipped pomegranate sauce and roasted zucchini over saffron cauliflower rice.",
          cal: 677, protein: 49, fat: 43, fiber: 5, carbs: 24,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        },
        {
          id: "seafood_2", name: "Spicy Tuna", tag: "Seafood", img: "/assets/current/seafood_2.jpg",
          desc: "Crispy albacore tuna cakes with a spicy yuzu mayo and miso glazed carrots and pickled cucumbers over seasoned sushi rice.",
          cal: 609, protein: 36, fat: 19, fiber: 5, carbs: 68,
          diet: [["Dairy free", "safe"], ["Gluten (breadcrumbs)", "allergen"]]
        }
      ]
    },
    {
      label: "Pasta",
      items: [
        {
          id: "pasta", name: "Vodka Pasta", tag: "Pasta", img: "/assets/current/pasta.jpg",
          desc: "Blackened chicken breast over luxurious shell pasta with a dairy free vodka cream sauce.",
          cal: 717, protein: 54, fat: 33, fiber: 4, carbs: 50,
          diet: [["Dairy free", "safe"], ["Gluten (pasta)", "allergen"]]
        }
      ]
    },
    {
      label: "Vegetarian",
      items: [
        {
          id: "vegetarian", name: "Korean Seared Tofu", tag: "Vegetarian", img: "/assets/current/veg.jpg",
          desc: "Crispy seared tofu with a gochujang glaze and charred broccoli and roasted cremini mushrooms over basmati rice.",
          cal: 663, protein: 50, fat: 22, fiber: 10, carbs: 71,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        }
      ]
    },
    {
      label: "Salads",
      items: [
        {
          id: "salad", name: "Green Goddess Salad", tag: "Salad", img: "/assets/current/salad.jpg",
          desc: "Diced lemon herb chicken over shredded purple cabbage and kale with pickled red onion, cucumber, roasted chickpeas, red grapes, toasted pumpkin seeds and dried apricots, with tahini green goddess on the side.",
          cal: 479, protein: 45, fat: 20, fiber: 10, carbs: 31,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        },
        {
          id: "salad_2", name: "Harvest Bowl Salad", tag: "Salad", img: "/assets/current/salad_2.jpg",
          desc: "Diced lemon herb chicken over apple cider slaw and kale with roasted sweet potato, shaved carrot and celery, spiced pickled apple and goat cheese, with balsamic vinaigrette on the side.",
          cal: 506, protein: 42, fat: 25, fiber: 9, carbs: 29,
          diet: [["Dairy (goat cheese)", "allergen"], ["Gluten free", "safe"]]
        }
      ]
    },
    {
      label: "Breakfast & sides — $10",
      drop: true,
      side: true,
      items: [
        {
          id: "oats", name: "Classic Overnight Oats", tag: "Oats", side: true,
          desc: "Premium rolled oats in organic milk, lightly sweetened with maple and vanilla.",
          cal: 207, protein: 17, fat: 2, fiber: 3, carbs: 26,
          diet: [["Dairy (milk)", "allergen"], ["Gluten free", "safe"]]
        },
        {
          id: "chia", name: "Vanilla Chia Pudding", tag: "Chia", side: true,
          desc: "Vanilla chia pudding with house granola and fresh blueberries.",
          cal: 311, protein: 18, fat: 13, fiber: 9, carbs: 24,
          diet: [["Dairy (yogurt)", "allergen"], ["Gluten (granola)", "allergen"]]
        },
        {
          id: "chia_2", name: "Strawberry Chia Pudding", tag: "Chia", side: true,
          desc: "Strawberry chia pudding with house granola and fresh strawberries.",
          cal: 304, protein: 18, fat: 13, fiber: 9, carbs: 22,
          diet: [["Dairy (yogurt)", "allergen"], ["Gluten (granola)", "allergen"]]
        }
      ]
    },
    {
      label: "Collections — $25",
      drop: true,
      collection: true,
      items: [
        {
          id: "wellness_shots", name: "Wellness Shots Collection", tag: "Four 2-oz shots", addon: true,
          desc: "Four cold-pressed rituals in glass vials, made fresh the week of delivery. Coconut water base, refrigerate and enjoy within six days.",
          note: "Cold-pressed in our kitchen, fresh the week of delivery.",
          flavors: [
            ["Immunity", "Turmeric, ginger, lemon, black pepper"],
            ["Endurance", "Beetroot, tart cherry, ginger, lemon"],
            ["Purify", "Wheatgrass, cucumber, chlorophyll, mint"],
            ["Clarity", "Blue spirulina, lemon, L-theanine, honey"]
          ]
        }
      ]
    }
  ];
  /* ── END GENERATED: SECTIONS ─────────────────────────────────── */

  /* Keep the shareable /Sep13 link pinned to that delivery week's
     preserved snapshot while the normal routes continue using the live menu. */
  if (ARCHIVED_DELIVERY_DATE && window.HAVN_PREVIOUS_MENU_SECTIONS) {
    SECTIONS = window.HAVN_PREVIOUS_MENU_SECTIONS;
  }

  function indexItems(sections) {
    var indexed = {};
    sections.forEach(function (s) {
      s.items.forEach(function (it) { indexed[it.id] = it; });
    });
    return indexed;
  }

  var ITEMS = indexItems(SECTIONS);

  var qty = {};
  var mods = {};   /* id -> array of active Make-it pills */
  var notes = {};  /* id -> free-text customization */
  var delWindow = "Sunday morning";
  var container = "Glass";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ▓▓▓ MOCKUP · TASTING MENU (Sep 29) ▓▓▓
     Welcome pages only, behind ?tasting=b|c|d|e|f (f = D + B + C + ladder).
     New ladder: 4 meals full price, $15 off at 5, $25 off at 7+. Two ways to
     try: the Tasting Menu (fixed: the two top sellers in different proteins,
     a chia and a set of shots, $60) or any one meal ($25 + $5 delivery).
     Delivery is free on the Tasting Menu and on weekly orders. Upgrading from
     the Tasting Menu keeps the chia and shots free once the week reaches 5. */
  var TASTING = (function () {
    if (MODE !== "welcome") return "";
    /* the live Tasting Menu welcome page is route-driven; the lettered mock
       variants stay available only on a local preview */
    if (window.HAVN_MENU_VARIANT === "tasting") return "g";
    if (!/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname || "")) return "";
    var v = "";
    try { v = new URLSearchParams(window.location.search || "").get("tasting") || ""; } catch (e) {}
    return /^[bcdefg]$/.test(v) ? v : "";
  })();
  /* The weekly menu build would write this forecast: each meal's average
     share of the week's meals over its past runs (Oct 4 figures, from
     .artifacts/tasting-menu/offer-utilization.md). Salads never qualify. */
  var TASTING_FORECAST = [
    { id: "beef", protein: "beef", share: 17.8 },
    { id: "cheat", protein: "beef", share: 15.9 },
    { id: "seafood", protein: "seafood", share: 12.1 },
    { id: "pasta", protein: "chicken", share: 11.1 },
    { id: "chicken", protein: "chicken", share: 11.0 },
    { id: "chicken_2", protein: "chicken", share: 10.1 },
    { id: "seafood_2", protein: "seafood", share: 8.7 },
    { id: "vegetarian", protein: "vegetarian", share: 3.8 }
  ];
  /* the top seller, then the next best in a different protein */
  function pickTasting(forecast) {
    var ranked = forecast.slice().sort(function (a, b) { return b.share - a.share; });
    var first = ranked[0];
    var second = ranked.filter(function (m) { return m.protein !== first.protein; })[0];
    return [first, second];
  }
  var TASTING_PICKS = pickTasting(TASTING_FORECAST);
  var TASTING_MEAL_IDS = TASTING_PICKS.map(function (m) { return m.id; });
  var TASTING_EXTRA_IDS = ["chia", "wellness_shots"];
  var TASTING_PRICE = 60;
  var SINGLE_DELIVERY = 5;
  var tastingGifts = false;
  var singleIntent = false;
  if (TASTING) document.body.classList.add("tasting-" + TASTING);
  /* f combines D (top), B (dock), C (last section) and the ladder */
  function placed(k) { return TASTING === k || (TASTING === "f" && "bcde".indexOf(k) !== -1); }
  /* g · the simplified first-visit page: food first, one checkout, and the
     cart explains the offer as it becomes relevant. The Tasting Menu is an
     order of its own (tastingOrder); adding any meal turns it into a week. */
  var SIMPLE = TASTING === "g";
  var tastingOrder = false;
  var tastingPrev = null;
  var detailTasting = false;

  var PROMO_LABELS = {
    welcome: TASTING ? "Welcome credit" : "Welcome offer",
    ws: "Wellness credit",
    in: "Welcome back credit"
  };

  function discountFor(meals, wellnessShots, dateBalls) {
    if (MODE === "welcome" && TASTING) return meals >= 7 ? 25 : meals >= 5 ? 15 : 0;
    if (MODE === "welcome") return meals >= 7 ? 40 : meals >= 5 ? 20 : 0;
    if (MODE === "ws") return meals >= 5 && wellnessShots >= 1 ? 25 : 0;
    if (MODE === "in") return meals >= 5 ? 25 : 0;
    return 0;
  }

  function promoHint(c) {
    if (MODE === "active" || c.discount) return "";
    if (MODE === "welcome" && TASTING) {
      if (tastingGifts && c.meals < 5) return " · $15 off at 5 meals";
      return c.meals < 5 ? " · $15 off at 5 meals" : " · $25 off at 7";
    }
    if (MODE === "welcome") {
      return c.meals < 5 ? " · $20 off at 5 meals" : " · $40 off at 7";
    }
    if (MODE === "ws") {
      if (c.wellnessShots < 1 && c.meals < 5) return " · add Wellness Shots + " + (5 - c.meals) + " more for $25 off";
      return c.wellnessShots < 1 ? " · add Wellness Shots for $25 off" : " · add " + (5 - c.meals) + " more for $25 off";
    }
    return " · $25 off at 5 meals";
  }

  /* Quiz signups land on /welcome/quiz#n=<first name>. The name is read
     once, kept for this tab, and cleared from the address bar before the
     pixel (intake.js, on DOMContentLoaded) can report the page URL. */
  function quizFirstName() {
    var name = "";
    var match = /^#(?:.*&)?n=([^&]*)/.exec(window.location.hash || "");
    if (match) {
      try { name = decodeURIComponent(match[1].replace(/\+/g, " ")); } catch (e) { name = ""; }
      try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch (e) {}
      try { sessionStorage.setItem("havn_quiz_name", name); } catch (e) {}
    } else {
      try { name = sessionStorage.getItem("havn_quiz_name") || ""; } catch (e) {}
    }
    name = name.trim().split(/\s+/)[0] || "";
    if (!/^[A-Za-z\u00C0-\u024F'\u2019-]{1,20}$/.test(name)) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /* Same welcome offer and menu; the masthead greets them and a short
     how-to-order block explains the text flow before the first dish. */
  function configureQuizWelcome() {
    document.body.classList.add("quiz-welcome");
    var logo = document.getElementById("topbar-logo");
    if (logo) logo.hidden = false;
    var title = document.getElementById("m-head-title");
    var name = quizFirstName();
    if (title) {
      var em = document.createElement("em");
      em.textContent = name ? name + "." : "in.";
      title.textContent = name ? "You\u2019re in," : "You\u2019re";
      title.appendChild(document.createElement("br"));
      title.appendChild(em);
    }
    var sub = document.getElementById("m-quiz-sub");
    if (sub) sub.hidden = false;
    var howto = document.getElementById("m-howto");
    if (howto) howto.hidden = false;
    /* Order cutoffs: DMV Thursday 7pm, San Diego Thursday 4pm. */
    var cutoff = document.getElementById("m-howto-cutoff");
    if (cutoff) {
      cutoff.textContent = "Order by Thursday at " +
        (window.HAVN_MENU_CITY === "SD" ? "4pm" : "7pm") + " for delivery Sunday or Monday.";
    }
  }

  /* The same page is safely reused for all member cohorts. Only the
     path-selected offer and the active-member header treatment vary. */
  (function configureModePresentation() {
    var body = document.body;
    var ribbon = document.querySelector(".m-ribbon");
    if (window.HAVN_MENU_CITY === "SD") {
      var cityLabel = document.querySelector(".topbar-city");
      if (cityLabel) cityLabel.textContent = "SoCal";
    }
    if (MODE === "welcome" && (window.HAVN_MENU_VARIANT === "quiz" || window.HAVN_MENU_VARIANT === "tasting")) configureQuizWelcome();
    if (MODE === "active") {
      body.classList.add("active-menu");
      return;
    }
    if (!ribbon || MODE === "welcome") return;
    var isWellness = MODE === "ws";
    var title = isWellness ? "Wellness Shots" : "Welcome Back";
    var qualifier = isWellness ? "5 meals + Wellness Shots" : "on 5 meals";
    var note = "Applied automatically";
    ribbon.setAttribute("aria-label", "25 dollar credit " + qualifier + ", applied automatically");
    ribbon.innerHTML = '<span class="m-ribbon-sheen" aria-hidden="true"></span>' +
      '<p class="m-ribbon-kicker">$25 Credit &middot; ' + title + '</p>' +
      '<div class="m-ribbon-amts m-ribbon-amts-single"><span class="m-ribbon-amt">$<b>25</b> off <i>' + qualifier + '</i></span></div>' +
      '<p class="m-ribbon-note">' + note + '</p>';
  })();

  /* The label always identifies the Sunday delivery the menu is for. */
  (function () {
    var dateLabel = document.getElementById("m-menu-date");
    if (!dateLabel) return;
    var delivery = ARCHIVED_DELIVERY_DATE ? new Date(ARCHIVED_DELIVERY_DATE) : new Date();
    if (!ARCHIVED_DELIVERY_DATE) {
      delivery.setHours(12, 0, 0, 0);
      delivery.setDate(delivery.getDate() + ((7 - delivery.getDay()) % 7));
    }
    dateLabel.dateTime = delivery.toISOString().slice(0, 10);
    dateLabel.textContent = delivery.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric"
    });
  })();

  /* ── the welcome-offer ribbon ─────────────────────────────────
     This is a customer promise, not a loading indicator. Keep the saved
     amounts visible even if a device delays or stops animation. */
  (function () {
    if (MODE !== "welcome") return;
    var nums = [document.getElementById("m-rb-0"), document.getElementById("m-rb-1")];
    if (!nums[0] || !nums[1]) return;
    var TARGETS = TASTING ? [15, 25] : [20, 40];
    var rib = document.querySelector(".m-ribbon");
    if (TASTING && rib) rib.setAttribute("aria-label", "Welcome offer: 15 dollars off five meals, 25 dollars off seven or more, applied automatically");
    nums.forEach(function (n, i) { n.textContent = TARGETS[i]; });
  })();

  /* ── render menu ────────────────────────────────────────────── */
  var mount = document.getElementById("m-menu");

  function stepperHTML(id) {
    return '<div class="m-stepper" data-id="' + id + '">' +
      '<button type="button" class="m-add">Add<i>+</i></button>' +
      '<div class="m-counter" hidden><button type="button" class="m-dec" aria-label="Remove one">&minus;</button><b class="m-qty">0</b><button type="button" class="m-inc" aria-label="Add one">+</button></div>' +
      "</div>";
  }

  /* g: one "Meals" grid, most-ordered first (the forecast the Tasting Menu
     uses; salads keep their place at the end), then breakfast and shots */
  function menuView() {
    if (!SIMPLE) return SECTIONS;
    var share = {};
    TASTING_FORECAST.forEach(function (f) { share[f.id] = f.share; });
    /* the Tasting Menu's two meals lead, so the card below them is true */
    function rank(id) { return (TASTING_MEAL_IDS.indexOf(id) !== -1 ? 1000 : 0) + (share[id] || 0); }
    var meals = [], rest = [];
    SECTIONS.forEach(function (s) {
      if (s.side || s.collection) rest.push(s);
      else meals = meals.concat(s.items);
    });
    meals = meals.map(function (it, i) { return { it: it, i: i }; })
      .sort(function (a, b) { return rank(b.it.id) - rank(a.it.id) || a.i - b.i; })
      .map(function (x) { return x.it; });
    return [{ label: "Meals \u00b7 $" + mealPrice + " each", meals: true, items: meals }].concat(rest.map(function (s) {
      var copy = {};
      Object.keys(s).forEach(function (k) { copy[k] = s[k]; });
      copy.drop = false;
      if (s.side) copy.label = "Breakfast \u00b7 $" + priceForSlot("chia") + " each";
      if (s.collection) copy.label = "Wellness shots";
      return copy;
    }));
  }

  function tastingCardHTML() {
    var names = TASTING_MEAL_IDS.concat(TASTING_EXTRA_IDS).map(function (id) { return ITEMS[id] ? ITEMS[id].name : id; });
    return '<p class="g-taste-kicker">Not ready for a week?</p>' +
      '<h3 class="g-taste-title">Start with the <em>Tasting Menu</em></h3>' +
      '<p class="g-taste-copy">The two fan favorites above, plus a chia pudding and a set of wellness shots. For your first order.</p>' +
      '<ul class="g-taste-list">' + TASTING_MEAL_IDS.concat(TASTING_EXTRA_IDS).map(function (id, i) {
        return '<li><button type="button" class="g-taste-item" data-g-detail="' + id + '" aria-label="' + names[i] + ', see details">' +
          '<span class="g-ti-name">' + names[i].replace(" Collection", "") + '</span><i class="g-ti-go" aria-hidden="true">&rsaquo;</i></button></li>';
      }).join("") + "</ul>" +
      '<p class="g-taste-price"><b>$' + TASTING_PRICE + '</b><s>$85</s></p>' +
      '<button type="button" class="g-taste-cta" data-g-tasting>Order the Tasting Menu</button>' +
      '<p class="g-taste-one">Tap an item for ingredients and macros.</p>';
  }

  function renderMenuSections() {
    mount.innerHTML = "";

    menuView().forEach(function (section) {
      var sec = document.createElement("section");
      sec.className = "m-sec";

      var grid = document.createElement("div");
      grid.className = "m-grid" +
        (section.side ? " m-grid-sides" : "") +
        (section.collection ? " m-grid-collections" : "");

      if (section.drop) {
        /* collapsed drawer: the label row is the handle */
        sec.classList.add("m-sec-drop");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "m-sec-toggle";
        btn.setAttribute("aria-expanded", "true");
        btn.innerHTML = '<span class="m-sec-label-text">' + section.label + '</span><i class="m-sec-rule"></i><span class="m-sec-chev" aria-hidden="true">&#8964;</span>';
        sec.appendChild(btn);
        sec.classList.add("open");

        var drawer = document.createElement("div");
        drawer.className = "m-drawer";
        var inner = document.createElement("div");
        inner.className = "m-drawer-in";
        inner.appendChild(grid);
        drawer.appendChild(inner);
        sec.appendChild(drawer);

        btn.addEventListener("click", function () {
          var open = sec.classList.toggle("open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
      } else {
        var lab = document.createElement("p");
        lab.className = "m-sec-label";
        lab.textContent = section.label;
        sec.appendChild(lab);
        sec.appendChild(grid);
      }

      section.items.forEach(function (item) {
        var card = document.createElement("article");
        card.dataset.item = item.id;
        card.tabIndex = 0;
        card.setAttribute("aria-haspopup", "dialog");
        card.setAttribute("aria-label", "View details for " + item.name);
        if (item.addon) {
          /* collections are the highlight pieces — brass frame,
             shimmer sweep; the flavor list lives in the detail sheet */
          card.className = "m-card m-card-collection m-shimmer";
          card.innerHTML =
            '<span class="m-card-tag">' + item.tag + " &middot; $" + priceForSlot(item.id) + "</span>" +
            '<h3 class="m-card-name">' + item.name + "</h3>" +
            '<p class="m-card-macros">' + item.note + "</p>" +
            stepperHTML(item.id);
        } else if (item.side) {
          /* breakfast rides imageless text cards */
          card.className = "m-card m-card-side";
          card.innerHTML =
            '<span class="m-card-tag">' + item.tag + "</span>" +
            '<h3 class="m-card-name">' + item.name + "</h3>" +
            '<p class="m-card-macros">' + item.cal + " cal &middot; " + item.protein + "g protein</p>" +
            stepperHTML(item.id);
        } else {
          card.className = "m-card";
          card.innerHTML =
            (SIMPLE && TASTING_MEAL_IDS.indexOf(item.id) !== -1 ? '<span class="g-badge">Fan favorite</span>' : "") +
            '<span class="m-card-img" style="background-image:url(\'' + item.img + "')\"></span>" +
            '<span class="m-card-tag">' + item.tag + "</span>" +
            '<h3 class="m-card-name">' + item.name + "</h3>" +
            '<p class="m-card-macros">' + item.cal + " cal &middot; " + item.protein + "g protein</p>" +
            stepperHTML(item.id);
        }
        card.addEventListener("keydown", function (e) {
          if (e.target !== card || (e.key !== "Enter" && e.key !== " ")) return;
          e.preventDefault();
          openDetail(item.id, card);
        });
        grid.appendChild(card);
        if (SIMPLE && section.meals && grid.childElementCount === 2) {
          var tc = document.createElement("article");
          tc.className = "g-taste";
          tc.id = "g-taste";
          tc.setAttribute("aria-labelledby", "g-taste-title");
          tc.innerHTML = tastingCardHTML().replace('class="g-taste-title"', 'class="g-taste-title" id="g-taste-title"');
          grid.appendChild(tc);
        }
      });

      mount.appendChild(sec);
    });

    /* stagger the shimmer so the two collections don't flash in sync */
    Array.prototype.forEach.call(document.querySelectorAll(".m-shimmer"), function (el, i) {
      el.style.setProperty("--shimmer-delay", (i * 1.1) + "s");
    });
  }

  renderMenuSections();

  /* ── selection state ────────────────────────────────────────── */
  function counts() {
    if (tastingOrder) {
      return { tasting: true, meals: 2, sides: 1, addons: 1, wellnessShots: 1, dateBalls: 0, subtotal: TASTING_PRICE, equivalents: 4, discount: 0, single: false, delivery: 0, gifts: false };
    }
    var meals = 0, sides = 0, addons = 0, subtotal = 0;
    Object.keys(qty).forEach(function (id) {
      var n = qty[id] || 0;
      if (!n) return;
      var it = ITEMS[id];
      if (it.addon) addons += n;
      else if (it.side) sides += n;
      else meals += n;
      subtotal += n * priceForSlot(id);
    });
    var wellnessShots = qty.wellness_shots || 0;
    var dateBalls = qty.date_balls || 0;
    var equivalents = meals + sides / 3 + addons;
    var discount = discountFor(meals, wellnessShots, dateBalls);
    /* MOCK: one meal on its own is a single tasting ($5 delivery); the
       tasting upgrade's chia and shots ride free once the week is 5 meals */
    var single = !!TASTING && !SIMPLE && meals === 1 && sides === 0 && addons === 0;
    var delivery = single ? SINGLE_DELIVERY : 0;
    var gifts = !!TASTING && tastingGifts && (SIMPLE || meals >= 5);
    /* g: toward the 4-meal minimum, 3 breakfast items count as 1 meal;
       shots don't count, and the coupons count meals only */
    var minEq = meals + Math.floor(sides / 3);
    return { minEq: minEq, meals: meals, sides: sides, addons: addons, wellnessShots: wellnessShots, dateBalls: dateBalls, subtotal: subtotal, equivalents: equivalents, discount: discount, single: single, delivery: delivery, gifts: gifts };
  }

  function setQty(id, n) {
    /* g: adding a meal to the Tasting Menu turns it into a week that keeps
       its two meals; the chia and shots stay free once it reaches 5 */
    var converted = false;
    var minBefore = counts().minEq;
    if (tastingOrder && n > (qty[id] || 0)) {
      tastingOrder = false;
      tastingPrev = null;
      tastingGifts = true;
      converted = true;
      /* g: the two meals stay at menu price (adding one of them makes it
         two); the chia and shots stay on the order, free */
      var kept = TASTING_MEAL_IDS;
      if (SIMPLE && kept.indexOf(id) !== -1) n += 1;
      kept.forEach(function (t) {
        if (!(qty[t] > 0) && t !== id) { qty[t] = 1; paintStepper(t); }
      });
    }
    qty[id] = Math.max(0, Math.min(20, n));
    paintStepper(id);
    if (SIMPLE && tastingGifts && !Object.keys(ITEMS).some(function (k) { return qty[k] > 0 && !ITEMS[k].side && !ITEMS[k].addon; })) tastingGifts = false;
    if (detailFor === id) { detailQtyEl.textContent = qty[id]; paintDetailFoot(); }
    refresh();
    if (converted && SIMPLE) {
      var left = 4 - counts().minEq;
      showToast("Now a weekly order. " + (left > 0 ? "Add " + left + " more " + (left === 1 ? "meal" : "meals") + " to reach the 4-meal minimum." : "It\u2019s ready to send."), undoToTasting);
    } else if (SIMPLE && minBefore < 4 && counts().minEq >= 4) {
      showToast("Minimum reached: your order is ready to send.");
    }
  }
  /* g: a short dock message with an Undo, for the one change a tap makes
     that the customer did not ask for in so many words */
  var toastTimer = null;
  function showToast(text, undo) {
    var t = document.getElementById("g-toast");
    if (!t) return;
    t.querySelector(".g-toast-txt").textContent = text;
    t.hidden = false;
    t._undo = undo;
    t.querySelector(".g-toast-undo").hidden = !undo;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 7000);
  }
  function undoToTasting() {
    Object.keys(qty).forEach(function (k) { if (qty[k]) { qty[k] = 0; paintStepper(k); } });
    tastingGifts = false;
    tastingOrder = true;
    refresh();
  }
  function paintStepper(id) {
    document.querySelectorAll('.m-stepper[data-id="' + id + '"]').forEach(function (st) {
      var has = qty[id] > 0;
      st.querySelector(".m-add").hidden = has;
      st.querySelector(".m-counter").hidden = !has;
      st.querySelector(".m-qty").textContent = qty[id];
      var card = st.closest(".m-card");
      if (card) card.classList.toggle("m-picked", has);
    });
  }

  document.addEventListener("click", function (e) {
    var st = e.target.closest(".m-stepper");
    if (st) {
      var id = st.dataset.id;
      if (e.target.closest(".m-add") || e.target.closest(".m-inc")) setQty(id, (qty[id] || 0) + 1);
      else if (e.target.closest(".m-dec")) setQty(id, (qty[id] || 0) - 1);
      return;
    }
    /* anywhere else on a card opens its detail sheet */
    var card = e.target.closest(".m-card");
    if (card && card.dataset.item) openDetail(card.dataset.item, card);
  });

  /* ── detail sheet — the card of record for one dish ──────────
     Paper card: ledger head, name beside a mounted (uncropped)
     print, a drawn brass rule, the macros set into a specimen
     band, dietary facts as marks, and a forest footer carrying
     the quantity. Sized to sit whole on the screen. */
  var detail = document.getElementById("m-detail");
  var detailBackdrop = document.getElementById("m-detail-backdrop");
  var detailFor = null;
  var detailTrigger = null;
  var detailOpenTimer = null;
  var detailClose = document.getElementById("m-detail-close");
  var detailQtyEl = document.getElementById("m-detail-qty");
  var dImg = document.getElementById("m-detail-img");
  var dTag = document.getElementById("m-detail-tag");
  var dPrice = document.getElementById("m-detail-price");
  var dName = document.getElementById("m-detail-name");
  var dDesc = document.getElementById("m-detail-desc");
  var dMacros = document.getElementById("m-detail-macros");
  var dUnder = document.getElementById("m-detail-under");
  var dTags = document.getElementById("m-detail-tags");
  var dFlavors = document.getElementById("m-detail-flavors");
  var dMods = document.getElementById("m-detail-mods");
  var dPills = document.getElementById("m-mod-pills");
  var dCustom = document.getElementById("m-custom-input");
  var dEach = document.getElementById("m-detail-each");
  var dBody = detail.querySelector(".m-detail-body");

  var MODS = ["Dairy free", "Gluten free", "Low carb", "No carb", "Extra protein (+$2)", "Extra carbs"];

  function openDetail(id, trigger) {
    var it = ITEMS[id];
    if (!it) return;
    detailFor = id;
    detailTrigger = trigger || document.activeElement;

    if (it.img) {
      dImg.hidden = false;
      dImg.style.backgroundImage = "url('" + it.img + "')";
    } else {
      dImg.hidden = true;
    }

    var price = priceForSlot(it.id);
    dTag.textContent = it.tag;
    dPrice.textContent = "$" + price;
    dEach.textContent = "$" + price + " each";
    dName.textContent = it.name;
    dDesc.textContent = it.desc || "";

    /* the specimen band — five columns, set in, ruled in brass */
    dMacros.innerHTML = "";
    if (it.cal) {
      var SPEC = [
        ["cal", it.cal, ""],
        ["protein", it.protein, "g"],
        ["fat", it.fat, "g"],
        ["fiber", it.fiber, "g"],
        ["net carbs", it.carbs, "g"]
      ];
      SPEC.forEach(function (m, i) {
        var cell = document.createElement("div");
        cell.className = "m-d-cell";
        cell.style.setProperty("--i", i);
        cell.innerHTML = "<b>" + m[1] + (m[2] ? "<i>" + m[2] + "</i>" : "") + "</b><span>" + m[0] + "</span>";
        dMacros.appendChild(cell);
      });
      dMacros.hidden = false;
      dMacros.setAttribute("aria-label", "Per serving: " + SPEC.map(function (m) {
        return m[1] + (m[2] === "g" ? " grams " : " ") + m[0];
      }).join(", "));
    } else {
      dMacros.hidden = true;
      dMacros.removeAttribute("aria-label");
    }
    detail.classList.toggle("no-macros", !it.cal);

    dTags.innerHTML = "";
    (it.diet || []).forEach(function (t) {
      var s = document.createElement("span");
      s.className = "m-diet-tag " + (t[1] === "allergen" ? "allergen" : "safe");
      s.textContent = t[0];
      dTags.appendChild(s);
    });
    dTags.hidden = !(it.diet && it.diet.length);
    dUnder.hidden = dTags.hidden && !it.cal;

    if (it.flavors) {
      dFlavors.hidden = false;
      dFlavors.innerHTML = "";
      it.flavors.forEach(function (f, i) {
        var row = document.createElement("div");
        row.className = "m-flavor-row";
        row.style.setProperty("--i", i);
        row.innerHTML = "<b>" + f[0] + "</b><span>" + f[1] + "</span>";
        dFlavors.appendChild(row);
      });
    } else {
      dFlavors.hidden = true;
    }

    /* Make-it mods apply to meals, not sides or collections */
    var modsApply = !it.side && !it.addon;
    dMods.hidden = !modsApply;
    if (modsApply) {
      dPills.innerHTML = "";
      var active = mods[id] || [];
      MODS.forEach(function (m) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "m-mod-pill" + (active.indexOf(m) !== -1 ? " on" : "");
        b.textContent = m;
        b.addEventListener("click", function () {
          var list = mods[id] = mods[id] || [];
          var i = list.indexOf(m);
          if (i === -1) list.push(m); else list.splice(i, 1);
          b.classList.toggle("on", i === -1);
          refresh();
        });
        dPills.appendChild(b);
      });
    }

    dCustom.value = notes[id] || "";
    detailQtyEl.textContent = qty[id] || 0;
    if (SIMPLE) {
      detail.classList.toggle("g-d-tasting", detailTasting);
      if (detailTasting) dPrice.textContent = "Tasting Menu";
      dMods.inert = detailTasting;
      detail.querySelector(".m-detail-custom").inert = detailTasting;
      var lock = document.getElementById("g-d-lock");
      if (!lock) {
        lock = document.createElement("p");
        lock.className = "g-d-lock";
        lock.id = "g-d-lock";
        lock.textContent = "Customizations not available on the Tasting Menu.";
        dMods.parentNode.insertBefore(lock, dMods);
      }
      lock.hidden = !detailTasting;
    }
    paintDetailFoot();
    if (dBody) dBody.scrollTop = 0;

    detail.hidden = false;
    detailBackdrop.hidden = false;
    if (detailOpenTimer) clearTimeout(detailOpenTimer);
    detailOpenTimer = setTimeout(function () {
      detail.classList.add("open");
      detailBackdrop.classList.add("open");
      detailOpenTimer = null;
    }, 20);
    document.body.style.overflow = "hidden";
    detailClose.focus({ preventScroll: true });
  }

  /* g: a first look wants an Add button, not a stepper sitting at zero */
  var dAdd = null;
  function paintDetailFoot() {
    if (!SIMPLE || !detailFor) return;
    var foot = detail.querySelector(".m-detail-foot");
    if (!dAdd) {
      dAdd = document.createElement("button");
      dAdd.type = "button";
      dAdd.className = "g-detail-add";
      dAdd.addEventListener("click", function () {
        if (!detailFor || detailTasting) return;
        setQty(detailFor, 1);
        var inc = document.getElementById("m-detail-inc");
        if (inc) inc.focus({ preventScroll: true });
      });
      foot.appendChild(dAdd);
    }
    var n = qty[detailFor] || 0;
    if (detailTasting) {
      dAdd.innerHTML = tastingOrder ? "Review your Tasting Menu" : "Order the Tasting Menu <span>&middot; $" + TASTING_PRICE + "</span>";
      dAdd.setAttribute("data-g-tasting", "");
    } else {
      dAdd.innerHTML = "Add to order <span>&middot; $" + priceForSlot(detailFor) + "</span>";
      dAdd.removeAttribute("data-g-tasting");
    }
    foot.classList.toggle("g-foot-empty", n === 0 || detailTasting);
  }

  function closeDetail() {
    if (detailOpenTimer) {
      clearTimeout(detailOpenTimer);
      detailOpenTimer = null;
    }
    detail.classList.remove("open");
    detailBackdrop.classList.remove("open");
    detail.hidden = true;
    detailBackdrop.hidden = true;
    document.body.style.overflow = "";
    detailFor = null;
    detailTasting = false;
    var trigger = detailTrigger;
    detailTrigger = null;
    if (trigger && trigger.isConnected && trigger.focus) trigger.focus({ preventScroll: true });
  }

  detailClose.addEventListener("click", closeDetail);
  detailBackdrop.addEventListener("click", closeDetail);
  document.getElementById("m-detail-inc").addEventListener("click", function () {
    if (detailFor) setQty(detailFor, (qty[detailFor] || 0) + 1);
  });
  document.getElementById("m-detail-dec").addEventListener("click", function () {
    if (detailFor) setQty(detailFor, (qty[detailFor] || 0) - 1);
  });
  dCustom.addEventListener("input", function () {
    if (detailFor) { notes[detailFor] = dCustom.value; refresh(); }
  });

  /* ── the dock: build/skip, then the order state machine ─────── */
  var bar = document.getElementById("m-bar");
  var zeroRow = document.getElementById("m-bar-zero");
  var liveRow = document.getElementById("m-bar-live-row");
  var buildBtn = document.getElementById("m-bar-build");
  var buildSub = document.getElementById("m-bar-build-sub");
  var barCount = document.getElementById("m-bar-count");
  var barTotal = document.getElementById("m-bar-total");
  var reviewBtn = document.getElementById("m-bar-review");

  function money(n) { return "$" + n; }

  /* "Build order text" is a guide, not a gate: it walks you to the
     first meals and tells you how to start. The glide is an interval
     tween — CSS smooth scrolling is rAF-driven and stalls in
     suspended preview panes. */
  var pageTween = null;
  function pageGlide(y) {
    if (pageTween) { clearInterval(pageTween); pageTween = null; }
    if (reducedMotion) { window.scrollTo({ top: y, behavior: "instant" }); return; }
    var from = window.scrollY, t0 = performance.now(), DUR = 420;
    pageTween = setInterval(function () {
      var k = Math.min(1, (performance.now() - t0) / DUR);
      var e = 1 - Math.pow(1 - k, 3);
      window.scrollTo({ top: from + (y - from) * e, behavior: "instant" });
      if (k >= 1) { clearInterval(pageTween); pageTween = null; }
    }, 16);
  }

  buildBtn.addEventListener("click", function () {
    var first = document.querySelector(".m-sec");
    if (first) pageGlide(first.getBoundingClientRect().top + window.scrollY - 86);
    buildSub.hidden = false;
    bar.classList.add("m-bar-hinting");
  });

  function refresh() {
    var c = counts();
    var any = c.meals + c.sides + c.addons > 0;
    zeroRow.hidden = any;
    liveRow.hidden = !any;
    bar.classList.toggle("m-bar-live", any);
    if (any) bar.classList.remove("m-bar-away");
    if (any) {
      var bits = [];
      if (c.meals) bits.push(c.meals + (c.meals === 1 ? " meal" : " meals"));
      if (c.sides) bits.push(c.sides + (c.sides === 1 ? " side" : " sides"));
      if (c.addons) bits.push(c.addons + (c.addons === 1 ? " collection" : " collections"));
      barCount.textContent = bits.join(" · ");
      var ready = c.equivalents >= 4 - 1e-9;
      var hint = "";
      if (c.single) {
        hint = " with delivery · add 3 for a week";
      } else if (tastingGifts && c.meals < 5) {
        hint = " · add " + (5 - c.meals) + " for $15 off";
      } else if (!ready) {
        var needMeals = Math.ceil(4 - c.equivalents - 1e-9);
        hint = " · add " + needMeals + " more";
      } else if (c.gifts) {
        hint = " · chia & shots free";
      } else {
        hint = promoHint(c);
      }
      barTotal.textContent = money(c.subtotal - c.discount + c.delivery) + (c.discount ? " after " + PROMO_LABELS[MODE] : "") + hint;
      /* with the ladder on screen it carries the credit and the next step */
      if (placed("e")) barTotal.textContent = money(c.subtotal - c.discount + c.delivery) + (c.single || c.discount ? " total" : "");
      bar.classList.toggle("m-bar-ready", ready);
      if (SIMPLE) {
        var total = c.subtotal - c.discount + c.delivery;
        var gBits = [];
        if (c.meals) gBits.push(c.meals + (c.meals === 1 ? " meal" : " meals"));
        if (c.sides) gBits.push(c.sides + " breakfast");
        if (c.addons) gBits.push(c.addons + (c.addons === 1 ? " shot set" : " shot sets"));
        if (c.gifts) gBits.push("free chia & shots");
        /* each piece stays whole; on a narrow phone the line wraps between them */
        barCount.innerHTML = c.tasting ? "Tasting Menu" : gBits.map(function (t, i) { return "<span>" + t + (i < gBits.length - 1 ? " \u00b7" : "") + "</span>"; }).join(" ");
        barTotal.textContent = c.tasting ? money(TASTING_PRICE) + " \u00b7 free delivery" :
          money(total) + (c.discount ? " after $" + c.discount + " off" : "");
        bar.classList.toggle("m-bar-ready", SIMPLE ? c.minEq >= 4 : c.meals >= 4);
      }
    }
    if (SIMPLE) renderNudge(c, any);
    renderLadders(c);
    renderSheet(c);
  }

  /* ── g · one sentence about the next step, and a quiet progress line ──
     Milestones: 4 meals is a week (free delivery), 5 is $15 off, 7 is $25. */
  function nextStep(c) {
    var need;
    if (c.tasting) return { say: "Tasting Menu \u00b7 free delivery", done: true };
    var toMin = SIMPLE ? c.minEq : c.meals;
    if (toMin < 4) {
      need = 4 - toMin;
      return { say: "Add " + need + " more " + (need === 1 ? "meal" : "meals") + (SIMPLE ? " to reach the 4-meal minimum" : " for a full week, delivered free"), need: need, week: false };
    }
    if (c.meals < 5) {
      need = 5 - c.meals;
      return { say: "Add " + need + " more " + (need === 1 ? "meal" : "meals") + " for $15 off" + (tastingGifts && !SIMPLE ? " + free chia & shots" : ""), need: need, week: true };
    }
    if (c.meals < 7) {
      need = 7 - c.meals;
      return { say: "$15 off" + (c.gifts && !SIMPLE ? " + free chia & shots" : "") + " \u00b7 add " + need + " more for $25 off", need: need, week: true };
    }
    return { say: "$25 off" + (c.gifts && !SIMPLE ? " + free chia & shots" : "") + " \u00b7 our best price", done: true, week: true };
  }
  function renderNudge(c, any) {
    var el = document.getElementById("g-nudge");
    if (!el) return;
    el.hidden = !any;
    if (!any) return;
    var step = nextStep(c);
    var say = step.say.charAt(0).toUpperCase() + step.say.slice(1);
    var ready = SIMPLE && !c.tasting && step.week;
    el.querySelector(".g-nudge-txt").innerHTML = (ready ? '<b class="g-nudge-ok">\u2713 Ready to send</b>' : "") + "<span>" + say + "</span>";
    var fill = c.tasting ? 1 : Math.min(1, c.meals / 7);
    el.querySelector(".g-nudge-fill").style.width = (fill * 100).toFixed(1) + "%";
    el.classList.toggle("g-nudge-tasting", !!c.tasting);
  }

  /* ── MOCK · E: the order ladder, in the dock and the review sheet ──
     Four stops on one track: what each meal count earns. */
  var STOPS = [
    { at: 1, top: "1 meal", sub: "+$5 delivery" },
    { at: 4, top: "4 meals", sub: "full week" },
    { at: 5, top: "5 meals", sub: "$15 off" },
    { at: 7, top: "7 meals", sub: "$25 off" }
  ];
  function ladderFill(m) {
    if (m <= STOPS[0].at) return 0;
    for (var i = 1; i < STOPS.length; i++) {
      if (m <= STOPS[i].at) {
        var a = STOPS[i - 1].at, b = STOPS[i].at;
        return ((i - 1) + (m - a) / (b - a)) / (STOPS.length - 1);
      }
    }
    return 1;
  }
  function renderLadders(c) {
    if (!placed("e")) return;
    var m = c.meals;
    var on = -1, next = -1;
    STOPS.forEach(function (st, i) { if (m >= st.at) on = i; });
    if (on < STOPS.length - 1) next = on + 1;
    var says = m + (m === 1 ? " meal" : " meals") +
      (next !== -1 ? ". Add " + (STOPS[next].at - m) + " for " + STOPS[next].sub : ". Top credit reached");
    Array.prototype.forEach.call(document.querySelectorAll(".m-ladder"), function (lad) {
      lad.setAttribute("aria-label", "Order ladder: " + says);
      var html = '<div class="m-ladder-track" aria-hidden="true"><span style="width:' +
        (ladderFill(m) * 100).toFixed(1) + '%"></span></div><ol class="m-ladder-stops">';
      STOPS.forEach(function (st, i) {
        var cls = i === on ? "on" : i < on ? "done" : i === next ? "next" : "";
        /* the next stop swaps its count for what it takes: "add 2 / $15 off" */
        var top = i === next ? "add " + (st.at - m) : st.top;
        html += '<li class="' + cls + '"><i aria-hidden="true"></i><b>' + top + "</b><span>" + st.sub + "</span></li>";
      });
      lad.innerHTML = html + "</ol>";
    });
  }

  /* ── draft sheet ────────────────────────────────────────────── */
  var sheet = document.getElementById("m-sheet");
  var backdrop = document.getElementById("m-sheet-backdrop");
  var bubble = document.getElementById("m-compose-bubble");
  var rItems = document.getElementById("m-r-items");
  var rSub = document.getElementById("m-r-sub");
  var rOfferRow = document.getElementById("m-r-offer-row");
  var rOfferLabel = document.getElementById("m-r-offer-label");
  var rOffer = document.getElementById("m-r-offer");
  var rTotal = document.getElementById("m-r-total");
  var gate = document.getElementById("m-gate");
  var sendBtn = document.getElementById("m-send");
  /* Existing members are already opted in. No acquisition token is minted or
     registered from this ordering surface. The one exception is a paid
     retention URL: it gets a dedicated attribution-only token that does not
     trigger signup welcomes or Meta Lead optimization. */
  var orderBody = "";
  var smsNumber = (window.HAVN_CONFIG && window.HAVN_CONFIG.SMS_NUMBER) || "+12245370344";
  var retentionAttribution = window.HAVN_INTAKE ?
    window.HAVN_INTAKE.attribution() : {};
  var retentionCampaign = String(retentionAttribution.utm_campaign || "");
  var retentionEnabled = /^(retention_[a-z0-9]+|sms_[a-z0-9]+)_(dc|sd)$/i.test(retentionCampaign);
  var retentionToken = retentionEnabled && window.HAVN_INTAKE ?
    window.HAVN_INTAKE.mintToken() : "";
  var retentionRegistrationStarted = false;
  /* Tagged return visits carry an attribution-only code. Fixed Tasting
     opening sentences stay intact so HQ still applies the approved offer. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-skip-direct]"), function (link) {
    link.href = "sms:" + smsNumber + "?&body=" + encodeURIComponent("Skip");
  });

  function orderLines() {
    var lines = [];
    SECTIONS.forEach(function (s) {
      s.items.forEach(function (it) {
        var n = qty[it.id] || 0;
        if (n) lines.push(n + " " + it.name);
      });
    });
    return lines;
  }

  /* dietary pills + free text per picked dish, menu.havnclub.com style */
  function noteLines() {
    var out = [];
    SECTIONS.forEach(function (s) {
      s.items.forEach(function (it) {
        if (!(qty[it.id] > 0)) return;
        var parts = (mods[it.id] || []).slice();
        var free = (notes[it.id] || "").trim();
        if (free) parts.push(free);
        if (parts.length) out.push(it.name + ": " + parts.join(", ").toLowerCase());
      });
    });
    return out;
  }

  function renderSheet(c) {
    c = c || counts();
    var lines = orderLines();
    var extra = noteLines();

    /* Compose the body FIRST. This used to happen at the end of the
       function, after the bubble had already been drawn, so the preview
       rendered the PREVIOUS state — add a note and the bubble showed the
       order without it while the send carried it. Zeshan's shape: the
       dishes, then a blank line, then the window and container, then
       notes. The greeting and the code live in the DRAFTS template, not
       here — this is only {body}. */
    var blocks = [];
    if (c.tasting) lines = ["Tasting Menu"].concat(tastingLines());
    if (c.single) lines.unshift("One meal tasting");
    /* g: the free chia and shots ride on the code, not in the text; the
       preview still names them so the customer sees what they get */
    var giftLine = SIMPLE ? "+ free " + TASTING_EXTRA_IDS.map(function (id) { return ITEMS[id].name.replace(" Collection", ""); }).join(" & ") + " (Tasting Menu upgrade)" : "+ free chia and wellness shots (tasting upgrade)";
    var previewLines = c.gifts ? lines.concat([giftLine]) : lines;
    if (c.gifts && !SIMPLE) lines = previewLines;
    if (lines.length) {
      blocks.push(lines.join("\n"));
      blocks.push(delWindow + "\n" + container + " containers");
      if (extra.length) blocks.push("Notes:\n" + extra.join("\n"));
    }
    orderBody = blocks.join("\n\n");
    var outgoingOrder = orderBody;
    if (SIMPLE && lines.length) {
      /* g: the opening sentence says which flow this is: a Tasting Menu
         upgrade ("first week": chia + shots added free by HQ) or a regular
         order. Keep these exact: HQ's parser matches them. */
      outgoingOrder = (c.gifts ? "Hi Chef, Here\u2019s my first week:" : "Hi Chef, Here\u2019s my order:") + "\n\n" + orderBody;
    }
    if (retentionEnabled && retentionToken) {
      outgoingOrder = window.HAVN_INTAKE.draftBody(
        retentionToken,
        "{body}\n\n({token})",
        outgoingOrder
      );
    }
    if (window.HAVN_MAIN_TASTING && window.HAVN_MAIN_TASTING.body) outgoingOrder = window.HAVN_MAIN_TASTING.body(outgoingOrder);
    sendBtn.href = "sms:" + smsNumber + "?&body=" + encodeURIComponent(outgoingOrder);

    /* The preview is a SUMMARY of what they picked — the meals and the
       container type — not a mirror of the outgoing text (Zeshan's call).
       The greeting, the code, the delivery window and any notes still go
       out in the message; they just don't need repeating on screen, where
       the window is already a picker two inches below.
       Rendered as text with white-space:pre-wrap so the blank line lands. */
    bubble.innerHTML = "";
    if (!lines.length) {
      bubble.innerHTML = "<span class='m-compose-empty'>Your meal selections will appear here</span>";
    } else {
      bubble.textContent = previewLines.join("\n") + "\n\n" + container + " containers";
    }

    var bits = [];
    if (c.meals) bits.push(c.meals + (c.meals === 1 ? " meal" : " meals"));
    if (c.sides) bits.push(c.sides + (c.sides === 1 ? " side" : " sides"));
    if (c.addons) bits.push(c.addons + (c.addons === 1 ? " collection" : " collections"));
    rItems.textContent = c.tasting ? "Tasting Menu" : bits.length ? bits.join(" · ") : "0 meals";
    rSub.textContent = money(c.subtotal);
    rOfferRow.hidden = !c.discount;
    if (rOfferLabel && PROMO_LABELS[MODE]) rOfferLabel.textContent = PROMO_LABELS[MODE];
    rOffer.innerHTML = "&ndash;" + money(c.discount);
    rTotal.textContent = money(Math.max(0, c.subtotal - c.discount + c.delivery));
    var giftRow = document.getElementById("m-r-gift-row");
    var delivRow = document.getElementById("m-r-deliv-row");
    /* after the upgrade the gift stays on the receipt, pending until 5 meals */
    if (giftRow) {
      giftRow.hidden = !(TASTING && tastingGifts);
      giftRow.lastElementChild.textContent = c.gifts ? "Free" : "Free at 5 meals";
      if (SIMPLE && c.gifts) giftRow.lastElementChild.innerHTML = "<s>$" + TASTING_EXTRA_IDS.reduce(function (t, id) { return t + priceForSlot(id); }, 0) + "</s> Free";
    }
    if (delivRow) delivRow.hidden = !TASTING;
    var delivAmt = document.getElementById("m-r-deliv");
    if (delivAmt) delivAmt.textContent = c.delivery ? money(c.delivery) : "Free";

    var short = 4 - c.equivalents;
    gate.classList.remove("m-gate-info");
    if (c.single) {
      /* MOCK: one meal goes out as a single tasting */
      gate.hidden = false;
      gate.classList.add("m-gate-info");
      gate.innerHTML = "One meal as a tasting: $25 + <b>$5 delivery</b>. " +
        "Add 3 more for a weekly order, and delivery is free.";
      sendBtn.classList.remove("m-send-off");
    } else if (c.meals + c.sides + c.addons > 0 && short > 1e-9) {
      var needMeals = Math.ceil(short - 1e-9);
      gate.hidden = false;
      gate.innerHTML = "Almost there! The minimum is four meals. Add <b>" +
        needMeals + " more " + (needMeals === 1 ? "meal" : "meals") + "</b> (or 3 sides = 1 meal).";
      if (TASTING) {
        gate.innerHTML = "The weekly minimum is 4 meals. Add <b>" + needMeals + " more</b>, " +
          "or try the Tasting Menu: two top meals, a chia and shots for $60." +
          '<button type="button" class="m-gate-taste" data-open-tasting>See the Tasting Menu</button>';
      }
      sendBtn.classList.add("m-send-off");
    } else {
      gate.hidden = true;
      sendBtn.classList.toggle("m-send-off", !lines.length);
    }

    if (SIMPLE) renderSimpleGate(c);

    /* Pending-menu mode wins over everything above: drafting stays live,
       the send itself is paused until the new menu is published. */
    if (pendingMode) {
      sendBtn.classList.add("m-send-off");
      sendBtn.removeAttribute("href");
      sendBtn.textContent = "Ordering opens when the new menu drops";
    }

  }

  /* g: the review sheet is the one checkout. Its note says one thing: what
     this order is, or the single step that makes it better. */
  function renderSimpleGate(c) {
    var step = nextStep(c);
    var any = c.meals + c.sides + c.addons > 0;
    var html = "", info = true, canSend = any;
    if (c.tasting) {
      html = "Rather have a full week? Add 2 or more meals and this becomes a weekly order: meals at menu price, and your chia and shots stay free. Add 3 and you also get $15 off." +
        '<span class="g-gate-btns"><button type="button" class="g-gate-btn" data-g-browse>Browse the menu</button>' +
        (tastingPrev ? '<button type="button" class="g-gate-btn" data-g-restore>Back to my picks</button>' : "") + "</span>";
    } else if (any && !step.week && step.need) {
      info = false;
      canSend = false;
      var bLeft = c.sides % 3 ? 3 - c.sides % 3 : 0;
      html = "A week starts at 4 meals." +
        (c.sides ? " 3 breakfast items count as 1 meal." : "") +
        (c.addons ? " Wellness Shots don\u2019t count toward the minimum." : "") +
        (c.gifts || c.sides ? " Add " + step.need + " more " + (step.need === 1 ? "meal" : "meals") + (step.need === 1 && bLeft ? ", or " + bLeft + " more breakfast," : "") + " to reach the minimum." : "") +
        (c.gifts ? "" : " Not ready for that many? The Tasting Menu is our two fan favorites, a chia pudding and wellness shots for $" + TASTING_PRICE + ".") +
        '<span class="g-gate-btns"><button type="button" class="g-gate-btn" data-g-tasting>' + (c.gifts ? "Back to the Tasting Menu" : "Switch to the Tasting Menu") + "</button></span>";
    } else if (any && step.week) {
      /* past the minimum: say plainly it can go, then the next saving */
      var off = c.meals >= 7 ? "$25 off, our best price" : c.meals >= 5 ? "$15 off" : "";
      html = '<b class="g-gate-ok">\u2713 Ready to send' + (off ? ", with " + off : "") + ".</b>" +
        (c.meals < 4 ? " Your breakfast counts toward the minimum: 3 breakfast items = 1 meal." : "") +
        (step.done ? "" : " Add " + step.need + " more " + (step.need === 1 ? "meal" : "meals") + " for " + (c.meals >= 5 ? "$25" : "$15") + " off, or send it as is." +
        '<span class="g-gate-btns"><button type="button" class="g-gate-btn" data-g-browse>Add a meal</button></span>');
    }
    var tb = document.getElementById("g-tb");
    if (tb) {
      tb.hidden = !c.tasting;
      document.querySelector("#m-sheet .m-compose").hidden = !!c.tasting;
      document.querySelector("#m-sheet .m-receipt").hidden = !!c.tasting;
    }
    /* the sheet's own words for the cart, and the extras note where it shows */
    var rb = [];
    if (c.meals) rb.push(c.meals + (c.meals === 1 ? " meal" : " meals"));
    if (c.sides) rb.push(c.sides + " breakfast");
    if (c.addons) rb.push(c.addons + (c.addons === 1 ? " shot set" : " shot sets"));
    if (!c.tasting) rItems.textContent = rb.join(" \u00b7 ") || "0 meals";
    var pn = document.querySelector(".g-sheet-foot .m-pay-note");
    if (pn) pn.textContent = !canSend && (c.sides || c.addons)
      ? (c.sides ? "3 breakfast items count as 1 meal. " : "") + (c.addons ? "Wellness Shots don\u2019t count." : "")
      : "You pay nothing now. We text back to confirm.";
    gate.hidden = !html;
    gate.classList.toggle("m-gate-info", info);
    gate.innerHTML = html;
    sendBtn.classList.toggle("m-send-off", !canSend);
    sendBtn.textContent = canSend ? "Send Order Text \u00b7 " + money(c.tasting ? TASTING_PRICE : Math.max(0, c.subtotal - c.discount + c.delivery)) : "Add " + (step.need || 0) + " more " + (step.need === 1 ? "meal" : "meals");
    /* blocked, the footer button is still the way forward: back to the menu */
    var browse = any && !canSend;
    sendBtn.classList.toggle("g-send-browse", browse);
    if (browse) sendBtn.setAttribute("data-g-browse", ""); else sendBtn.removeAttribute("data-g-browse");
    if (c.tasting) sendBtn.href = "sms:" + smsNumber + "?&body=" + encodeURIComponent(tastingBody());
  }

  function openSheet() {
    sheet.hidden = false;
    backdrop.hidden = false;
    setTimeout(function () { sheet.classList.add("open"); backdrop.classList.add("open"); }, 20);
    document.body.style.overflow = "hidden";
  }
  function closeSheet() {
    sheet.classList.remove("open");
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () { sheet.hidden = true; backdrop.hidden = true; }, 380);
  }

  reviewBtn.addEventListener("click", openSheet);
  document.getElementById("m-sheet-close").addEventListener("click", closeSheet);
  backdrop.addEventListener("click", closeSheet);
  document.addEventListener("keydown", function (e) {
    if (!detail.hidden) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDetail();
        return;
      }
      if (e.key === "Tab") {
        var focusable = Array.prototype.filter.call(
          detail.querySelectorAll('button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
          function (el) { return !el.hidden && el.getClientRects().length > 0; }
        );
        if (!focusable.length) {
          e.preventDefault();
          detail.focus();
          return;
        }
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && (document.activeElement === first || !detail.contains(document.activeElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (taste && !taste.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeTaste(); return; }
      if (e.key === "Tab") trapTab(e, taste);
      return;
    }
    if (e.key === "Escape" && !sheet.hidden) closeSheet();
  });

  function trapTab(e, box) {
    var focusable = Array.prototype.filter.call(
      box.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (el) { return !el.hidden && el.getClientRects().length > 0; }
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || !box.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !box.contains(document.activeElement))) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ── MOCK · the Tasting Menu sheet ──────────────────────────────
     Two tabs: the fixed Tasting Menu, sent as its own text, and one meal. The upgrade moves its two meals
     into a weekly draft and keeps the chia and shots free at 5 meals. */
  var taste = document.getElementById("m-taste");
  var tasteBackdrop = document.getElementById("m-taste-backdrop");
  var tasteTrigger = null;
  var tasteTimer = null;

  function tastingLines() {
    return TASTING_MEAL_IDS.concat(TASTING_EXTRA_IDS).map(function (id) { return ITEMS[id] ? ITEMS[id].name : id; });
  }
  function tastingBody() {
    var body = tastingBodyOriginal();
    return window.HAVN_MAIN_TASTING && window.HAVN_MAIN_TASTING.body ? window.HAVN_MAIN_TASTING.body(body) : body;
  }
  function tastingBodyOriginal() {
    /* "1 " quantities: HQ's parser reads the same "N Dish" lines as orders */
    var text = SIMPLE ? "Hi Chef, I\u2019d like the Tasting Menu:\n\n" +
      tastingLines().map(function (n) { return "1 " + n; }).join("\n") + "\n\n" + delWindow + "\n" + container + " containers" :
      "Tasting Menu\n" + tastingLines().join("\n") + "\n\n" + delWindow + "\n" + container + " containers";
    return retentionEnabled && retentionToken ? window.HAVN_INTAKE.draftBody(retentionToken, "{body}\n\n({token})", text) : text;
  }
  function renderTaste() {
    if (!taste) return;
    var list = document.getElementById("m-taste-items");
    if (list && !list.childElementCount) {
      TASTING_MEAL_IDS.concat(TASTING_EXTRA_IDS).forEach(function (id) {
        var it = ITEMS[id];
        if (!it) return;
        var li = document.createElement("li");
        var isMeal = TASTING_MEAL_IDS.indexOf(id) !== -1;
        var pick = TASTING_PICKS.filter(function (m) { return m.id === id; })[0];
        var sub = isMeal ? "Top seller · " + pick.protein.charAt(0).toUpperCase() + pick.protein.slice(1) : it.addon ? "Four 2-oz shots" : "Breakfast";
        li.innerHTML = (it.img
          ? '<span class="m-taste-thumb" style="background-image:url(\'' + it.img + '\')"></span>'
          : '<span class="m-taste-thumb m-taste-thumb-mark" aria-hidden="true">' + (it.addon ? "4&times;" : "&#9670;") + "</span>") +
          '<span class="m-taste-txt"><b>' + it.name + "</b><i>" + sub + "</i></span>" +
          '<span class="m-taste-val">$' + priceForSlot(id) + "</span>";
        list.appendChild(li);
      });
    }
    var bub = document.getElementById("m-taste-bubble");
    if (bub) bub.textContent = "Tasting Menu\n" + tastingLines().join("\n") + "\n\n" + container + " containers";
    var send = document.getElementById("m-taste-send");
    if (send) send.href = "sms:" + smsNumber + "?&body=" + encodeURIComponent(tastingBody());
  }
  function tasteTab(which) {
    Array.prototype.forEach.call(taste.querySelectorAll("[data-taste-tab]"), function (b) {
      var onTab = b.getAttribute("data-taste-tab") === which;
      b.setAttribute("aria-selected", onTab ? "true" : "false");
      b.tabIndex = onTab ? 0 : -1;
      document.getElementById(b.getAttribute("aria-controls")).hidden = !onTab;
    });
  }
  function openTaste(trigger) {
    if (!taste) return;
    if (!sheet.hidden) closeSheet();
    tasteTrigger = trigger || document.activeElement;
    renderTaste();
    tasteTab(trigger && trigger.getAttribute("data-open-tasting") === "one" ? "one" : "menu");
    taste.hidden = false;
    tasteBackdrop.hidden = false;
    if (tasteTimer) clearTimeout(tasteTimer);
    tasteTimer = setTimeout(function () {
      taste.classList.add("open");
      tasteBackdrop.classList.add("open");
      tasteTimer = null;
    }, 20);
    document.body.style.overflow = "hidden";
    document.getElementById("m-taste-close").focus({ preventScroll: true });
  }
  function closeTaste(restoreFocus) {
    if (!taste || taste.hidden) return;
    if (tasteTimer) { clearTimeout(tasteTimer); tasteTimer = null; }
    taste.classList.remove("open");
    tasteBackdrop.classList.remove("open");
    taste.hidden = true;
    tasteBackdrop.hidden = true;
    document.body.style.overflow = "";
    var t = tasteTrigger;
    tasteTrigger = null;
    if (restoreFocus === false) return;
    if (!(t && t.isConnected && t.getClientRects().length && !t.closest("[hidden]"))) t = liveRow.hidden ? buildBtn : reviewBtn;
    t.focus({ preventScroll: true });
  }
  function glideToMenu() {
    var first = document.querySelector(".m-sec");
    if (first) pageGlide(first.getBoundingClientRect().top + window.scrollY - 86);
  }
  if (taste && TASTING) {
    document.getElementById("m-taste-close").addEventListener("click", function () { closeTaste(); });
    tasteBackdrop.addEventListener("click", function () { closeTaste(); });
    Array.prototype.forEach.call(taste.querySelectorAll("[data-taste-tab]"), function (b) {
      b.addEventListener("click", function () { tasteTab(b.getAttribute("data-taste-tab")); });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        var other = taste.querySelector('[data-taste-tab]:not([aria-selected="true"])');
        tasteTab(other.getAttribute("data-taste-tab"));
        other.focus();
      });
    });
    document.getElementById("m-taste-one").addEventListener("click", function () {
      singleIntent = true;
      closeTaste(false);
      buildSub.textContent = "Tap Add on the one meal you want";
      buildSub.hidden = false;
      bar.classList.add("m-bar-hinting");
      glideToMenu();
      var firstAdd = document.querySelector(".m-sec .m-add");
      if (firstAdd) firstAdd.focus({ preventScroll: true });
    });
    document.getElementById("m-taste-upgrade").addEventListener("click", function () {
      tastingGifts = true;
      closeTaste(false);
      TASTING_MEAL_IDS.forEach(function (id) { if (!(qty[id] > 0)) setQty(id, 1); });
      refresh();
      glideToMenu();
      reviewBtn.focus({ preventScroll: true });
    });
    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-open-tasting]");
      if (opener) { e.preventDefault(); openTaste(opener); return; }
      if (e.target.closest("[data-start-week]")) glideToMenu();
    });
  }

  /* ── g · the page around the menu ─────────────────────────────── */
  (function mountSimple() {
    if (!SIMPLE) return;
    /* masthead: a greeting, three steps, the credit in one line */
    /* "You're in." reads as one line */
    var headTitle = document.getElementById("m-head-title");
    var br = headTitle && headTitle.querySelector("br");
    if (br) br.replaceWith(" ");
    var howto = document.getElementById("m-howto");
    if (howto) howto.hidden = true;
    var sub = document.getElementById("m-quiz-sub");
    if (sub) sub.textContent = "Here\u2019s this week\u2019s menu: chef-made, high-protein meals, delivered in glass.";
    var steps = document.createElement("ol");
    steps.className = "g-steps";
    steps.setAttribute("aria-label", "How it works");
    steps.innerHTML = "<li><i>1</i><b>Try the Tasting Menu, or choose 4+ meals</b><span>Tap any meal for details and customizations.</span></li>" +
      "<li><i>2</i><b>Click Send Order Text</b><span>Order text drafted below.</span></li>" +
      "<li><i>3</i><b>Pay after confirmation</b></li>";
    /* the welcome credit keeps its brass ribbon; the steps follow it */
    var head = document.querySelector(".m-head");
    head.appendChild(steps);
    /* the menu intro: what week, and the one instruction */
    var introTitle = document.querySelector(".m-intro-title");
    if (introTitle) introTitle.hidden = true;
    var intro = document.querySelector(".m-intro");
    if (intro) intro.classList.add("g-intro");

    /* dock: no Skip for a first visit; empty, it points at the Tasting Menu */
    Array.prototype.forEach.call(document.querySelectorAll(".m-bar-skip, .m-sheet-skip"), function (el) { el.hidden = true; el.style.display = "none"; });
    zeroRow.innerHTML = '<button type="button" class="g-bar-taste" data-g-card><span><b>New here?</b> Try the Tasting Menu</span><i>$' + TASTING_PRICE + " &rsaquo;</i></button>";
    reviewBtn.textContent = "Review order";
    var nudge = document.createElement("div");
    nudge.className = "g-nudge";
    nudge.id = "g-nudge";
    nudge.hidden = true;
    nudge.innerHTML = '<p class="g-nudge-txt" aria-live="polite"></p><div class="g-nudge-bar" aria-hidden="true"><span class="g-nudge-fill"></span><i style="left:57.1%"></i><i style="left:71.4%"></i></div>';
    liveRow.parentNode.insertBefore(nudge, liveRow);
    document.querySelector("#m-sheet .m-sheet-label").textContent = "Your order";
    /* the Tasting Menu order shows what each item costs and what it saves */
    var tb = document.createElement("div");
    tb.className = "g-tb";
    tb.id = "g-tb";
    tb.hidden = true;
    var tbValue = 0;
    var tbRows = TASTING_MEAL_IDS.concat(TASTING_EXTRA_IDS).map(function (id) {
      var it = ITEMS[id] || { name: id };
      var price = priceForSlot(id);
      tbValue += price;
      var isMeal = TASTING_MEAL_IDS.indexOf(id) !== -1;
      var sub = isMeal ? "Fan favorite" : id === "wellness_shots" ? "Four 2-oz shots" : "Breakfast";
      return "<li>" + (it.img
        ? '<span class="m-taste-thumb" style="background-image:url(\'' + it.img + '\')"></span>'
        : '<span class="m-taste-thumb m-taste-thumb-mark" aria-hidden="true">' + (id === "wellness_shots" ? "4&times;" : "&#9670;") + "</span>") +
        '<span class="m-taste-txt"><b>' + it.name.replace(" Collection", "") + "</b><i>" + sub + "</i></span>" +
        '<span class="g-tb-val">$' + price + "</span></li>";
    }).join("");
    var tbSave = tbValue - TASTING_PRICE;
    tb.innerHTML =
      '<div class="g-tb-head"><h3 class="g-tb-title">The <em>Tasting Menu</em></h3><span class="g-tb-save">You save $' + tbSave + "</span></div>" +
      '<ul class="m-taste-items g-tb-items">' + tbRows + "</ul>" +
      '<ul class="g-tb-sum">' +
        "<li><span>Items</span><i></i><span>$" + tbValue + "</span></li>" +
        '<li class="g-tb-off"><span>Tasting Menu discount</span><i></i><span>&minus;$' + (tbValue - TASTING_PRICE) + "</span></li>" +
        '<li class="g-tb-off"><span>Delivery</span><i></i><span>Free</span></li>' +
        '<li class="g-tb-total"><span>Total</span><i></i><span>$' + TASTING_PRICE + "</span></li>" +
      "</ul>";
    var sheetLabel = document.querySelector("#m-sheet .m-sheet-label");
    sheetLabel.parentNode.insertBefore(tb, sheetLabel.nextSibling);
    /* the send and the total stay on screen at the foot of the sheet */
    var foot = document.createElement("div");
    foot.className = "g-sheet-foot";
    var payNote = document.querySelector("#m-sheet .m-pay-note");
    payNote.textContent = "You pay nothing now. We text back to confirm.";
    sendBtn.parentNode.insertBefore(foot, sendBtn);
    foot.appendChild(payNote);
    foot.appendChild(sendBtn);
    var toast = document.createElement("div");
    toast.className = "g-toast";
    toast.id = "g-toast";
    toast.hidden = true;
    toast.setAttribute("role", "status");
    toast.innerHTML = '<p class="g-toast-txt"></p><button type="button" class="g-toast-undo">Undo</button>';
    toast.querySelector("button").addEventListener("click", function () {
      toast.hidden = true;
      if (toast._undo) toast._undo();
    });
    bar.insertBefore(toast, bar.firstChild);

    /* the dock waits until the masthead scrolls away */
    /* ...and, while the cart is empty, while the Tasting Menu card is on
       screen, so the dock never repeats the card right under it */
    if ("IntersectionObserver" in window) {
      var headIn = true, cardIn = false;
      var syncAway = function () {
        bar.classList.toggle("m-bar-away", (headIn || cardIn) && !bar.classList.contains("m-bar-live"));
      };
      bar.classList.add("m-bar-away");
      new IntersectionObserver(function (entries) {
        headIn = entries[0].isIntersecting;
        syncAway();
      }, { rootMargin: "0px 0px -35% 0px" }).observe(head);
      var tasteCard = document.getElementById("g-taste");
      if (tasteCard) new IntersectionObserver(function (entries) {
        cardIn = entries[0].isIntersecting;
        syncAway();
      }, { rootMargin: "0px 0px -20% 0px" }).observe(tasteCard);
    }

    function chooseTasting() {
      var had = Object.keys(qty).filter(function (id) { return qty[id] > 0; });
      tastingPrev = had.length ? JSON.parse(JSON.stringify(qty)) : null;
      had.forEach(function (id) { qty[id] = 0; paintStepper(id); });
      tastingGifts = false;
      tastingOrder = true;
      refresh();
      if (sheet.hidden) openSheet();
    }
    document.addEventListener("click", function (e) {
      var dt = e.target.closest("[data-g-detail]");
      if (dt) { detailTasting = true; openDetail(dt.getAttribute("data-g-detail"), dt); return; }
      if (e.target.closest("[data-g-tasting]")) {
        e.preventDefault();
        if (detailFor) closeDetail();
        if (tastingOrder) { if (sheet.hidden) openSheet(); return; }
        chooseTasting();
        return;
      }
      if (e.target.closest("[data-g-restore]")) {
        var prev = tastingPrev;
        tastingOrder = false;
        tastingPrev = null;
        Object.keys(prev || {}).forEach(function (id) { qty[id] = prev[id]; paintStepper(id); });
        refresh();
        return;
      }
      if (e.target.closest("[data-g-browse]")) { closeSheet(); glideToMenu(); return; }
      if (e.target.closest("[data-g-card]")) {
        var card = document.getElementById("g-taste");
        if (card) pageGlide(card.getBoundingClientRect().top + window.scrollY - 90);
      }
    });
    refresh();
  })();

  /* ── MOCK · the placements ─────────────────────────────────── */
  (function mountPlacements() {
    if (!TASTING) return;
    var m1 = ITEMS[TASTING_MEAL_IDS[0]], m2 = ITEMS[TASTING_MEAL_IDS[1]];
    if (placed("b")) {
      /* B · a quiet third action in the dock, empty state only */
      var row = document.createElement("button");
      row.type = "button";
      row.className = "m-bar-taste";
      row.setAttribute("data-open-tasting", "");
      row.innerHTML = "<span>Try the <b>Tasting Menu</b></span><i>from $30 &rsaquo;</i>";
      zeroRow.parentNode.insertBefore(row, zeroRow);
    }
    if (placed("c")) {
      /* C · the Tasting Menu as the last section of the menu */
      var sec = document.createElement("section");
      sec.className = "m-sec m-taste-sec";
      sec.innerHTML =
        '<p class="m-sec-label">Not ready for a week?</p>' +
        '<div class="m-grid m-grid-collections">' +
        '<article class="m-card m-card-collection m-taste-card m-shimmer">' +
        '<div class="m-taste-card-imgs" aria-hidden="true">' +
        "<span style=\"background-image:url('" + m1.img + "')\"></span>" +
        "<span style=\"background-image:url('" + m2.img + "')\"></span></div>" +
        '<span class="m-card-tag">First order only &middot; $60 <s>$85</s></span>' +
        '<h3 class="m-card-name">The Tasting Menu</h3>' +
        '<p class="m-card-macros">' + m1.name + ", " + m2.name + ", a chia pudding and a set of wellness shots. Free delivery.</p>" +
        '<button type="button" class="m-add" data-open-tasting>See the Tasting Menu<i>&rsaquo;</i></button>' +
        '<p class="m-taste-card-one">Just want one? <button type="button" data-open-tasting="one">Any meal for $30 &rsaquo;</button></p>' +
        "</article></div>";
      mount.appendChild(sec);
    }
    if (placed("d")) {
      /* D · two ways to start, right under the offer */
      var start = document.createElement("div");
      start.className = "m-start";
      start.setAttribute("role", "group");
      start.setAttribute("aria-labelledby", "m-start-label");
      start.innerHTML =
        '<p class="m-start-label" id="m-start-label">Two ways to start</p>' +
        '<div class="m-start-grid">' +
        '<button type="button" class="m-start-card m-start-week" data-start-week>' +
        '<span class="m-start-kicker">A full week</span><b>4+ meals</b>' +
        "<span>Pick from the whole menu. Free delivery.</span><i>Build my week &rsaquo;</i></button>" +
        '<button type="button" class="m-start-card m-start-taste" data-open-tasting>' +
        '<span class="m-start-kicker">Just a taste</span><b>Tasting Menu</b>' +
        "<span>2 top meals, chia + shots for $60. Or one meal, $30.</span><i>See the tasting &rsaquo;</i></button>" +
        "</div>";
      var ribbon = document.querySelector(".m-ribbon");
      ribbon.parentNode.insertBefore(start, ribbon.nextSibling);
      /* the dock stays away while the two cards are on screen, so they are
         the only choice at the top; it slides in once they scroll past */
      if ("IntersectionObserver" in window) {
        bar.classList.add("m-bar-away");
        new IntersectionObserver(function (entries) {
          var seen = entries[0].isIntersecting;
          bar.classList.toggle("m-bar-away", seen && !bar.classList.contains("m-bar-live"));
        }).observe(start);
      }
    }
    if (placed("e")) {
      /* E · the ladder rides the live dock and the review sheet */
      var dl = document.createElement("div");
      dl.className = "m-ladder m-ladder-dock";
      dl.setAttribute("role", "group");
      liveRow.parentNode.insertBefore(dl, liveRow);
      var sl = document.createElement("div");
      sl.className = "m-ladder m-ladder-sheet";
      sl.setAttribute("role", "group");
      var receipt = document.querySelector("#m-sheet .m-receipt");
      receipt.parentNode.insertBefore(sl, receipt);
    }
  })();

  function registerRetentionOrder() {
    if (!retentionEnabled || retentionRegistrationStarted || !retentionToken) return;
    retentionRegistrationStarted = true;
    var registration = window.HAVN_INTAKE.registerClick(
      retentionToken, "retention_order");
    if (registration && registration["catch"]) {
      registration["catch"](function () {
        /* The order text still opens. A missing registration must never block
           the customer; it simply remains visible as unattributed. */
      });
    }
  }

  sendBtn.addEventListener("pointerdown", function (e) {
    if (e.button && e.button !== 0) return;
    if (!sendBtn.classList.contains("m-send-off")) registerRetentionOrder();
  });
  sendBtn.addEventListener("click", function (e) {
    if (sendBtn.classList.contains("m-send-off")) {
      e.preventDefault();
      return;
    }
    registerRetentionOrder();
  });

  var tastingSend = document.getElementById("m-taste-send");
  if (tastingSend) {
    tastingSend.addEventListener("pointerdown", registerRetentionOrder);
    tastingSend.addEventListener("click", registerRetentionOrder);
  }

  /* Delivery window times come from delivery-windows.json, a copy of HQ's
     CustomerComms/config/delivery_windows.json (the single source V2 and the
     confirmation texts read; the weekly deploy refreshes the copy). The times
     typed in index.html are only the fallback when the fetch fails, so a
     window change is one edit in HQ, not a hand edit here. */
  /* MOCK: the new weekly windows are Sun, Tue and Thu evenings, 5p-10p.
     Launch week only has Sunday evening; Tue and Thu show as sold out. */
  var MOCK_WINDOWS = [
    { name: "Sunday evening", label: "Sun PM", open: true },
    { name: "Tuesday evening", label: "Tue PM", open: false },
    { name: "Thursday evening", label: "Thu PM", open: false }
  ];
  /* g runs on the real delivery windows; only the mock variants fake them */
  if (TASTING && !SIMPLE) {
    delWindow = "Sunday evening";
    document.querySelectorAll(".m-pick-window-row").forEach(function (row) {
      row.innerHTML = MOCK_WINDOWS.map(function (w) {
        return w.open
          ? '<button type="button" class="m-chip on" data-window="' + w.name + '">' + w.label + " <i>5p&ndash;10p</i></button>"
          : '<button type="button" class="m-chip m-chip-out" data-window="' + w.name + '" disabled aria-label="' + w.name + ', sold out this week">' + w.label + " <i>Sold out</i></button>";
      }).join("");
    });
    var howtoCut = document.getElementById("m-howto-cutoff");
    if (howtoCut) howtoCut.textContent = howtoCut.textContent.replace("for delivery Sunday or Monday.", "for delivery Sunday evening.");
  }

  (function syncWindowChips() {
    if (TASTING && !SIMPLE) return; /* the mock windows above are not in the HQ copy yet */
    var chips = document.querySelectorAll(".m-chip[data-window]");
    if (!chips.length || typeof fetch !== "function") return;
    try {
      fetch("/delivery-windows.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          var windows = data && data.windows;
          if (!windows) return;
          chips.forEach(function (chip) {
            var name = (chip.dataset.window || "").split("(")[0].trim().toLowerCase();
            var key = Object.keys(windows).filter(function (k) { return k.toLowerCase() === name; })[0];
            var range = key && windows[key] && windows[key].short;
            var label = chip.querySelector("i");
            if (range && label) label.textContent = range.replace("-", "\u2013");
          });
        })
        .catch(function () { /* keep the HTML fallback */ });
    } catch (e) { /* keep the HTML fallback */ }
  })();

  /* pickers */
  /* the review sheet and the tasting sheet share one window + container */
  function syncChips() {
    document.querySelectorAll(".m-chip[data-window]").forEach(function (c) { c.classList.toggle("on", c.dataset.window === delWindow); });
    document.querySelectorAll(".m-chip[data-container]").forEach(function (c) { c.classList.toggle("on", c.dataset.container === container); });
    renderSheet();
    renderTaste();
  }
  document.querySelectorAll(".m-pick-window-row").forEach(function (row) {
    row.addEventListener("click", function (e) {
      var chip = e.target.closest(".m-chip");
      if (!chip || chip.disabled) return;
      delWindow = chip.dataset.window;
      syncChips();
    });
  });
  document.querySelectorAll(".m-pick-container-row").forEach(function (row) {
    row.addEventListener("click", function (e) {
      var chip = e.target.closest(".m-chip");
      if (!chip) return;
      container = chip.dataset.container;
      syncChips();
    });
  });

  /* ── pending-menu mode ──────────────────────────────────────────
     Driven by the operator "Pending Menu Mode" toggle on the comms
     dashboard (public read: api.havnclub.com/intake/menu-status), with
     ?pending=1 as a QA override. Fail-open: if the status call errors or
     times out, the page behaves exactly as it does today. */
  var pendingMode = false;

  function revealResolvedMenu() {
    document.body.classList.remove("m-menu-checking");
  }

  function enterPendingMode() {
    if (pendingMode) return;
    pendingMode = true;
    document.body.classList.add("m-pending");

    /* menu.js already contains the ready-to-launch week. Pending mode swaps
       in the preserved prior-week snapshot before the hidden menu is revealed,
       so the operator toggle controls the first customer reveal by itself. */
    if (window.HAVN_PREVIOUS_MENU_SECTIONS) {
      SECTIONS = window.HAVN_PREVIOUS_MENU_SECTIONS;
      ITEMS = indexItems(SECTIONS);
      qty = {};
      mods = {};
      notes = {};
      renderMenuSections();
    }

    /* The intro line must stop claiming "This week's menu" with a computed
       upcoming-Sunday date — while pending, both halves would be wrong. Kept
       short: the persistent band right above already says the rest. */
    var introLabel = document.querySelector(".m-intro-label");
    if (introLabel) {
      introLabel.innerHTML = "<i aria-hidden=\"true\"></i>Last week&rsquo;s menu";
    }

    var banner = document.getElementById("m-pend-banner");
    var topbar = document.getElementById("topbar");
    if (banner) {
      banner.style.top = (topbar ? topbar.offsetHeight : 0) + "px";
      banner.hidden = false;
    }

    renderSheet();

    var pop = document.getElementById("m-pend");
    var popBackdrop = document.getElementById("m-pend-backdrop");
    var okBtn = document.getElementById("m-pend-ok");
    if (pop && popBackdrop && okBtn) {
      pop.hidden = false;
      popBackdrop.hidden = false;
      setTimeout(function () {
        pop.classList.add("open");
        popBackdrop.classList.add("open");
        okBtn.focus();
      }, 20);
      var closePend = function () {
        pop.classList.remove("open");
        popBackdrop.classList.remove("open");
        document.removeEventListener("keydown", handlePendKeydown);
        setTimeout(function () { pop.hidden = true; popBackdrop.hidden = true; }, 380);
      };
      var handlePendKeydown = function (e) {
        if (e.key === "Escape") {
          e.preventDefault();
          closePend();
          return;
        }
        if (e.key === "Tab") {
          e.preventDefault();
          okBtn.focus();
        }
      };
      document.addEventListener("keydown", handlePendKeydown);
      okBtn.addEventListener("click", closePend);
      popBackdrop.addEventListener("click", closePend);
    }

    revealResolvedMenu();
  }

  (function initPendingMode() {
    /* An archive route is intentionally fixed and must not inherit the live
       operator pending state or its "new menu dropping soon" messaging. */
    if (ARCHIVED_DELIVERY_DATE) { revealResolvedMenu(); return; }
    var qs;
    try { qs = new URLSearchParams(window.location.search || ""); }
    catch (e) { qs = null; }
    if (qs && qs.has("pending")) { enterPendingMode(); return; }
    var url = (window.HAVN_CONFIG && window.HAVN_CONFIG.MENU_STATUS_URL) ||
      "https://api.havnclub.com/intake/menu-status";
    try {
      var ctrl = ("AbortController" in window) ? new AbortController() : null;
      if (ctrl) setTimeout(function () { ctrl.abort(); }, 4000);
      fetch(url, ctrl ? { signal: ctrl.signal } : {})
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (data && data.ordering === "pending") enterPendingMode();
          else revealResolvedMenu();
        })
        .catch(function () { revealResolvedMenu(); /* fail-open */ });
    } catch (e) { revealResolvedMenu(); /* fail-open */ }
  })();

  /* Tasting Menu A/B (HQ docs/reference/tasting-welcome.md): the same Meta
     events on both arms, /welcome/quiz ("quiz") and /welcome/tasting
     ("tasting"), so the funnel compares view → text drafted per arm. The
     flow comes from the drafted text's opening sentence, as HQ reads it. */
  (function welcomeArmEvents() {
    var variant = window.HAVN_MENU_VARIANT;
    if (MODE !== "welcome" || (variant !== "quiz" && variant !== "tasting") ||
        new URLSearchParams(location.search).get("havn_test") === "1") return;
    var arm = variant === "quiz" ? "standard" : "tasting";
    var city = window.HAVN_MENU_CITY || "DC";
    function fb(name, data) {
      try { if (typeof window.fbq === "function") window.fbq("trackCustom", name, data); } catch (e) {}
    }
    fb("WelcomeMenuView", { arm: arm, city: city });
    document.addEventListener("click", function (e) {
      var el = e.target && e.target.closest ? e.target.closest("a[href^='sms:']") : null;
      if (!el || el.hasAttribute("data-skip-direct") || el.classList.contains("m-send-off")) return;
      var text = "";
      try { text = decodeURIComponent((el.getAttribute("href") || "").split("body=")[1] || ""); } catch (err) {}
      var flow = /the tasting menu:/i.test(text) ? "tasting" : /my first week:/i.test(text) ? "first_week" : "order";
      fb("OrderTextOpened", { arm: arm, city: city, flow: flow });
      if (el.id !== "m-send" && window.HAVN_HYBRID && window.HAVN_HYBRID.event) {
        window.HAVN_HYBRID.event("composer_opened", { flow: flow, welcome_arm: arm, send_eligible: true });
      }
    }, true);
  })();

  refresh();
})();
