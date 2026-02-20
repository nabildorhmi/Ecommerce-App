# Codebase Concerns

**Analysis Date:** 2026-02-20

## Tech Debt

**Large Component Files:**
- Issue: Several frontend page components exceed 350+ lines, combining form logic, state management, UI rendering, and data fetching in a single file. Makes testing, reusability, and maintenance difficult.
- Files:
  - `trotinette-frontend/src/features/admin/components/ProductForm.tsx` (431 lines)
  - `trotinette-frontend/src/features/admin/pages/AdminDeliveryZonesPage.tsx` (396 lines)
  - `trotinette-frontend/src/features/orders/pages/AdminOrderDetailPage.tsx` (370 lines)
  - `trotinette-frontend/src/shared/components/Navbar.tsx` (367 lines)
- Impact: Difficult to test individual behaviors, high cognitive load for maintainers, increased risk of regression when making changes
- Fix approach: Extract sub-components for form sections, dialogs, and table renderers. Create custom hooks for complex state logic (e.g., `useProductFormState`, `useOrderTransition`). Move dialog/modal logic into separate presentational components.

**Minimal Query Client Configuration:**
- Issue: `trotinette-frontend/src/app/queryClient.ts` only sets `staleTime: 5 minutes` and `retry: 1`. No error handling, retry strategies, or cache invalidation patterns configured.
- Files: `trotinette-frontend/src/app/queryClient.ts`
- Impact: Queries may fail silently or without proper exponential backoff. Network errors could be retried too aggressively. No global error boundary for React Query failures.
- Fix approach: Add `retry: (failureCount, error) => shouldRetry(error)` with exponential backoff. Configure error boundary integration. Add `gcTime` (garbage collection time) settings. Consider adding `networkMode` for offline support.

**No Global Error Boundary:**
- Issue: React components lack error boundary implementation. Frontend API errors are handled on per-component basis (e.g., `CheckoutPage` extracts error message inline at line 82-86, `AdminProductsPage` shows generic alert). No centralized error logging or recovery strategy.
- Files:
  - `trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx` (lines 82-86)
  - `trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx` (lines 168-173)
- Impact: Inconsistent error messaging across app. Hard to track patterns of failures. Users may see confusing error states without context.
- Fix approach: Create error boundary component at root level. Implement centralized error handler that logs to monitoring service and shows user-friendly messages. Use React Router error boundaries for page-level failures.

**Auth Token Storage in localStorage:**
- Issue: JWT token stored in `localStorage` (not `sessionStorage` or memory-only). If XSS vulnerability is exploited, attacker gains persistent access. Token cleared only on 401 response or manual logout.
- Files: `trotinette-frontend/src/features/auth/store.ts` (line 34)
- Impact: Token theft via XSS is a high-impact security issue. No automatic token refresh mechanism visible. Token persists across browser sessions.
- Fix approach: Consider httpOnly cookies with SameSite flag for token storage (requires backend support). Implement token refresh mechanism with short-lived access tokens. Add XSS mitigation (CSP headers, input sanitization). Log suspicious auth failures.

## Known Bugs

**Image Uploader Preview Memory Leak Risk:**
- Symptoms: `URL.createObjectURL()` is called for each new image preview, and `URL.revokeObjectURL()` is called on removal. However, if user navigates away before removing previews, object URLs remain unreleased.
- Files: `trotinette-frontend/src/features/admin/components/ImageUploader.tsx` (lines 40-43, 57-68)
- Trigger: Upload images to product form, then navigate away without removing previews
- Workaround: Add cleanup in component unmount using `useEffect` return value to revoke all pending URLs. Implement using `useCallback` dependency on unmount.

**Form Error Message Language Mix:**
- Symptoms: Zod schema error messages in `ProductForm` are in French, but form validation messages in `CheckoutPage` mix French and English. No consistent localization pattern.
- Files:
  - `trotinette-frontend/src/features/admin/components/ProductForm.tsx` (lines 35-62, all French)
  - `trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx` (line 25, English)
