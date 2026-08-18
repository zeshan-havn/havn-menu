/* Snapshot shown while Pending Menu Mode is ON.
   This file intentionally stays separate from menu.js so the weekly generator can
   prepare the next menu without exposing it before the operator opens ordering. */
window.HAVN_PREVIOUS_MENU_SECTIONS = [
  {
    label: "Chef picks & beef — $25",
    items: [
      {
        id: "cheat", name: "Beef Bourguignon", tag: "Chef special", img: "/assets/previous/special.jpg",
        desc: "Slow braised beef chuck with a red wine reduction and cremini mushrooms and pearl onions over whipped Yukon Gold purée.",
        cal: 630, protein: 49, fat: 21, fiber: 7, carbs: 41,
        diet: [["Dairy (potato purée)", "allergen"], ["Gluten free", "safe"]]
      },
      {
        id: "beef", name: "Braised Short Rib", tag: "Beef", img: "/assets/previous/beef.jpg",
        desc: "Braised short rib with a balsamic reduction and roasted mushrooms and roasted pearl onions over wild rice.",
        cal: 617, protein: 61, fat: 24, fiber: 8, carbs: 40,
        diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
      }
    ]
  },
  {
    label: "Chicken & pasta — $25",
    items: [
      {
        id: "pasta", name: "Beef Bolognese", tag: "Pasta", img: "/assets/previous/pasta.jpg",
        desc: "Beef bolognese with a rich tomato sofrito over pappardelle.",
        cal: 609, protein: 48, fat: 27, fiber: 5, carbs: 43,
        diet: [["Dairy free", "safe"], ["Gluten (pasta)", "allergen"]]
      },
      {
        id: "chicken", name: "Butter Chicken", tag: "Chicken", img: "/assets/previous/chicken.jpg",
        desc: "Butter chicken with a creamy tikka masala sauce and roasted cauliflower and roasted eggplant over cardamom basmati rice.",
        cal: 707, protein: 58, fat: 36, fiber: 6, carbs: 43,
        diet: [["Dairy (cream)", "allergen"], ["Gluten free", "safe"]]
      },
      {
        id: "chicken_2", name: "Basil Pesto Chicken", tag: "Chicken", img: "/assets/previous/chicken_2.jpg",
        desc: "Blackened chicken breast over a basil pesto hummus with charred broccoli and roasted sweet potato and pickled red onions.",
        cal: 608, protein: 62, fat: 24, fiber: 10, carbs: 35,
        diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
      }
    ]
  },
  {
    label: "Seafood — $25",
    items: [
      {
        id: "seafood", name: "Pomegranate Salmon", tag: "Seafood", img: "/assets/previous/seafood.jpg",
        desc: "Pomegranate salmon with a whipped pomegranate sauce and roasted zucchini over saffron cauliflower rice.",
        cal: 677, protein: 49, fat: 43, fiber: 5, carbs: 24,
        diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
      },
      {
        id: "seafood_2", name: "Garlic Butter Shrimp", tag: "Seafood", img: "/assets/previous/seafood_2.jpg",
        desc: "Garlic herb shrimp with a lemon garlic butter and roasted cauliflower and zucchini over orzo.",
        cal: 558, protein: 53, fat: 23, fiber: 5, carbs: 36,
        diet: [["Dairy (butter)", "allergen"], ["Gluten (orzo)", "allergen"]]
      }
    ]
  },
  {
    label: "Salads & vegetarian — $25",
    items: [
      {
        id: "salad_2", name: "Ruby Goddess Salad", tag: "Salad", img: "/assets/previous/salad_2.jpg",
        desc: "Diced lemon herb chicken over purple cabbage and kale with roasted chickpeas, pickled red onion, watermelon radish, blueberries, pomegranate arils and pumpkin seeds, with ruby beet tahini on the side.",
        cal: 513, protein: 47, fat: 23, fiber: 12, carbs: 30,
        diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
      },
      {
        id: "salad", name: "Green Goddess Salad", tag: "Salad", img: "/assets/previous/salad.jpg",
        desc: "Diced lemon herb chicken over shredded purple cabbage and kale with pickled red onion, cucumber, roasted chickpeas, red grapes, toasted pumpkin seeds and dried apricots, with tahini green goddess on the side.",
        cal: 479, protein: 45, fat: 20, fiber: 10, carbs: 31,
        diet: [["Dairy free", "safe"], ["Gluten free", "safe"]]
      },
      {
        id: "vegetarian", name: "Thai Coconut Curry Bowl", tag: "Vegetarian", img: "/assets/previous/veg.jpg",
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
