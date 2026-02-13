# Feature Research

**Domain:** Local e-commerce — electric scooters, cash-on-delivery, Morocco
**Researched:** 2026-02-12
**Confidence:** MEDIUM-HIGH (Morocco-specific consumer behavior from multiple sources; general e-commerce patterns from verified sources; some local specifics inferred from regional data)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product catalog with photos | Users won't buy what they can't see; scooter specs matter (range, speed, weight, motor power) | LOW | Multiple hi-res images per product; spec table is mandatory for technical products |
| Product search and filters | Users expect to narrow by price, category, spec; 82% of Moroccan users browse before buying | LOW | Filter by price range, category, availability minimum; full-text search in 3 languages |
| Product detail page | Standard across all e-commerce; spec-heavy products demand this | LOW | Includes images, description, specs table, price, delivery estimate, stock status |
| User account registration and login | Users want saved info, order history; account = trust signal | LOW | Email/password; no social login needed for MVP (adds complexity, low local uptake) |
| User profile with saved delivery address | Repeat buyers expect one-click address reuse | LOW | Name, phone, city, full address; multiple addresses is v1.x |
| Order history for the user | Moroccan consumers expect to track and review past orders | LOW | Status, items, total, date; detail view per order |
| Shopping cart | Standard; users compare and add multiple items before deciding | LOW | Persisted cart (cookie or DB); quantity change; remove item |
| Checkout flow | Users expect a clear, minimal steps path to confirm purchase | MEDIUM | Name, phone, address, city selection, COD confirmation, order summary; no payment gateway |
| Cash on delivery as the only payment | COD accounts for 54–80%+ of Moroccan e-commerce; no trust in online payment for this segment | LOW | Confirmation step with order total and delivery fee clearly stated |
| Order confirmation (on-screen + SMS/WhatsApp) | Moroccan buyers expect confirmation after placing order; WhatsApp is primary channel | MEDIUM | At minimum show confirmation screen with order number; WhatsApp notification is expected locally |
| Delivery fee shown before confirmation | Price transparency is a trust requirement; surprises kill conversions | LOW | City-based fee must be visible before final submit |
| Order status visibility for users | Users want to know if order is pending / confirmed / shipped / delivered | LOW | 4–5 status states; display in order history |
| Wishlist / saved products | Users browse extensively (82% multiple times/week) before buying; wishlist bridges browse-to-buy | LOW | Add/remove from product page; view saved list from account |
| Trilingual content (FR/AR/EN) | Morocco is trilingual (French business, Arabic official, English tech-savvy); competitor Jumia supports Arabic | HIGH | RTL layout for Arabic; language switcher persistent; all product content translated |
| RTL layout for Arabic | Arabic is RTL; broken layout = immediate trust loss for Arabic speakers | HIGH | CSS logical properties or direction-aware layout; MUI has RTL support via `rtlPlugin` |
| Mobile-responsive layout | 60–73% of e-commerce browsing is mobile; Moroccan mobile penetration is high | MEDIUM | MUI default responsive grid handles much of this; test on common Android screen sizes |
| Trust signals on product pages | Moroccan consumers cite authenticity and seller credibility as purchase barriers | LOW | Return policy snippet, phone/WhatsApp contact, "official store" badge |
| Admin: product CRUD | Admin must manage catalog without developer help | LOW | Create, edit, deactivate products; image upload; specs fields |
| Admin: order management dashboard | Core operational need; admin confirms orders manually | MEDIUM | List all orders by status; view order detail; change status; filter by date/status/city |
| Admin: user management | Admin needs to view/manage buyer accounts | LOW | List users, view profile and order history, deactivate if needed |
| Admin: delivery zone / city fee config | Admin sets delivery fees per city; this is the shipping model | LOW | CRUD for cities with associated delivery fee; link city to delivery fee at checkout |
| Admin: manual order confirmation | Business model requires human approval before dispatch | LOW | Status transition: Pending → Confirmed → Shipped → Delivered; with timestamp |
| Stock/availability indicator | Out-of-stock products should not be orderable; scooters are high-value items with real inventory limits | LOW | Available / Out of stock toggle; hide from catalog or show as unavailable |