- Trigger: User views form validation errors on different pages
- Workaround: Use i18n translation keys instead of hardcoded strings. Extract all validation messages to localization files.

**Race Condition in Stock Validation:**
- Symptoms: Cart allows adding items up to `stockQuantity`, but order service validates stock with pessimistic locking. If stock changes between cart view and order placement, cart items may show as out-of-stock at checkout.
- Files:
  - `trotinette-frontend/src/features/cart/store.ts` (lines 24-25, checks local stock)
  - `trotinette-api/app/Services/OrderService.php` (lines 64-68, validates again with lock)
- Trigger: Admin decreases product stock while customer has item in cart with old quantity
- Workaround: Real-time stock sync not implemented. Cart should refetch product stock before checkout. Consider WebSocket or polling for live inventory.

## Security Considerations

**Missing Authorization Checks on Admin Routes:**
- Risk: Admin route protection uses `AdminRoute` component checking user role, but no explicit endpoint authorization. Backend controllers rely on implicit model authorization (e.g., `Product` model implicit ownership).
- Files:
  - `trotinette-frontend/src/shared/components/AdminRoute.tsx`
  - `trotinette-api/app/Http/Controllers/Admin/*.php`
- Current mitigation: Route-based checks on frontend, relying on API 401 responses. No explicit policy classes visible.
- Recommendations: Implement Laravel Policies for model authorization. Add middleware to verify admin role on all admin routes. Log admin actions for audit trail.

**FormData Multipart Request Not Signed:**
- Risk: FormData requests for file uploads don't include CSRF token explicitly (FormData header manipulation issue). Backend may not validate CSRF on multipart requests.
- Files: `trotinette-frontend/src/features/admin/api/products.ts` (lines 126-128, 166-168)
- Current mitigation: Browser sends CSRF token if Laravel middleware configured. No explicit token in FormData seen.
- Recommendations: Verify Laravel CSRF middleware is enabled for POST/PATCH. Add explicit CSRF token to FormData if needed. Validate all file uploads server-side.

**Insufficient Input Validation on Text Fields:**
- Risk: Many text fields (SKU, phone, note) accept arbitrary input with basic length validation. No whitespace normalization or SQL injection prevention visible in frontend.
- Files: Multiple form pages with `TextField` and `register()` from react-hook-form
- Current mitigation: Backend form requests have validation rules (`StoreProductRequest`, `LoginRequest`). HTML input types set appropriately.
- Recommendations: Add HTML5 input attributes (`maxLength`, `pattern`). Backend validation is in place—ensure database queries use prepared statements (Laravel Eloquent does this).

**Order Duplication Check Window (10 minutes):**
- Risk: Duplicate order detection uses 10-minute window with phone number + overlapping product. An attacker could exploit this by timing requests or using different products to bypass check.
- Files: `trotinette-api/app/Services/OrderService.php` (lines 28-39)
- Current mitigation: Uses pessimistic locking with `lockForUpdate()` on products and orders. Validates stock on each item.
- Recommendations: Consider using ULID or UUID for idempotency key in order requests. Reduce 10-minute window if duplicate orders are frequent. Log duplicate attempts for monitoring.

## Performance Bottlenecks

**N+1 Query on Product List:**
- Problem: `AdminProductsPage` loads all products with images, translations, category—each product load may trigger separate media/translation queries if not eager-loaded.
- Files:
  - `trotinette-api/app/Http/Controllers/Admin/ProductController.php` (line 25-28, loads with eager loading)
  - `trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx` (line 139, expects paginated data)
- Cause: QueryBuilder is properly configured with eager loading, but pagination is set at 20 items per page (line 45). Frontend may request many pages sequentially.
- Improvement path: Keep 20/page as reasonable. Monitor slow queries with Laravel Debugbar. Consider search filters to reduce result set before pagination.

**No Pagination on Large Tables:**
- Problem: Admin tables (AdminProductsPage, AdminOrdersPage, AdminUsersPage, AdminCategoriesPage) paginate at 20 items per page, but UI may load many pages without virtualization if user scrolls.
- Files: Admin pages in `trotinette-frontend/src/features/admin/pages/`
- Cause: React Query handles pagination, but frontend renders full table rows. No virtual scrolling or lazy loading implemented.
- Improvement path: Implement react-virtual for table rows. Add "load more" pagination instead of offset. Cache previous page results.

