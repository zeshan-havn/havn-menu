/* Public new-customer acquisition prices.
   Stable menu slots are the only input so weekly dish names and labels cannot
   change a price. Final charging remains outside this browser surface. */

(function (root) {
  "use strict";

  var SLOT_PRICES = Object.freeze({
    cheat: 20,
    pasta: 20,
    chicken: 20,
    chicken_2: 20,
    beef: 20,
    seafood: 20,
    seafood_2: 20,
    salad: 20,
    salad_2: 20,
    vegetarian: 20,
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