---

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Scooter comparison tool | Electric scooter buyers are spec-driven; comparing 2–3 models side by side reduces abandonment | MEDIUM | Select up to 3 products; side-by-side spec table; common on Apollo, GOTRAX sites |
| WhatsApp "ask a question" button | Moroccan consumers prefer direct contact with sellers; WhatsApp is the #1 communication channel | LOW | Simple `wa.me` link with pre-filled message including product name; no backend needed |
| Delivery date estimate at checkout | Jumia shows estimated delivery; sets expectation; reduces post-order anxiety | LOW | Simple business rule: city X = delivery in Y days; no real-time tracking needed at MVP |
| Admin: order notes / call log | Admin confirms by phone; notes field on order records the conversation outcome | LOW | Free text field on order; visible to admin only |
| Admin: bulk order export (CSV) | Local businesses manage delivery logistics offline (e.g., with courier partners); CSV export bridges systems | LOW | Export filtered order list as CSV; columns: order ID, customer name, phone, address, city, items, total |
| Product categories and breadcrumbs | Scooter catalog will have distinct types (urban commuter, off-road, seated, kids); navigation aids discovery | LOW | Category taxonomy: max 2 levels; breadcrumb on product page |
| Recently viewed products | Moroccan users browse extensively before buying; "where was that scooter?" is real friction | LOW | Browser localStorage; no backend storage needed |
| Related products / "You may also like" | Upsell accessories (helmets, locks, chargers) alongside scooters | LOW | Manual curation by admin (tag-based) is simpler than algorithmic; avoids complexity |
| Admin: dashboard with KPIs | Business visibility: today's orders, revenue, pending confirmations, top products | MEDIUM | Charts: orders by status, revenue by week, top 5 products; recharts or MUI X Charts |
| Arabic product content (separate translation per product) | Most Moroccan e-commerce is French-first; Arabic content for product pages is a real differentiator for the Arabic-speaking majority | HIGH | Per-product translation fields; i18n-aware content model in DB; not just UI strings |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this project scope.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Online payment / card integration | "Everyone does it" | 80%+ of Moroccan e-commerce is COD; Stripe/CMI integration adds compliance, PCI scope, currency handling, and bank agreements; high COD return rates make online payment a secondary concern | Ship COD; revisit payment in v2 once trust is established and volume justifies it |
| Real-time order tracking (GPS) | Customers want to see delivery on a map | Requires driver app, GPS infrastructure, real-time WebSocket backend; massively out of scope for a local store with a small fleet | Show order status (Pending/Confirmed/Out for Delivery/Delivered) updated manually by admin |
| Product reviews and ratings | Social proof; Moroccan consumers cited trust as a concern | Review spam and fake reviews are a known problem; moderation overhead; adds complexity before trust is established | Curate testimonials manually on homepage; add structured reviews in v2 |
| Multi-vendor / marketplace | "We could open to other sellers" | Completely different data model (vendor accounts, commissions, split payouts); scope explosion | Build as a single-vendor store; marketplace pivot requires redesign |
| Loyalty points / rewards program | Customer retention | Points expiry, redemption logic, abuse prevention, display in cart — significant complexity for an unvalidated customer base | Use WhatsApp follow-up for repeat customers; implement discount codes instead |
| Subscription / recurring orders | "For scooter maintenance plans" | Requires billing schedules, payment integration (no COD subscription), cancellation flows | Offer service packages as regular one-off orders through the admin |
| AI-powered product recommendations | Modern e-commerce has this | Requires training data (need user history volume), ML pipeline, or expensive API; the catalog is small (likely <50 SKUs) | Manual "related products" curation is sufficient and more reliable at this scale |
| Social login (Google, Facebook) | Reduces registration friction | Adds OAuth flows, token management, edge cases (email collision); low local uptake for this product type | Simple email + password registration; phone number as primary identifier is sufficient |
| Live chat / chatbot | Customer support | Requires 24/7 staffing or bot training; WhatsApp handles this better locally | WhatsApp button on every product page; phone number in header |
| Blog / content marketing | SEO and brand building | Significant content maintenance overhead; CMS complexity; distraction from core commerce | Single static "About" page and FAQ; blog as v2 if SEO becomes a priority |
| User-submitted product photos | UGC trust signal | Moderation burden, storage costs, legal risk (brand misrepresentation) | Use official product photography; trust signals via WhatsApp testimonials |
| Abandoned cart emails | Recover lost sales | Requires email delivery infrastructure, GDPR-equivalent compliance (Law 09-08 in Morocco), segmentation; low ROI at early stage | WhatsApp follow-up for high-value cart abandonment is more culturally effective |

