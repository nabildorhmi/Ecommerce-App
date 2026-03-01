# Phase 08: Frontend Refactoring — Code Architecture, Performance Optimization, and Cleanup - Research

**Researched:** 2026-03-01
**Domain:** React 19 + MUI 7 + Vite 7 Frontend Refactoring
**Confidence:** HIGH

## Summary

This phase focuses on refactoring a React 19 + MUI 7 + Vite frontend application (15,729 lines of TypeScript code across 92 files) to improve performance, eliminate dead code, optimize bundle size, and modernize architecture patterns. The application currently has a 3.0MB main bundle, lacks lazy loading, has unused boilerplate files (App.tsx, App.css), contains remnants of removed features (AdminDeliveryZonesPage not in router), and uses deep relative imports (../../../) extensively.

The research reveals that React 19's automatic compiler-based memoization, React Router v7's granular lazy loading, Vite's built-in code splitting, and modern tools like Knip for dead code detection provide a comprehensive refactoring toolkit. The current codebase follows a feature-sliced architecture pattern but lacks proper code splitting, lazy loading, and has accumulated technical debt from multiple feature additions.

**Primary recommendation:** Implement route-level lazy loading with React.lazy + Suspense, use Knip to identify and remove unused code, optimize the Vite build configuration with granular manual chunks, eliminate deep relative imports with path aliases, and fix TypeScript type errors preventing production builds.

## Current State Analysis

### Codebase Metrics
- **Total files:** 92 TypeScript files (60 .tsx, 32 .ts)
- **Total lines of code:** 15,729 lines
- **Bundle sizes (current production build):**
  - Main bundle: **3.0MB** (index-wawAaku-.js) — CRITICAL ISSUE
  - Three.js vendor: 185KB (three-vendor-D0VhIHm9.js)
  - Animation vendor: 135KB (animation-vendor-C75M3Qit.js)
- **No lazy loading:** All routes eagerly loaded
- **No test coverage:** Zero test files found

### Identified Issues

#### 1. Dead Code & Unused Files
- `src/App.tsx` and `src/App.css` — Vite boilerplate, never imported
- `src/features/admin/pages/AdminDeliveryZonesPage.tsx` — Feature removed but file exists (not in router)
- RTL infrastructure simplified but `RTLProvider.tsx` name is misleading (now just theme provider for LTR French)
- Potential unused imports across 35 files (need Knip analysis)

#### 2. Build-Breaking TypeScript Error
**Location:** `src/features/catalog/pages/ProductDetailPage.tsx:156`
```typescript
// Missing promo_price and is_on_sale properties in type cast
{
  id: product.default_variant.id,
  sku: product.default_variant.sku,
  price: product.default_variant.price,
  stock: product.default_variant.stock,
  attribute_values: [],
} as ProductVariantDisplay  // ERROR: Missing promo_price, is_on_sale
```

#### 3. Architecture Issues
- **Deep relative imports:** 35 files use `../../../` patterns
- **No path aliases:** tsconfig has no path mapping (e.g., @/features)
- **No lazy loading:** All 40+ page components loaded on initial bundle
- **Mixed CSS organization:** Global CSS (index.css, animations.css) + inline MUI styles + CSS variables

#### 4. Performance Issues
- **3.0MB main bundle** — far too large for initial load
- **No route-level code splitting** — all routes in single bundle
- **Heavy 3D component (MiniScooter3D.tsx):** 458 lines, complex Three.js scene loaded on every page with Navbar
- **Hero carousel (HeroCarousel.tsx):** 414 lines, Framer Motion animations
- **Limited memoization:** Only 9 files use useMemo/useCallback (good for React 19, but some opportunities remain)

#### 5. Minor Issues
- **11 occurrences of `any` type** across 6 files
- **CSS duplication:** Both index.css and animations.css define similar keyframes
- **No tests:** Testing infrastructure exists (Vitest configured) but unused

## Standard Stack

### Core Technologies (Already In Use)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| React | 19.2.0 | UI framework with automatic compiler optimizations | ✅ Current |
| React Router | 7.13.0 | Client-side routing (library mode) | ✅ Current |
| MUI | 7.3.8 | Component library (Material UI) | ✅ Current |
| TanStack Query | 5.90.21 | Server state management | ✅ Current |
| Zustand | 5.0.11 | Client state management | ✅ Current |
| Vite | 7.3.1 | Build tool and dev server | ✅ Current |
| TypeScript | 5.9.3 | Type safety | ✅ Current |
| Framer Motion | 12.34.3 | Animations | ✅ Current |

