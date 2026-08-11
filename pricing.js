/* Public new-customer acquisition prices.
   Stable menu slots are the only input so weekly dish names and labels cannot
   change a price. Final charging remains outside this browser surface. */

(function (root) {
  "use strict";

  var SLOT_PRICES = Object.freeze({
    cheat: 25,
    pasta: 25,
    chicken: 25,
    chicken_2: 25,
    beef: 25,
    seafood: 25,
    seafood_2: 25,
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
