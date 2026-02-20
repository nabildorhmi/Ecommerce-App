# Coding Conventions

**Analysis Date:** 2026-02-20

## Naming Patterns

**Files:**
- Components: PascalCase with .tsx extension: `LoginForm.tsx`, `ProductCard.tsx`
- Pages: PascalCase with "Page" suffix: `CatalogPage.tsx`, `AdminProductEditPage.tsx`
- Hooks: camelCase with "use" prefix: `useCatalogFilters.ts`, `useAuthStore.ts`
- Types/Interfaces: PascalCase: `AdminProduct`, `CartItem`, `LoginFormData`
- Utilities: camelCase: `formatCurrency.ts`
- API files: camelCase matching resource name: `products.ts`, `categories.ts`
- Stores: camelCase with "store" suffix: `themeStore.ts`, `authStore.ts`
- Services (PHP): PascalCase: `ProductService.php`, `OrderService.php`
- Controllers (PHP): PascalCase with "Controller" suffix: `ProductController.php`
- Request classes (PHP): PascalCase: `StoreProductRequest.php`, `UpdateProductRequest.php`

**Functions:**
- TypeScript: camelCase: `buildProductFormData()`, `slugify()`, `formatCurrency()`
- React components: PascalCase as named exports: `export function LoginForm() {}`
- PHP: camelCase: `createProduct()`, `updateProduct()`, `deleteProduct()`
- React hooks: `useXxx` prefix: `useForm()`, `useQuery()`, `useMutation()`

**Variables:**
- Local variables: camelCase: `productId`, `totalItems`, `isLoading`
- Constants (TypeScript): UPPER_SNAKE_CASE not observed; use as const for local constants
- Constants (PHP): UPPER_SNAKE_CASE in enums and classes: `OrderStatus::COMPLETED`
- Boolean variables: prefix with `is` or `has`: `isActive`, `isLoading`, `hasImages`

**Types:**
- Interface names: PascalCase: `CartState`, `AuthState`, `ProductFormData`
- Enums (PHP): PascalCase: `OrderStatus` with UPPER_SNAKE_CASE values
- Union types: explicit with Zod or TypeScript union: `'fr' | 'en'`, `role: 'admin' | 'customer'`
- Optional fields: Use Zod `.optional()` or TypeScript `?` for nullable fields

## Code Style

**Formatting:**
- Tool: ESLint + TypeScript ESLint (frontend)
- Tool: Laravel Pint (backend)
- No Prettier config found; formatting via ESLint rules
- Indentation: 2 spaces (TypeScript observed in source files)
- PHP follows PSR-12 conventions via Pint

**Linting:**
- Frontend: ESLint with `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Config: `eslint.config.js` (flat config format)
- Rules enabled:
  - TypeScript strict mode recommended configs
  - React hooks rules enforced
  - React refresh integration for HMR safety
- Backend: Laravel Pint for PHP code style

**Linting Commands:**
```bash
npm run lint              # Frontend: run ESLint
./vendor/bin/pint        # Backend: check PHP style (Laravel)
```

## Import Organization

**Order:**
1. External library imports (React, third-party)
2. Internal shared imports (features, shared/)
3. Type imports separated with `import type`
4. Comments for grouping sections

**Examples:**
```typescript
// External libraries
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Box from '@mui/material/Box'

// Internal features
import { useAuthStore } from '../../features/auth/store'
import { apiClient } from '../../../shared/api/client'

// Types
import type { LoginFormData } from '../types'
import type { User } from '../../features/auth/store'
```

**Path Aliases:**
- TypeScript: Not explicitly configured, all imports use relative paths
- Frontend structure uses feature-based folders: `src/features/[feature]/[type]/`

## Error Handling

**Frontend Patterns:**
- Form validation: Zod schemas with react-hook-form integration
- Example: `loginSchema` in `LoginForm.tsx` defines email/password rules
- API errors: Captured in React Query mutation `error` field
- Error display: Material-UI `<Alert severity="error">` components
- Auth errors: 401 responses trigger logout in axios interceptor (`apiClient.ts`)
- Type-safe error extraction: Cast error objects and drill to `.response?.data?.message`

**Backend Patterns (PHP):**
- Request validation: Form Request classes with `rules()` method
- Example: `StoreProductRequest` validates SKU, price, translations, images
- `prepareForValidation()`: Transform input before validation (e.g., JSON decode attributes)
- Service layer handles business logic and returns models
- Controllers delegate to services, return status codes (201 on create, 204 on delete)

## Logging

**Framework:** console (TypeScript), Laravel logging (PHP)

**Patterns:**
- Frontend: No explicit logging framework observed; comments document complex flows
- Example in `buildProductFormData()`: JSDoc comments explain FormData construction for multipart uploads
- Backend: Laravel's built-in logging via `Log` facade (not observed in sample code)
- Critical sections documented: multipart boundary issues, JSON decoding, state snapshots

## Comments

**When to Comment:**
- Complex business logic or non-obvious decisions
- Workarounds or platform-specific constraints
- JSDoc for public APIs, especially type conversions

**Examples:**
- `products.ts`: "CRITICAL: Do not set Content-Type — let the browser add the multipart boundary"
- `CartItem`: Documents why prices/stock are snapshotted
- `useCatalogFilters.ts`: Explains URL param persistence pattern
- `CatalogPage.tsx`: Documents page sections with inline comments

**JSDoc/TSDoc:**
- Used for exported functions: `formatCurrency()` has @param and @returns
- Interface and type exports documented with inline comments
- Function docstrings explain purpose and constraints

## Function Design

**Size:**
- Small focused functions observed: `slugify()` is 6 lines, `formatCurrency()` is 10 lines
- Hooks under 50 lines for simple state management
- Complex hooks like `useCatalogFilters()` ~35 lines
- Page components 100-150 lines (with inline skeleton/filter rendering)
- Service methods keep single responsibility: `createProduct()`, `updateProduct()`, `deleteProduct()`

**Parameters:**
- React hooks: Pass config objects rather than multiple args: `useQuery<Type>({ queryKey, queryFn, ... })`
- API mutations: Typed input objects: `CreateProductInput`, `UpdateProductInput`
- Functions: Accept single object for > 2 params: `setFilter(key, value)` is 2 params OK

**Return Values:**
- React Query hooks return `UseQueryResult<T>` with `data`, `isLoading`, `error`
- Services return loaded models: `return product.load(['translations', 'media', 'category'])`
- Mutations return responses wrapped by React Query
- Void functions used for state updates: `clearAuth()`, `clearCart()` return void

## Module Design

**Exports:**
- Named exports for functions/components: `export function LoginForm() {}`
- Default exports for page components: `export default App`
- Type exports: `export interface User {}`, `export type LoginFormData = z.infer<typeof loginSchema>`
- Store exports: `export const useAuthStore = create<AuthState>()`

**Barrel Files:**
- Not observed; imports use full paths to individual files
- Example: Import directly from `features/auth/store.ts` not from `features/auth/`
- Each feature folder is independently imported

## Architecture Patterns

**Frontend:**
- Feature-based folder structure with api/components/pages/hooks per feature
- Zustand for global state (auth, cart, theme)
- React Query for server state and API data
- Zod for runtime type validation and form schemas
- Material-UI for components

**Backend:**
- MVC with Controllers -> Services -> Models
- Request classes for validation with `prepareForValidation()` for data transformation
- Service layer encapsulates business logic (product creation with translations, media)
- Eloquent models with relationships and scopes
- Laravel Query Builder / Spatie Query Builder for filtering/sorting

---

*Convention analysis: 2026-02-20*