### Tools to Add
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Knip | Latest | Dead code detection (exports, imports, dependencies) | Code cleanup phase |
| vite-plugin-inspect | Latest | Bundle analysis and visualization | Performance audit |

### Already Configured
- ESLint with React Hooks rules
- Vitest + Testing Library (configured but unused)
- TypeScript strict mode
- Vite code splitting (partial: three-vendor, animation-vendor chunks)

## Architecture Patterns

### Current Architecture: Feature-Sliced Design (Partial)

The codebase follows Feature-Sliced Design principles with clear feature boundaries:

```
src/
├── app/                  # App-wide configuration
│   ├── theme.ts         # MUI theme
│   ├── router.tsx       # Route definitions
│   └── queryClient.ts   # TanStack Query config
├── features/            # Feature modules
│   ├── admin/          # Admin dashboard feature
│   │   ├── api/        # API calls
│   │   ├── components/ # Feature components
│   │   ├── pages/      # Route pages
│   │   ├── store/      # Feature state
│   │   └── types.ts    # Feature types
│   ├── auth/
│   ├── cart/
│   ├── catalog/
│   ├── checkout/
│   ├── home/
│   ├── info/
│   └── orders/
└── shared/              # Shared utilities
    ├── api/            # Shared API client
    ├── components/     # Shared components
    ├── constants/      # Shared constants
    └── utils/          # Shared utilities
```

**Strengths:**
- Clear feature boundaries
- Co-location of related code
- API layer separated from UI

**Weaknesses:**
- Deep relative imports (`../../../`) instead of path aliases
- Some shared components are too heavy (MiniScooter3D loaded on all pages)
- No lazy loading boundaries at feature level

### Recommended Pattern: Route-Level Lazy Loading

React Router v7 enables granular lazy loading with `React.lazy`:

```typescript
import { lazy } from 'react';

// Lazy load page components
const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const CatalogPage = lazy(() => import('../features/catalog/pages/CatalogPage'));
const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboardPage'));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense>,
      },
      // ... more routes
    ],
  },
]);
```

**Benefits:**
- Reduces initial bundle from 3.0MB to ~300-500KB
- Each route loads only when visited
- React 19 Suspense handles loading states
- Vite automatically creates separate chunks

### Recommended Pattern: Path Aliases

Replace deep relative imports with TypeScript path aliases:

**Before:**
```typescript
import { apiClient } from '../../../shared/api/client';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
```

**After:**
```typescript
import { apiClient } from '@/shared/api/client';
import { formatCurrency } from '@/shared/utils/formatCurrency';
```

**Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/app/*": ["src/app/*"]
    }
  }
}
```

```typescript
// vite.config.ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Recommended Pattern: Component-Level Code Splitting

Heavy 3D components should be lazily loaded:

```typescript
// Before: MiniScooter3D in Navbar (loaded on every page)
import { MiniScooter3D } from './MiniScooter3D';

// After: Lazy load 3D component
const MiniScooter3D = lazy(() => import('./MiniScooter3D'));

// Use with Suspense
<Suspense fallback={<Box sx={{ width: 200, height: 140 }} />}>
  <MiniScooter3D width={200} height={140} />
</Suspense>
```

### Recommended Pattern: CSS Organization

Consolidate duplicate animations and organize styles:

```
src/
├── styles/
│   ├── global.css       # Global resets, root variables
│   ├── animations.css   # All keyframe animations
│   └── utilities.css    # Utility classes (.mirai-glow, .mirai-glass)
```

Remove duplicate keyframes between index.css and animations.css.

### Anti-Patterns to Avoid

- **Don't lazy load everything:** Small components (<5KB) cost more in HTTP overhead than bundle size
- **Don't split per component:** Lazy load at route/feature level, not individual components
- **Don't use React.memo everywhere:** React 19 compiler handles memoization automatically
- **Avoid premature optimization:** Profile first, optimize second

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dead code detection | Manual search through imports | **Knip** | Tracks unused exports, imports, dependencies, files across entire project; handles complex re-export chains |
| Bundle analysis | Manual webpack-bundle-analyzer setup | **vite-plugin-inspect** or Vite's built-in `--report` | Native Vite integration, visualizes chunk graph |
| Path aliases | Custom module resolution | TypeScript `paths` + Vite `resolve.alias` | Standard solution, IDE autocomplete works |
| Image optimization | Manual compression | Vite `vite-plugin-imagetools` or server-side optimization | Handles responsive images, WebP conversion, lazy loading |
| Component lazy loading | Custom dynamic import wrapper | `React.lazy` + `Suspense` | React 19 native, automatic code splitting, streaming SSR support |

**Key insight:** React 19 + Vite 7 provide built-in solutions for most performance problems. Focus on configuration over custom implementations.

## Common Pitfalls

### Pitfall 1: Over-Splitting Bundles
**What goes wrong:** Creating too many small chunks (10KB each) increases HTTP overhead and slows down loading.
**Why it happens:** Aggressive code splitting without understanding chunk granularity.
**How to avoid:**
- Lazy load at route level (30-100KB chunks)
- Group related features in manual chunks (admin pages together)
- Keep shared vendor chunks (three-vendor, animation-vendor already configured)
**Warning signs:** 50+ chunk files in dist/assets, long waterfall in DevTools Network tab

### Pitfall 2: Lazy Loading Shared Components in Navbar
**What goes wrong:** If MiniScooter3D is lazy loaded in Navbar, it reloads on every route change.
**Why it happens:** Navbar remounts across routes.
**How to avoid:** Keep Navbar synchronous but lazy load route-specific heavy components.
**Warning signs:** Flickering 3D component on navigation, Suspense fallback showing repeatedly

### Pitfall 3: Breaking Dynamic Imports with Manual Chunks
**What goes wrong:** Manual chunks configuration can prevent Vite from creating separate chunks for lazy-loaded routes.
**Why it happens:** Rollup's `manualChunks` can override dynamic import boundaries.
**How to avoid:** Use function-based `manualChunks`, check that lazy imports aren't bundled into main chunk.
**Warning signs:** `npm run build` creates only 1-2 chunks, lazy imports don't reduce main bundle size

### Pitfall 4: Removing "Unused" Code That's Actually Used
**What goes wrong:** Knip reports false positives (e.g., index.html references, Vite env vars, dynamic imports).
**Why it happens:** Static analysis can't detect runtime usage patterns.
**How to avoid:**
- Review Knip output carefully
- Test after removal
- Use Knip's ignore patterns for known false positives
**Warning signs:** Build succeeds but runtime errors appear, missing environment variables

### Pitfall 5: TypeScript Path Aliases Without Vite Configuration
**What goes wrong:** TypeScript compiles but Vite can't resolve imports at runtime.
**Why it happens:** `tsconfig.json` paths need matching `vite.config.ts` aliases.
**How to avoid:** Always configure both TypeScript and Vite path resolution.
**Warning signs:** TypeScript errors gone but Vite dev server shows "Failed to resolve import"

### Pitfall 6: Premature React.memo Usage
**What goes wrong:** Wrapping components in `React.memo` when React 19 compiler already handles it.
**Why it happens:** Outdated React 18 optimization habits.
**How to avoid:** Only use `React.memo` for components with expensive render (>50ms), let React 19 compiler optimize the rest.
**Warning signs:** No measurable performance improvement, added complexity

## Code Examples

### Example 1: Route-Level Lazy Loading with Suspense

```typescript
// src/app/router.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RootLayout } from '../shared/components/RootLayout';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Lazy load page components
const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const CatalogPage = lazy(() => import('../features/catalog/pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('../features/catalog/pages/ProductDetailPage'));
const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboardPage'));
const AdminProducts = lazy(() => import('../features/admin/pages/AdminProductsPage'));

// Fallback component for loading state
function PageLoader() {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh'
    }}>
      <CircularProgress size={40} />
    </Box>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: '/products',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CatalogPage />
          </Suspense>
        ),
      },
      // ... more routes
    ],
  },
]);
```

**Source:** [React Router 7 Lazy Loading](https://www.robinwieruch.de/react-router-lazy-loading/)

### Example 2: Optimized Vite Manual Chunks Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for large dependencies
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-vendor';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // Other node_modules go to common vendor chunk
            return 'vendor';
          }

          // Feature-based chunks for admin routes
          if (id.includes('/features/admin/')) {
            return 'admin-chunk';
          }
        },
      },
    },
    // Report bundle size
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // Warn if chunk > 1MB
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
});
```

**Source:** [Vite Build Options](https://vite.dev/config/build-options)

### Example 3: Knip Configuration for Dead Code Detection

```json
// knip.json
{
  "entry": [
    "src/main.tsx",
    "src/app/router.tsx",
    "vite.config.ts"
  ],
  "project": [
    "src/**/*.{ts,tsx}"
  ],
  "ignore": [
    "src/test/**",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}"
  ],
  "ignoreDependencies": [
    "@types/*",
    "@testing-library/*",
    "vitest",
    "@vitest/ui"
  ],
  "vite": true,
  "react": true
}
```

**Usage:**
```bash
# Install Knip
npm install -D knip

