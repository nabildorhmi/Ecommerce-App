# TrotinetteApp

## What This Is

A local e-commerce web application for selling electric scooters in Morocco. Customers browse products, add to cart, and place orders with cash-on-delivery payment. An admin manually confirms orders and manages the entire store. Built with Laravel (API backend) and React with Material UI (frontend), designed to expand beyond scooters into other product categories.

## Core Value

Customers can browse electric scooters, place orders, and pay cash on delivery — with an admin who controls the entire catalog, orders, and delivery zones.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Product catalog with specs, variants, image galleries, stock tracking, and categories/filters
- [ ] Shopping cart with add/remove/update quantities
- [ ] Order placement with city-based delivery fee calculation
- [ ] Cash on delivery — no online payment, order confirmation message shown after placing
- [ ] Admin manual order confirmation/rejection workflow
- [ ] Order status tracking (pending, confirmed, delivered)
- [ ] User accounts with profile, delivery address, order history, and wishlist
- [ ] Admin dashboard: manage products, stock, orders, delivery zones, and users
- [ ] Trilingual storefront: French, Arabic, and English with language switcher
- [ ] Extensible product model — not scooter-specific, supports future product categories

### Out of Scope

- Online payment integration — local cash-on-delivery model only
- Mobile native app — web-first approach
- Real-time chat or customer support widget — defer to future
- Automated delivery tracking/GPS — admin handles logistics offline

## Context

- **Market:** Morocco, local delivery only
- **Delivery model:** Customer selects a Moroccan city at checkout; delivery fee varies by city. Admin manages the city/fee list.
- **Payment model:** Cash on delivery. No payment gateway needed. Customer sees order confirmation and pays the delivery person.
- **Product focus:** Electric scooters initially (specs like speed, battery, range, weight, colors) but the data model must be generic enough for any product category.
- **User roles:** Admin (full store management) and Customer (browse, buy, manage account)
- **Languages:** French (primary), Arabic, English — RTL support needed for Arabic

## Constraints

- **Tech stack**: Laravel (PHP) backend API + React frontend with Material UI — non-negotiable
- **No online payment**: Cash on delivery only, no payment gateway integration
- **Extensibility**: Product model must support arbitrary categories and attribute types, not hardcoded to scooters
- **RTL support**: Arabic language requires right-to-left layout handling

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Laravel API + React SPA | User's chosen stack, clean separation of concerns | — Pending |
| Cash on delivery only | Local market, no payment gateway complexity | — Pending |
| City-based delivery fees | Morocco delivery model, admin-managed fee table | — Pending |
| Generic product model | Future expansion beyond scooters | — Pending |
| Trilingual (FR/AR/EN) | Moroccan market needs, Arabic RTL required | — Pending |

---
*Last updated: 2026-02-12 after initialization*