**Image Conversion not Queued:**
- Problem: `trotinette-api/app/Models/Product.php` (lines 44-54) defines media conversions as `nonQueued()`, meaning thumbnail generation happens synchronously during upload.
- Files: `trotinette-api/app/Models/Product.php` (lines 44-54)
- Cause: Improves user experience (instant thumbnails) but blocks request if images are large. Could timeout on slow servers.
- Improvement path: Keep non-queued for responsive UX, but add timeout handling. Or queue conversions asynchronously and show placeholder images.

**Zustand Store Persistence Overhead:**
- Problem: Cart and auth stores persist to localStorage on every change. For cart with many items or rapid updates, this could cause jank.
- Files:
  - `trotinette-frontend/src/features/cart/store.ts` (lines 82-87)
  - `trotinette-frontend/src/features/auth/store.ts` (lines 32-36)
- Cause: Zustand persist middleware serializes entire state to localStorage on each write. No debouncing.
- Improvement path: Implement debounced persistence (e.g., 500ms). Consider IndexedDB for large cart data. Profile localStorage writes in dev tools.

## Fragile Areas

**OrderService Transaction Isolation:**
- Files: `trotinette-api/app/Services/OrderService.php` (lines 18-121)
- Why fragile: Complex transaction with multiple locking strategies (pessimistic lock on products, duplicate check, stock decrement, order creation). If any step fails mid-transaction, no compensating logic visible.
- Safe modification: Add comprehensive error handling and logging within transaction. Test edge cases: concurrent orders, stock exhaustion, delivery zone becoming inactive mid-request. Use database transactions rollback to ensure atomicity.
- Test coverage: No test files visible for OrderService. Critical business logic needs comprehensive unit + integration tests.

**Product Form State Management:**
- Files: `trotinette-frontend/src/features/admin/components/ProductForm.tsx` (431 lines)
- Why fragile: Manages form state, image uploads, slug auto-generation, validation, and mutations in one component. Multiple side effects with useEffect and state watchers. Manual slug tracking (`frSlugManual`, `enSlugManual`) could get out of sync.
- Safe modification: Extract image management into custom hook. Create separate hook for slug generation logic. Use react-hook-form's `watch()` more carefully to avoid race conditions between auto-generation and manual edits.
- Test coverage: No tests visible. Need unit tests for slug generation, image upload validation, form submission flows.

**AdminRoute Permission Check:**
- Files: `trotinette-frontend/src/shared/components/AdminRoute.tsx`
- Why fragile: Checks `user?.role === 'admin'` but no refresh of user data before rendering protected pages. If token expires, user data may be stale.
- Safe modification: Validate token freshness before rendering. Call `/me` endpoint on AdminRoute mount. Set up token refresh interceptor to keep auth state current.
- Test coverage: Permission-based routing needs integration tests with mock auth states.

## Scaling Limits

**Image Storage Without Cleanup:**
- Current capacity: 10 images per product (hardcoded limit in `ImageUploader`). Spatie MediaLibrary handles files on disk.
- Limit: No disk space management visible. Old/deleted product images may accumulate. No S3 or CDN configured.
- Scaling path: Implement scheduled cleanup of orphaned media files. Migrate to S3 + CloudFront for image storage. Add image compression and format conversion.

**Database Query Performance at Scale:**
- Current capacity: Product list with QueryBuilder supports 20 items per page. Search uses FULLTEXT when search >= 4 chars, falls back to LIKE.
- Limit: FULLTEXT index only on translations table. At 10k+ products, pagination and filtering performance may degrade.
- Scaling path: Add composite indexes on (is_active, category_id, price). Monitor slow query log. Consider Elasticsearch for search if catalog grows to 100k+ items.