---

## Feature Dependencies

```
[User Account]
    └──requires──> [User Registration / Login]
                       └──requires──> [Email + Password Auth]

[Checkout]
    └──requires──> [Shopping Cart]
    └──requires──> [Delivery Zone / City Fee Config]
    └──requires──> [User Account] (or guest checkout — NOT recommended, adds complexity)

[Order History]
    └──requires──> [User Account]
    └──requires──> [Order Management (Admin)]

[Wishlist]
    └──requires──> [User Account]
    └──requires──> [Product Catalog]

[Admin: Manual Order Confirmation]
    └──requires──> [Admin: Order Management Dashboard]
    └──requires──> [Order Status States]

[Trilingual Content]
    └──requires──> [i18n Framework (react-i18next)]
    └──enhances──> [Product Catalog]
    └──enhances──> [Checkout]

[RTL Layout]
    └──requires──> [Trilingual Content] (specifically Arabic)
    └──requires──> [MUI RTL plugin configured]

[Scooter Comparison Tool]
    └──requires──> [Product Catalog with structured specs]
    └──enhances──> [Product Detail Page]

[Admin: Delivery Zone Config]
    └──requires──> [City list seeded in DB]
    └──enhances──> [Checkout] (fee calculation)
    └──enhances──> [Admin: Order Management] (filter by city)

[Arabic Product Content]
    └──requires──> [Trilingual Content infrastructure]
    └──requires──> [Per-product translation fields in DB]
```

### Dependency Notes

- **Checkout requires Delivery Zone Config:** City-based fees must be configured by admin before checkout can calculate totals. Seed at least Casablanca, Rabat, Marrakech, Fes, Tangier on launch.
- **RTL requires i18n infrastructure:** RTL is not just a CSS flip; it requires the i18n framework to detect Arabic as active language and switch `dir="rtl"` on the HTML element plus MUI's `rtlPlugin`.
- **Arabic Product Content requires DB schema planning:** Translatable fields (name, description, specs) should be designed from the start (either JSON columns or a separate translations table). Retrofitting is expensive.
- **Wishlist enhances conversion:** Moroccan users browse 3x more than they buy; wishlist is the bridge between browse sessions. It should be built alongside the catalog, not after.
- **Comparison Tool requires structured specs:** Specs must be stored as structured data (key-value pairs or schema-defined fields), not embedded in free-text descriptions. Design the product model to support this from Phase 1.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept and take first orders.

- [x] Product catalog with categories, photos, specs, search, filters — users cannot evaluate scooters without this
- [x] Product detail page with full specs and WhatsApp "ask a question" button — spec-driven buyers need detail
- [x] User registration, login, profile with saved address — required for checkout and order history
- [x] Shopping cart — required for checkout
- [x] Checkout with city selection, COD confirmation, delivery fee display — the core transaction flow
- [x] Order confirmation screen with order number — trust signal immediately after purchase
- [x] User order history with status — users will return to check status
- [x] Wishlist — high-browse Moroccan market makes this essential, not a nice-to-have
- [x] Admin: product CRUD with image upload — admin must manage catalog
- [x] Admin: order list and status management — core operational workflow
- [x] Admin: delivery zone / city fee config — required for checkout to work
- [x] Admin: user management — basic operational need
- [x] Trilingual UI strings (FR/AR/EN) with RTL for Arabic — Morocco market requires this; retrofitting RTL is painful
- [x] Stock availability indicator — prevents orders for out-of-stock scooters
- [x] Trust signals on product pages (return policy, contact info) — Moroccan consumer trust barrier

### Add After Validation (v1.x)

Features to add once core is working and first orders are coming in.