# Run analysis
npx knip

# Export report
npx knip --reporter json > knip-report.json
```

**Source:** [Knip Documentation](https://knip.dev/)

### Example 4: TanStack Query Optimization for Render Performance

```typescript
// src/app/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Structural sharing enabled by default (React Query v5)
      // Keeps references stable between re-renders
      structuralSharing: true,

      // Longer stale time reduces unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes (already configured)

      // Reduced retry for faster error feedback
      retry: 1,

      // Refetch on window focus only if data is stale
      refetchOnWindowFocus: 'always',

      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});
```

**Advanced: Selective Subscriptions**
```typescript
// Instead of subscribing to entire query result
const { data } = useProducts(filters);
const productNames = data?.data.map(p => p.name); // Re-renders on ANY data change

// Use select to subscribe to subset
const productNames = useProducts(filters, {
  select: (data) => data.data.map(p => p.name),
});
// Only re-renders when product names change
```

**Source:** [TanStack Query Render Optimizations](https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations)

### Example 5: Fixing the ProductDetailPage TypeScript Error

```typescript
// src/features/catalog/pages/ProductDetailPage.tsx (line 154-164)

const handleAddToCart = () => {
  // If product has no attribute variants, pass the default variant
  const variantToAdd = selectedVariant ?? (
    !hasVariants && product.default_variant
      ? {
        id: product.default_variant.id,
        sku: product.default_variant.sku,
        price: product.default_variant.price,
        promo_price: product.default_variant.promo_price,  // ← ADD THIS
        is_on_sale: product.default_variant.is_on_sale,    // ← ADD THIS
        stock: product.default_variant.stock,
        attribute_values: [],
      } as ProductVariantDisplay
      : null
  );
  addItem(product, product.name, variantToAdd);
  setSnackbarOpen(true);
};
```

## State of the Art (2026)

| Old Approach (2024) | Current Approach (2026) | When Changed | Impact |
|---------------------|-------------------------|--------------|--------|
| Manual `useMemo`/`useCallback` everywhere | React Compiler auto-memoization | React 19 (Dec 2024) | Reduce boilerplate, better optimization |
| `webpack-bundle-analyzer` | Vite `--report` flag or `vite-plugin-inspect` | Vite 5+ (2024) | Native integration, faster builds |
| Custom dead code scripts | Knip | 2024-2026 | Comprehensive analysis (exports, imports, deps, files) |
| Component-level code splitting | Route-level lazy loading | React Router v7 (2025) | Better chunk granularity |
| Esbuild minifier | Oxc minifier (Rust-based) | Vite 8 (expected 2026) | Faster minification |
| Rollup bundler | Rolldown (Rust-based) | Vite 8 (expected 2026) | 10x faster builds |

**Deprecated/outdated:**
- `React.FC` type: Removed from React 19, use function declarations instead
- `CRA (Create React App)`: Officially deprecated, use Vite
- Separate `react-router-dom`: Merged into `react-router` v7

**2026 Best Practices (Vercel React Best Practices):**
- Automatic batching covers all state updates
- Server Components for zero-JS sections (not applicable to this SPA, but relevant for future)
- React 19 Actions for form handling with automatic pending states
- Streaming SSR with Suspense boundaries

**Source:** [Vercel Releases React Best Practices Skill with 40+ Performance Rules](https://www.infoq.com/news/2026/02/vercel-react-best-practices/)

## Open Questions

1. **Should we migrate to Server Components?**
   - What we know: React 19 supports Server Components, could reduce bundle size by 50%+
   - What's unclear: Would require framework change (Next.js/Remix), significant architecture shift
   - Recommendation: Out of scope for this phase, note as future improvement in Phase 9+ roadmap

2. **Should we add E2E testing during refactor?**
   - What we know: Vitest configured but unused, no test coverage
   - What's unclear: User priority for testing vs performance
   - Recommendation: Add basic smoke tests for critical paths (checkout, admin product creation) to prevent regressions during refactor

3. **How to handle the MiniScooter3D component in Navbar?**
   - What we know: 458 lines, complex Three.js scene, loaded on every page
   - What's unclear: Is it visible on all pages? Could it be removed from some routes?
   - Recommendation: Profile component render cost, consider lazy loading with Suspense or making it route-specific (only on homepage)

4. **Should we replace MUI with a lighter alternative?**
   - What we know: MUI vendor bundle is likely large (need to measure after splitting)
   - What's unclear: Would switching to Tailwind or shadcn/ui reduce bundle significantly?
   - Recommendation: Out of scope for this phase, but measure MUI bundle size after optimization; if >500KB, consider migration in future

5. **What about i18n future support?**
   - What we know: Arabic removed, only FR/EN mentioned, but then i18n fully removed (French-only)
   - What's unclear: Will multi-language support be needed again?
   - Recommendation: If yes, plan for i18n infrastructure (react-i18next) during refactor to avoid second refactor later

## Sources

### Primary (HIGH confidence)
- [React v19 Official Release](https://react.dev/blog/2024/12/05/react-19) - React 19 features and compiler
- [Vite Build Options Documentation](https://vite.dev/config/build-options) - Official Vite configuration
- [React Router Automatic Code Splitting](https://reactrouter.com/explanation/code-splitting) - Official React Router docs
- [TanStack Query Render Optimizations](https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations) - Official TanStack Query docs
- [Knip Documentation](https://knip.dev/) - Official Knip docs

### Secondary (MEDIUM confidence)
- [React Router 7 Lazy Loading Tutorial](https://www.robinwieruch.de/react-router-lazy-loading/) - Community tutorial verified with official docs
- [Faster Lazy Loading in React Router v7.5+](https://remix.run/blog/faster-lazy-loading) - Official Remix/React Router blog
- [Vercel React Best Practices (2026)](https://www.infoq.com/news/2026/02/vercel-react-best-practices/) - Industry best practices
- [Feature-Sliced Design](https://feature-sliced.design/) - Architectural methodology documentation
- [Vite: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/vite-complete-guide) - Community guide

### Tertiary (LOW confidence - marked for validation)
- [React 19 Best Practices DEV Community](https://dev.to/jay_sarvaiya_reactjs/react-19-best-practices-write-clean-modern-and-efficient-react-code-1beb) - Community post
- [React Performance Optimization: 15 Best Practices for 2025](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9) - Community post

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All technologies verified from package.json and official docs
- Architecture: HIGH - Codebase analyzed directly, patterns verified with Feature-Sliced Design docs
- Performance issues: HIGH - Bundle sizes measured from dist/, TypeScript errors reproduced
- Pitfalls: MEDIUM - Based on official docs + community experience, some scenarios need validation
- Dead code detection: HIGH - Knip recommended by Effective TypeScript (authoritative source)

**Research date:** 2026-03-01
**Valid until:** 2026-06-01 (React 19 stable, Vite 7 stable, techniques are mature)

---

## Ready for Planning

Research complete. Key findings:

1. **Critical issue identified:** 3.0MB main bundle must be reduced via lazy loading
2. **Build broken:** TypeScript error in ProductDetailPage.tsx blocks production builds
3. **Dead code exists:** App.tsx, App.css, AdminDeliveryZonesPage.tsx unused
4. **Architecture solid:** Feature-Sliced Design in place, needs path aliases + lazy loading
5. **Modern stack:** React 19 + Vite 7 provide all needed tools, minimal dependencies to add

Planner can now create PLAN.md files based on this research.
