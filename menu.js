/* HAVN · This week's menu — selections → draft text → send or skip.
   Deterministic, no frameworks. State lives here; nothing persists.
   Regular meals $28 · salads $25 · sides $10 · collections $25. Each
   collection counts as one meal equivalent; three sides count as one.
   Dish data is generated from the explicitly selected finalized weekly menu. Tapping a card
   opens its detail sheet (description, full macros, dietary tags,
   Make-it mods, free-text note) — same shape as menu.havnclub.com. */

(function () {
  "use strict";

  var priceForSlot = window.HAVN_PRICING && window.HAVN_PRICING.priceForSlot;
  if (!priceForSlot) throw new Error("Havn acquisition pricing did not load");

  /* ── BEGIN GENERATED: SECTIONS ───────────────────────────────────
     Written by scripts/sync_design_lab_menu.py from the weekly menu
     build's Menu Detail CSV. DO NOT HAND-EDIT between these markers —
     the next weekly run overwrites it. Authored content that is not in
     the CSV (collection flavors/notes, bespoke art, short display
     names) lives in menu-data.overrides.json and survives every run. */
  var SECTIONS = [
    {
      label: "Chef picks & beef — $28",
      items: [
        {
          id: "cheat", name: "Beef Bourguignon", tag: "Chef special", img: "assets/current/special.jpg",
          desc: "Slow braised beef chuck with a red wine reduction and cremini mushrooms and pearl onions over whipped Yukon Gold purée.",
          cal: 630, protein: 49, fat: 21, fiber: 7, carbs: 41,
          diet: [["Dairy (potato purée)", "allergen"], ["Gluten free", "safe"]]
        },
        {
          id: "beef", name: "Braised Short Rib", tag: "Beef", img: "assets/current/beef.jpg",
          desc: "Braised short rib with a balsamic reduction and roasted mushrooms and roasted pearl onions over wild rice.",
          cal: 617, protein: 61, fat: 24, fiber: 8, carbs: 40,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        },
      ]
    },
    {
      label: "Chicken & pasta — $28",
      items: [
        {
          id: "pasta", name: "Beef Bolognese", tag: "Pasta", img: "assets/current/pasta.jpg",
          desc: "Beef bolognese with a rich tomato sofrito over pappardelle.",
          cal: 609, protein: 48, fat: 27, fiber: 5, carbs: 43,
          diet: [["Dairy free", "safe"], ["Gluten (pasta)", "allergen"]]
        },
        {
          id: "chicken", name: "Butter Chicken", tag: "Chicken", img: "assets/current/chicken.jpg",
          desc: "Butter chicken with a creamy tikka masala sauce and roasted cauliflower and roasted eggplant over cardamom basmati rice.",
          cal: 707, protein: 58, fat: 36, fiber: 6, carbs: 43,
          diet: [["Dairy (cream)", "allergen"], ["Gluten free", "safe"]]
        },
        {
          id: "chicken_2", name: "Basil Pesto Chicken", tag: "Chicken", img: "assets/current/chicken_2.jpg",
          desc: "Blackened chicken breast over a basil pesto hummus with charred broccoli and roasted sweet potato and pickled red onions.",
          cal: 608, protein: 62, fat: 24, fiber: 10, carbs: 35,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        }
      ]
    },
    {
      label: "Seafood — $28",
      items: [
        {
          id: "seafood", name: "Pomegranate Salmon", tag: "Seafood", img: "assets/current/seafood.jpg",
          desc: "Pomegranate salmon with a whipped pomegranate sauce and roasted zucchini over saffron cauliflower rice.",
          cal: 677, protein: 49, fat: 43, fiber: 5, carbs: 24,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        },
        {
          id: "seafood_2", name: "Garlic Butter Shrimp", tag: "Seafood", img: "assets/current/seafood_2.jpg",
          desc: "Garlic herb shrimp with a lemon garlic butter and roasted cauliflower and zucchini over orzo.",
          cal: 558, protein: 53, fat: 23, fiber: 5, carbs: 36,
          diet: [["Dairy (butter)", "allergen"], ["Gluten (orzo)", "allergen"]]
        }
      ]
    },
    {
      label: "Salads — $25 · vegetarian — $28",
      items: [
        {
          id: "salad_2", name: "Ruby Goddess Salad", tag: "Salad", img: "assets/current/salad_2.jpg",
          desc: "Diced lemon herb chicken over purple cabbage and kale with roasted chickpeas, pickled red onion, watermelon radish, blueberries, pomegranate arils and pumpkin seeds, with ruby beet tahini on the side.",
          cal: 513, protein: 47, fat: 23, fiber: 12, carbs: 30,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        },
        {
          id: "salad", name: "Green Goddess Salad", tag: "Salad", img: "assets/current/salad.jpg",
          desc: "Diced lemon herb chicken over shredded purple cabbage and kale with pickled red onion, cucumber, roasted chickpeas, red grapes, toasted pumpkin seeds and dried apricots, with tahini green goddess on the side.",
          cal: 479, protein: 45, fat: 20, fiber: 10, carbs: 31,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        },
        {
          id: "vegetarian", name: "Thai Coconut Curry Bowl", tag: "Vegetarian", img: "assets/current/veg.jpg",
          desc: "Marinated tofu with a thai coconut curry sauce and roasted bell peppers and broccoli and shredded cabbage over jasmine rice.",
          cal: 683, protein: 46, fat: 32, fiber: 9, carbs: 47,
          diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
        }
      ]
    },
    {
      label: "Breakfast & sides — $10",
      drop: true,
      side: true,
      items: [
        {
          id: "oats", name: "Strawberry Overnight Oats", tag: "Oats", side: true,
          desc: "Premium rolled oats in organic milk, lightly sweetened with maple and vanilla, finished with fresh strawberries.",
          cal: 430, protein: 26, fat: 11, fiber: 17, carbs: 47,
          diet: [["Dairy (milk)", "allergen"], ["Gluten free", "safe"]]
        },
        {
          id: "chia", name: "Mango Chia Pudding", tag: "Chia", side: true,
          desc: "A creamy mango chia pudding layered with coconut cream and topped with fresh mango.",
          cal: 436, protein: 22, fat: 26, fiber: 11, carbs: 30,
          diet: [["Dairy (mascarpone)", "allergen"], ["Gluten free", "safe"]]
        },
        {
          id: "chia_2", name: "Tiramisu Chia Pudding", tag: "Chia", side: true,
          desc: "Tiramisu chia pudding with a sweet tiramisu style cream topped with a light cocoa dusting.",
          cal: 320, protein: 27, fat: 11, fiber: 10, carbs: 29,
          diet: [["Dairy (yogurt)", "allergen"], ["Gluten free", "safe"]]
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
          desc: "Four cold-pressed rituals in glass vials, made fresh the week of delivery. Coconut water base — refrigerate, enjoy within six days.",
          note: "Cold-pressed in our kitchen, fresh the week of delivery.",
          flavors: [
            ["Immunity", "Turmeric, ginger, lemon, black pepper"],
            ["Endurance", "Beetroot, tart cherry, ginger, lemon"],
            ["Purify", "Wheatgrass, cucumber, chlorophyll, mint"],
            ["Clarity", "Blue spirulina, lemon, L-theanine, honey"]
          ]
        },
        {
          id: "date_balls", name: "Date Ball Collection", tag: "Five date balls", addon: true,
          desc: "Five date balls across three flavors — sweet, fudgy, and made to disappear.",
          note: "Sweet, fudgy, and made to disappear.",
          flavors: [
            ["Havn Signature", "Sweet, fudgy, sea salt finish"],
            ["Dark Chocolate Espresso", "Rich cacao, espresso depth"],
            ["Coconut Vanilla", "Coconut, vanilla, lightly sweet"]
          ]
        }
      ]
    }
  ];
  /* ── END GENERATED: SECTIONS ─────────────────────────────────── */

  var ITEMS = {};
  SECTIONS.forEach(function (s) { s.items.forEach(function (it) { ITEMS[it.id] = it; }); });

  var qty = {};
  var mods = {};   /* id -> array of active Make-it pills */
  var notes = {};  /* id -> free-text customization */
  var delWindow = "Sunday morning";
  var container = "Glass";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* The label always identifies the Sunday delivery the menu is for. */
  (function () {
    var dateLabel = document.getElementById("m-menu-date");
    if (!dateLabel) return;
    var delivery = new Date();
    delivery.setHours(12, 0, 0, 0);
    delivery.setDate(delivery.getDate() + ((7 - delivery.getDay()) % 7));
    dateLabel.dateTime = delivery.toISOString().slice(0, 10);
    dateLabel.textContent = delivery.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric"
    });
  })();

  /* ── the welcome-offer ribbon ─────────────────────────────────
     This is a customer promise, not a loading indicator. Keep the saved
     amounts visible even if a device delays or stops animation. */
  (function () {
    var nums = [document.getElementById("m-rb-0"), document.getElementById("m-rb-1")];
    if (!nums[0] || !nums[1]) return;
    var TARGETS = [20, 40];
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

  SECTIONS.forEach(function (section) {
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
    });

    mount.appendChild(sec);
  });

  /* stagger the shimmer so the two collections don't flash in sync */
  Array.prototype.forEach.call(document.querySelectorAll(".m-shimmer"), function (el, i) {
    el.style.setProperty("--shimmer-delay", (i * 1.1) + "s");
  });

  /* ── selection state ────────────────────────────────────────── */
  function counts() {
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
    var equivalents = meals + sides / 3 + addons;
    var discount = meals >= 7 ? 40 : meals >= 5 ? 20 : 0;
    return { meals: meals, sides: sides, addons: addons, subtotal: subtotal, equivalents: equivalents, discount: discount };
  }

  function setQty(id, n) {
    qty[id] = Math.max(0, Math.min(20, n));
    document.querySelectorAll('.m-stepper[data-id="' + id + '"]').forEach(function (st) {
      var has = qty[id] > 0;
      st.querySelector(".m-add").hidden = has;
      st.querySelector(".m-counter").hidden = !has;
      st.querySelector(".m-qty").textContent = qty[id];
      var card = st.closest(".m-card");
      if (card) card.classList.toggle("m-picked", has);
    });
    if (detailFor === id) detailQtyEl.textContent = qty[id];
    refresh();
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
    if (any) {
      var bits = [];
      if (c.meals) bits.push(c.meals + (c.meals === 1 ? " meal" : " meals"));
      if (c.sides) bits.push(c.sides + (c.sides === 1 ? " side" : " sides"));
      if (c.addons) bits.push(c.addons + (c.addons === 1 ? " collection" : " collections"));
      barCount.textContent = bits.join(" · ");
      var ready = c.equivalents >= 4 - 1e-9;
      var hint = "";
      if (!ready) {
        var needMeals = Math.ceil(4 - c.equivalents - 1e-9);
        hint = " · add " + needMeals + " more";
      } else if (c.meals < 5) {
        hint = " · $20 off at 5 meals";
      } else if (c.meals < 7) {
        hint = " · $40 off at 7";
      }
      barTotal.textContent = money(c.subtotal - c.discount) + (c.discount ? " after offer" : "") + hint;
      bar.classList.toggle("m-bar-ready", ready);
    }
    renderSheet(c);
  }

  /* ── draft sheet ────────────────────────────────────────────── */
  var sheet = document.getElementById("m-sheet");
  var backdrop = document.getElementById("m-sheet-backdrop");
  var bubble = document.getElementById("m-compose-bubble");
  var rItems = document.getElementById("m-r-items");
  var rSub = document.getElementById("m-r-sub");
  var rOfferRow = document.getElementById("m-r-offer-row");
  var rOffer = document.getElementById("m-r-offer");
  var rTotal = document.getElementById("m-r-total");
  var gate = document.getElementById("m-gate");
  var sendBtn = document.getElementById("m-send");
  /* Existing members are already opted in. No acquisition token is minted or
     registered from this ordering surface. */
  var orderBody = "";
  var smsNumber = (window.HAVN_CONFIG && window.HAVN_CONFIG.SMS_NUMBER) || "+12245370344";
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
    if (lines.length) {
      blocks.push(lines.join("\n"));
      blocks.push(delWindow + "\n" + container + " containers");
      if (extra.length) blocks.push("Notes:\n" + extra.join("\n"));
    }
    orderBody = blocks.join("\n\n");
    var outgoingOrder = orderBody;
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
      bubble.textContent = lines.join("\n") + "\n\n" + container + " containers";
    }

    var bits = [];
    if (c.meals) bits.push(c.meals + (c.meals === 1 ? " meal" : " meals"));
    if (c.sides) bits.push(c.sides + (c.sides === 1 ? " side" : " sides"));
    if (c.addons) bits.push(c.addons + (c.addons === 1 ? " collection" : " collections"));
    rItems.textContent = bits.length ? bits.join(" · ") : "0 meals";
    rSub.textContent = money(c.subtotal);
    rOfferRow.hidden = !c.discount;
    rOffer.innerHTML = "&ndash;" + money(c.discount);
    rTotal.textContent = money(Math.max(0, c.subtotal - c.discount));

    var short = 4 - c.equivalents;
    if (c.meals + c.sides + c.addons > 0 && short > 1e-9) {
      var needMeals = Math.ceil(short - 1e-9);
      gate.hidden = false;
      gate.innerHTML = "Almost there! The minimum is four meals. Add <b>" +
        needMeals + " more " + (needMeals === 1 ? "meal" : "meals") + "</b> (or 3 sides = 1 meal).";
      sendBtn.classList.add("m-send-off");
    } else {
      gate.hidden = true;
      sendBtn.classList.toggle("m-send-off", !lines.length);
    }

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
    if (e.key === "Escape" && !sheet.hidden) closeSheet();
  });

  sendBtn.addEventListener("click", function (e) {
    if (sendBtn.classList.contains("m-send-off")) e.preventDefault();
  });

  /* pickers */
  document.getElementById("m-pick-window").addEventListener("click", function (e) {
    var chip = e.target.closest(".m-chip");
    if (!chip) return;
    this.querySelectorAll(".m-chip").forEach(function (c) { c.classList.remove("on"); });
    chip.classList.add("on");
    delWindow = chip.dataset.window;
    renderSheet();
  });
  document.getElementById("m-pick-container").addEventListener("click", function (e) {
    var chip = e.target.closest(".m-chip");
    if (!chip) return;
    this.querySelectorAll(".m-chip").forEach(function (c) { c.classList.remove("on"); });
    chip.classList.add("on");
    container = chip.dataset.container;
    renderSheet();
  });

  refresh();
})();
