# Havn Club — Project Context Document

## About the Business

**Havn Club** is a premium, SMS-based personal chef meal delivery service operating in Washington, DC.

### How It Works
1. Members receive a weekly menu via text message
2. Members reply with their order (meals + sides + delivery preferences)
3. Chef confirms order and sends payment link via text
4. Meals are prepared fresh and delivered on the selected day

### Brand Aesthetic
- **Vibe:** Old-world European luxury, moody, intimate, understated elegance
- **Colors:** Deep forest greens, warm creams, brass/gold accents
- **Typography:** Cormorant (display/serif) + DM Sans (body/sans-serif)
- **Feel:** Premium but approachable, like a private supper club

### Pricing
- Meals: $25 each
- Sides (Bone Broth, Chia Pudding): $10 each
- Minimum order: 4 meals for free delivery

---

## Current Infrastructure

- **Domain:** havnclub.com (hosted on GoDaddy)
- **Main Website:** Built on Figma Make, hosted via GoDaddy
- **Order Phone Number:** +1 (224) 537-0344

---

## This Project: Mobile Menu Interface

### What We Built
A mobile-optimized, interactive menu ordering interface that:
- Displays the weekly menu with meal descriptions, macros, and dietary tags
- Lets members tap to add/remove items with quantity steppers
- Generates a pre-formatted SMS draft with their order
- Opens the Messages app with the order pre-filled, ready to send

### Key Features
- **Horizontal stepper** — [−] [0] [+] buttons aligned to bottom-right of each menu item
- **Draft message preview** — Always visible, shows delivery window and container type even when empty
- **Smart prompts** — Suggests adding Bone Broth or Chia Pudding when order is complete
- **Detail sheets** — Tap any menu item for full description, macros, dietary tags, and customization input
- **Delivery options** — Sunday AM, Sunday PM, or Monday AM
- **Container options** — Reusable Glass or BPA-Free Plastic

### Current Menu (Jan 25–31)
| Item | Category | Price | Calories | Protein |
|------|----------|-------|----------|---------|
| Braised Short Rib | Cheat | $25 | 744 | 56g |
| Honey Harissa Chicken | Chicken | $25 | 707 | 61g |
| Turkish Meatball | Beef | $25 | 799 | 55g |
| Pan Seared Salmon | Seafood | $25 | 722 | 56g |
| Classic Bone Broth | Side | $10 | 419 | 41g |
| Matcha Chia Pudding | Side | $10 | 377 | 24g |

### Files
- `index.html` — Complete, production-ready menu interface (single HTML file with embedded CSS and JS)

---

## Deployment Plan

### Goal
Deploy the menu to **menu.havnclub.com**

### Method
1. Host on Netlify (free)
2. Connect custom subdomain via CNAME record in GoDaddy DNS

### Status
- [x] Menu interface built and finalized
- [x] SMS integration configured (+12245370344)
- [ ] Netlify account created
- [ ] Site deployed to Netlify
- [ ] Custom domain connected
- [ ] DNS propagation confirmed
- [ ] Live and ready to send to members

---

## Weekly Workflow (Post-Launch)

Each week, the menu needs to be updated with new items. This involves:
1. Updating the menu data in the HTML file (dish names, descriptions, macros, tags)
2. Updating the date range in the header
3. Re-deploying to Netlify (drag and drop the updated file)

This can be done by:
- Editing the HTML directly (with Claude's help)
- Or building a simple CMS later if volume increases

---

## Design Decisions Made

| Decision | Rationale |
|----------|-----------|
| Single HTML file | Simple to deploy, no build process needed |
| No framework | Keeps it lightweight, loads fast on mobile |
| SMS via `sms:` URL | Works natively on iOS/Android, no backend needed |
| Horizontal stepper | Finger doesn't cover the number when tapping |
| Draft always visible | Shows user what will be sent before they add items |
| Stacked option bubbles | Cleaner layout, doesn't get covered by cart bar |

---

## Future Considerations

- **CMS for weekly updates** — Could use Airtable, Google Sheets, or simple JSON file
- **Order tracking** — Could add confirmation page or order history
- **Payment integration** — Currently handled via text; could add Stripe later
- **Analytics** — Could add simple tracking to see menu views vs. orders sent

---

## Technical Notes

- **Fonts:** Loaded from Google Fonts (Cormorant + DM Sans)
- **No external dependencies:** Everything is self-contained
- **Mobile-first:** Designed for iPhone, looks good on all mobile devices
- **Frame preview:** Dev version shows iPhone frame; production works without it

---

## Contact / Owner

**Zeshan** — Founder, Havn Club
- Non-technical background
- Learning Claude Code for future projects
- Wants to understand what's happening, not just have it done

---

*Last updated: January 2025*