- [ ] Admin: order notes / call log field — add when admin workflow is established and call-back pattern is confirmed
- [ ] Admin: bulk CSV export — add when order volume makes individual management painful
- [ ] Delivery date estimate at checkout — add when delivery SLAs per city are known from operational experience
- [ ] Product comparison tool — add when catalog has enough SKUs (5+) to make comparison meaningful
- [ ] Admin: KPI dashboard — add when there is enough data to make metrics meaningful (20+ orders)
- [ ] Recently viewed products — low effort, high browse-rate market; add in v1.x
- [ ] Related products / "You may also like" — add when accessories (helmets, locks) are in the catalog

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Product reviews and ratings — defer; requires moderation workflow and sufficient order volume for meaningful reviews
- [ ] Online payment (CMI, PayPal) — defer; cultural and compliance reasons; revisit when COD failure rate becomes a problem
- [ ] SMS / WhatsApp order notification automation — defer; requires integration with SMS gateway or WhatsApp Business API; manually manage at launch
- [ ] Arabic product content (per-product translations) — design DB schema for it in v1, populate in v2 when content is ready
- [ ] Multi-language SEO (hreflang, per-language URLs) — defer until traffic volume justifies SEO investment
- [ ] Blog / FAQ CMS — defer; distraction at MVP stage

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Product catalog + detail pages | HIGH | LOW | P1 |
| User auth (registration, login, profile) | HIGH | LOW | P1 |
| Shopping cart | HIGH | LOW | P1 |
| Checkout with COD + city-based fee | HIGH | MEDIUM | P1 |
| Order confirmation | HIGH | LOW | P1 |
| User order history + status | HIGH | LOW | P1 |
| Wishlist | HIGH | LOW | P1 |
| Admin: product CRUD + images | HIGH | LOW | P1 |
| Admin: order management + status | HIGH | MEDIUM | P1 |
| Admin: delivery zone / city fees | HIGH | LOW | P1 |
| Trilingual UI (FR/AR/EN) + RTL | HIGH | HIGH | P1 |
| Stock indicator | MEDIUM | LOW | P1 |
| Trust signals (policy, contact) | MEDIUM | LOW | P1 |
| WhatsApp "ask a question" button | HIGH | LOW | P1 |
| Admin: order notes field | MEDIUM | LOW | P2 |
| Admin: CSV export | MEDIUM | LOW | P2 |
| Delivery date estimate | MEDIUM | LOW | P2 |
| Product comparison tool | MEDIUM | MEDIUM | P2 |
| Recently viewed products | MEDIUM | LOW | P2 |
| Related products | MEDIUM | LOW | P2 |
| Admin: KPI dashboard | MEDIUM | MEDIUM | P2 |
| Arabic product content (per-product) | HIGH | HIGH | P2 |
| Product reviews and ratings | MEDIUM | MEDIUM | P3 |
| Online payment integration | LOW (for now) | HIGH | P3 |
| WhatsApp/SMS notification automation | MEDIUM | HIGH | P3 |
| Blog / CMS | LOW | MEDIUM | P3 |
| Loyalty / rewards program | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Jumia Morocco | Avito Morocco | Our Approach |
|---------|--------------|--------------|--------------|
| Cash on delivery | Yes, primary method | Yes, common | Yes, only method — simplicity is a feature |
| Arabic language + RTL | Yes | Yes | Yes — French-first but Arabic fully supported with RTL |
| French language | Yes | Yes | Yes — primary language for product content |
| Mobile optimized | Yes (app-first) | Yes (app-first) | Yes — responsive web; no native app at MVP |
| Order tracking (status) | Yes (Pending/Shipped/Delivered) | Limited | Yes — 4-5 status states, admin-updated |
| WhatsApp contact | Indirect (via chat) | Direct (WhatsApp per seller) | Direct — WhatsApp button on product page |
| Product comparison | No | No | Yes (v1.x) — differentiator for spec-driven scooter buyers |
| User reviews | Yes | Yes (C2C ratings) | No at MVP — too much overhead; curated testimonials instead |
| Delivery fee transparency | Yes (shown at checkout) | Negotiated | Yes — city fee shown before order confirmation |
| Admin manual confirmation | No (automated) | N/A | Yes — by design; phone confirmation is the trust model |
| Spec-focused product pages | Generic | Generic | Yes — scooter specs (range, speed, motor, weight) as structured data |
| Wishlist | Yes | No | Yes — given high browse rate of Moroccan users |

---

## Morocco-Specific Feature Notes

