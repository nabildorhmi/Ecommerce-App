# Quick Task 17 — Hybrid Cart Persistence

## Result: COMPLETE

## What Was Built

### Backend (Laravel)
- **Migration** (`2026_04_19_000001_create_carts_table.php`): `carts` (user_id unique FK) + `cart_items` (cart_id, product_id, variant_id nullable, quantity) with composite unique constraint
- **Models**: `Cart` (user, items relations) + `CartItem` (cart, product, variant relations)
- **CartController** with 6 endpoints:
  - `GET /cart` — fetch user's cart with product/variant eager loading, filters inactive products
  - `POST /cart/sync` — merge guest cart with DB cart (sums quantities, caps at stock)
  - `POST /cart/items` — add item (updateOrCreate, stock-capped)
  - `PATCH /cart/items/{id}` — update quantity (ownership verified)
  - `DELETE /cart/items/{id}` — remove item
  - `DELETE /cart` — clear all items
- **Routes** registered under `auth:sanctum` middleware

### Frontend (React/TypeScript)
- **Cart API** (`cart/api/cart.ts`): 6 functions wrapping all backend endpoints
- **Cart Store** upgraded with:
  - `syncWithServer()` — sends local items to POST /cart/sync, replaces state with server response
  - `loadFromServer()` — fetches GET /cart, replaces state
  - `debouncedSync()` — 500ms debounce after any mutation when authenticated
  - `clearCartApi()` called on clearCart when authenticated
  - Guest behavior unchanged (localStorage only, no API calls)
- **Login/Register sync**: Both LoginPage handlers and CheckoutPage inline registration call `syncWithServer()` after auth

## Commits
- `cdbc8af` — Backend: migration, models, controller, routes
- `4498d7d` — Frontend: cart API, hybrid store, login sync

## Architecture Decisions
- Full-cart sync via POST /cart/sync (not per-item CRUD) — simpler, avoids needing server cart_item IDs on frontend
- 500ms debounce batches rapid mutations
- Prices NOT stored in cart_items — looked up from products/variants at read time
- Zustand store remains single source of truth for UI