**Bearer Token Lookup on Every Request:**
- Current capacity: `useAuthStore.getState().token` called in axios interceptor on every request. In-memory lookup.
- Limit: No caching or optimization. At 1000+ concurrent requests, token lookup is negligible but worth monitoring.
- Scaling path: Implement connection pooling on backend. Consider caching token validation results with short TTL. Monitor auth middleware performance.

## Dependencies at Risk

**Laravel Media Library Customization:**
- Risk: Spatie MediaLibrary is tightly integrated for product images. Custom conversions (thumbnail, card, full) hardcoded in model. Upgrading media library or changing image strategy requires refactoring.
- Impact: Breaking changes in MediaLibrary would require controller + service updates. No abstraction layer.
- Migration plan: Create image service interface. Implement Spatie-specific implementation. Abstract file storage behind interface to allow migration to S3/other providers.

**Zod Schema Duplication:**
- Risk: Zod schemas defined in multiple frontend forms (`ProductForm`, `CheckoutPage`, `LoginForm`) with overlapping validation rules. No shared schema library.
- Impact: Changing validation rules requires updating multiple files. Inconsistent error messages across forms.
- Migration plan: Create shared schema definitions in `src/shared/schemas/`. Export reusable schemas (e.g., phoneSchema, slugSchema).

## Missing Critical Features

**No Offline Support:**
- Problem: Cart data persists to localStorage but app doesn't handle offline scenario. Order placement will fail without network.
- Blocks: Users cannot browse catalog offline or save cart for later.
- Fix: Implement service worker for offline cache. Show "offline" indicator. Queue order placement for retry when online.

**No Email Notifications:**
- Problem: Order confirmation is shown on frontend page only. No email sent to customer or admin.
- Blocks: Customers have no order confirmation record. Admin must actively check dashboard.
- Fix: Add email service (Laravel Mailable/Jobs). Send order confirmation, status updates, delivery notifications.

**No Stock Alerts:**
- Problem: No monitoring for low stock. Admins must manually check inventory.
- Blocks: Risk of overselling. No notification when products go out of stock.
- Fix: Add inventory management dashboard. Send low-stock alerts to admins. Auto-disable products when stock = 0.

**No Inventory Audit Trail:**
- Problem: Stock changes are not logged. Cannot track who changed inventory or why.
- Blocks: No historical data for stock discrepancies. Cannot debug overselling issues.
- Fix: Create OrderStatusLog-like system for inventory changes. Log product updates (stock, price changes) with user and timestamp.

## Test Coverage Gaps

**No Unit Tests for Services:**
- What's not tested: `OrderService` (complex transaction logic), `ProductService` (media handling), `AuthService` (token generation)
- Files: `trotinette-api/app/Services/*.php`
- Risk: Business logic bugs would only be caught in integration tests or production
- Priority: High - services contain critical domain logic

**No E2E Tests for Critical Paths:**
- What's not tested: Complete order creation flow (cart → checkout → order placement → confirmation)
- Files: No test files visible in codebase
- Risk: Workflow bugs only found through manual testing
- Priority: High - order flow is revenue-critical

**No Component Tests for Forms:**
- What's not tested: Form validation, submission, error handling, image upload flows
- Files: All form components (`ProductForm.tsx`, `CategoryForm.tsx`, `LoginForm.tsx`, `CheckoutPage.tsx`)
- Risk: Form regressions not caught. Complex forms like ProductForm have no behavior tests.
- Priority: Medium - forms are frequently modified

**No API Contract Tests:**
- What's not tested: API request/response contracts, validation rules, error messages
- Files: All endpoints in `trotinette-api/app/Http/Controllers/`
- Risk: Frontend and backend can become out of sync. API changes break frontend silently.
- Priority: Medium - API is rapidly evolving

**No Accessibility Tests:**
- What's not tested: ARIA labels, keyboard navigation, color contrast, screen reader compatibility
- Files: All MUI components lack explicit accessibility testing
- Risk: App inaccessible to users with disabilities. No WCAG compliance validation.
- Priority: Low - not critical for MVP but important for accessibility

---

*Concerns audit: 2026-02-20*