**Confidence: MEDIUM** (multiple sources agree on COD dominance and trust factors; specific UX patterns from Jumia/Avito observed, not from official UX research)

1. **Phone number is the primary identifier.** Moroccan e-commerce heavily uses phone for order confirmation, WhatsApp contact, and delivery coordination. Collect phone number at registration; use it as the primary contact field in orders, not email.

2. **COD means high cancellation/no-show risk.** Admin manual confirmation before dispatch is not just a feature request — it is a business necessity. Without phone confirmation, delivery return rates are high. The "Pending → Admin Confirms → Ships" workflow must be enforced, not optional.

3. **Trust is earned through transparency.** Price (including delivery), return policy, and direct contact (phone/WhatsApp) must be visible before checkout. Don't hide fees. Don't require account creation before showing price.

4. **Arabic content is a future differentiator, not a day-one requirement.** The DB schema must support it from day one (translatable fields), but Arabic product copy can be populated after launch. UI RTL support must be day-one because retrofitting RTL is a significant refactor.

5. **WhatsApp over email.** Email open rates in Morocco are low. WhatsApp is the actual communication channel. Order confirmation via WhatsApp (even a manual message from admin) is more effective than email. Automate later; manually confirm now.

---

## Sources

- [Morocco E-Commerce Market $1.7B 2025 — Morocco World News](https://www.moroccoworldnews.com/2025/12/271615/moroccos-e-commerce-market-nears-1-7-billion-in-2025-fashion-electronics-and-beauty-lead-the-boom/)
- [Black Friday 2025 Morocco — Consumer Behavior — Morocco World News](https://www.moroccoworldnews.com/2025/11/269647/black-friday-2025-in-morocco-e-commerce-boom-consumer-behavior-and-digital-growth/)
- [Payment Methods in Morocco — NORBr](https://norbr.com/library/payworldtour/payment-methods-in-morocco/)
- [Morocco E-Commerce State & Prospects 2025 — Real Dream House](https://real-dreamhouse.com/en/actualites/e-commerce-au-maroc-etat-des-lieux-et-perspectives-2025/)
- [Morocco Top E-Commerce Platforms — Scrowp](https://scrowp.com/top-ecommerce-platforms-morocco/)
- [Moroccan Online Purchasing Behavior: Trust and Culture — ResearchGate](https://www.researchgate.net/publication/344405844_MOROCCAN_ONLINE_PURCHASING_BEHAVIOR_BETWEEN_TRUST_AND_CULTURE)
- [Arabic RTL Design Strategies — ConveyThis](https://www.conveythis.com/blog/7-pro-strategies-for-rtl-design)
- [RTL Language Planning — Argos Multilingual](https://www.argosmultilingual.com/blog/planning-for-rtl-languages-how-layout-content-and-qa-fit-together)
- [10 Must-Have E-Commerce Features 2026 — SCTInfo](https://www.sctinfo.com/blog/10-must-have-e-commerce-website-features-for-2026/)
- [18 Must-Have eCommerce Features 2026 — WebDesk Solution](https://webdesksolution.com/blog/essential-features-for-successful-ecommerce-websites/)
- [Electric Scooter Comparison Tool Example — Apollo Scooters](https://apolloscooters.co/pages/compare-scooters)
- [Electric Scooter Finder / Comparison — eRide Hero](https://eridehero.com/tool/electric-scooter-finder/)
- [Ecommerce Shipping Zones Guide — GoShippo](https://goshippo.com/shipping/shipping-zones-what-they-are-and-how-they-affect-ecommerce-business/)
- [Feature Creep in Product Management — GeeksforGeeks](https://www.geeksforgeeks.org/business-studies/what-is-feature-creep-in-product-management/)
- [The Silent Mistakes That Kill E-Commerce Launches — Medium](https://medium.com/@bozhidar.lyubenov95/the-silent-mistakes-that-kill-e-commerce-launches-fe771b6a984e)
- [Social Commerce Morocco — 4tech.ma](https://4tech.ma/en/social-commerce-in-morocco-buying-on-instagram-tiktok-and-whatsapp/)

---

*Feature research for: Local e-commerce — electric scooters, cash-on-delivery, Morocco*
*Researched: 2026-02-12*
