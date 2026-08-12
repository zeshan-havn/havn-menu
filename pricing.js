/* Public new-customer acquisition prices.
   Stable menu slots are the only input so weekly dish names and labels cannot
   change a price. Final charging remains outside this browser surface. */

(function (root) {
  "use strict";

  /* Every customer URL serves this one screen. Keep the cohort determination
     path-based so Netlify rewrites cannot accidentally turn a member into a
     welcome customer. The dated weekly aliases have their prefix removed. */
  function menuMode() {
    var parts = (root.location.pathname || "/").split("/").filter(Boolean);
    var isSdRoute = parts.indexOf("sd") !== -1;
    if (/^aug\d+$/i.test(parts[0] || "")) parts.shift();
    /* SoCal uses an optional city segment in some weekly campaign links. */
    if (parts[0] === "sd" || parts[0] === "dc") parts.shift();
    var first = parts[0] || "";
    var qs = new URLSearchParams(root.location.search || "");
    root.HAVN_MENU_CITY = (isSdRoute || qs.has("sd")) ? "SD" : "DC";
    if (qs.has("welcome")) return "welcome";
    if (qs.has("ws")) return "ws";
    if (qs.has("db")) return "db";
    if (qs.has("in")) return "in";
    if (first === "welcome" || first === "ws" || first === "db" || first === "in") return first;
    return "active";
  }

  var mode = menuMode();
  root.HAVN_MENU_MODE = mode;
  /* Meal pricing is intentionally uniform across every member-menu variant.
     Credits remain represented separately in the receipt instead of changing
     the underlying meal price. */
  var memberMealPrice = 25;

  var SLOT_PRICES = Object.freeze({
    cheat: memberMealPrice,
    pasta: memberMealPrice,
    chicken: memberMealPrice,
    chicken_2: memberMealPrice,
    beef: memberMealPrice,
    seafood: memberMealPrice,
    seafood_2: memberMealPrice,
    salad: 25,
    salad_2: 25,
    vegetarian: 25,
    oats: 10,
    chia: 10,
    chia_2: 10,
    broth: 10,
    broth_2: 10,
    wellness_shots: 25,
    date_balls: 25
  });

  function priceForSlot(slot) {
    if (typeof slot !== "string" || !slot.trim()) {
      throw new TypeError("A stable menu slot is required");
    }
    if (!Object.prototype.hasOwnProperty.call(SLOT_PRICES, slot)) {
      throw new RangeError("Unknown menu slot: " + slot);
    }
    return SLOT_PRICES[slot];
  }

  root.HAVN_PRICING = Object.freeze({ priceForSlot: priceForSlot });
})(window);
