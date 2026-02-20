# Testing Patterns

**Analysis Date:** 2026-02-20

## Test Framework

**Frontend:**

**Runner:**
- Vitest 3.2.4
- Config: `vite.config.ts`
- Environment: jsdom (browser-like)
- Globals enabled (describe, it, test, expect available without imports)
- Setup file: `src/test/setup.ts`

**Assertion Library:**
- Vitest built-in assertions
- Testing Library: `@testing-library/react` 16.3.2, `@testing-library/jest-dom` 6.9.1
- User interactions: `@testing-library/user-event` 14.6.1

**Run Commands:**
```bash
npm run build              # Build (includes tsc -b)
npm run dev                # Development watch mode (Vite)
npm run lint               # ESLint check
npm run preview            # Preview built app
```

**Note:** No dedicated test run command found in package.json; Vitest runs via Vite integration.

**Backend:**

**Runner:**
- PHPUnit 11.5.3
- Config: `phpunit.xml`
- Test suites: Unit and Feature

**Run Commands:**
```bash
php artisan test                    # Run all tests
php artisan test --filter=pattern   # Run specific tests
php artisan tinker                  # Interactive shell
```

## Test File Organization

**Frontend:**

**Location:**
- Setup file: `src/test/setup.ts` (minimal - only imports jest-dom)
- Tests co-located with source (pattern observed, but no actual test files in codebase)
- Expected pattern based on config: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`

**Naming:**
- Consistent with Vitest convention: `ComponentName.test.tsx`

**Backend:**

**Location:**
- Separate from source: `tests/` directory
- Subdirectories: `tests/Unit/` and `tests/Feature/`

**Naming:**
- Feature tests: `tests/Feature/ExampleTest.php`
- Unit tests: `tests/Unit/ExampleTest.php`
- Class names: PascalCase ending with "Test": `ProductTest`, `AuthTest`
- Methods: `test_description_in_snake_case()` (Laravel convention)

**Structure:**
```
trotinette-api/
├── tests/
│   ├── Unit/
│   │   └── ExampleTest.php
│   ├── Feature/
│   │   └── ExampleTest.php
│   └── TestCase.php          # Base test class
```

## Test Structure

**Frontend (Vitest + Testing Library):**

Expected pattern (no actual test files found, but config and dependencies set up):

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('displays email and password fields', () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()
    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    )
  })

  it('displays validation errors', async () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
  })
})
```

**Backend (PHPUnit):**

Structure observed in `tests/Feature/ExampleTest.php` and `tests/Unit/ExampleTest.php`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ProductTest extends TestCase
{
    public function test_can_list_products(): void
    {
        $response = $this->get('/api/products');
        $response->assertStatus(200);
    }

    public function test_can_create_product(): void
    {
        $response = $this->post('/api/admin/products', [
            'sku' => 'SKU-001',
            'price' => 150000,
            'stock_quantity' => 10,
            'category_id' => 1,
            'translations' => [
                'fr' => ['name' => 'Trotinette', 'slug' => 'trotinette', 'description' => 'Description'],
                'en' => ['name' => 'Scooter', 'slug' => 'scooter', 'description' => 'Description'],
            ],
        ]);

        $response->assertStatus(201);
    }

    public function test_validates_product_creation(): void
    {
        $response = $this->post('/api/admin/products', []);
        $response->assertStatus(422);
    }
}
```

**Setup in TestCase Base Class (`tests/TestCase.php`):**
- Inherits from Laravel's `Illuminate\Foundation\Testing\TestCase`
- Database: SQLite in-memory (`:memory:`) for isolated tests
- Provides HTTP testing methods: `$this->get()`, `$this->post()`, `$this->assertStatus()`

## Mocking

**Frontend:**

**Framework:** Vitest native mocking (vi object)

**Patterns:**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock function
const handleSubmit = vi.fn()
expect(handleSubmit).toHaveBeenCalledWith(expectedArgs)

// Mock module
vi.mock('../../shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))

// Mock React Query
const mockUseQuery = vi.fn().mockReturnValue({
  data: mockData,
  isLoading: false,
  error: null,
})
```

**Backend:**

**Framework:** Mockery 1.6 (from composer.json)

**Patterns:**
```php
use Mockery as m;

public function test_with_mocked_service(): void
{
    $service = m::mock(ProductService::class);
    $service->shouldReceive('createProduct')
        ->once()
        ->andReturn(new Product(['id' => 1]));

    // Inject mock into container
    $this->app->instance(ProductService::class, $service);
}
```

**What to Mock:**
- **Frontend:** API calls (use vi.mock for client), React Query hooks, zustand stores
- **Backend:** External services, repositories (when testing controllers)

**What NOT to Mock:**
- **Frontend:** React hooks internals, Material-UI components (test as integration)
- **Backend:** Eloquent models (test with in-memory database), validations, business logic

## Fixtures and Factories

**Frontend:**

**Test Data:**
- No observed fixture pattern; would be created inline or in test files
- Example (recommended): Create mock data objects for testing components

**Backend:**

**Factories:**
```php
// database/factories/ProductFactory.php
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sku' => $this->faker->unique()->numerify('SKU-####'),
            'price' => $this->faker->numberBetween(10000, 500000),
            'stock_quantity' => $this->faker->numberBetween(1, 100),
        ];
    }
}
```

**Usage in Tests:**
```php
public function test_with_products(): void
{
    Product::factory()->count(10)->create();
    $response = $this->get('/api/products');
    $response->assertJsonCount(10, 'data');
}
```

**Location:**
- Factories: `database/factories/` (standard Laravel location)
- Seeders: `database/seeders/` (for populating test data)

## Coverage

**Frontend:**

**Requirements:** None enforced

**Observed:** No coverage configuration in Vitest config; would add via CLI flag:
```bash
vitest --coverage
```

**Backend:**

**Requirements:** None enforced

**View Coverage:**
```bash
php artisan test --coverage
```

**Config:**
- PHPUnit XML includes `<source>` directive pointing to `app/` directory
- Coverage drivers: PCOV or XDebug

## Test Types

**Unit Tests:**
- **Frontend:** Test individual components, hooks, utilities in isolation
  - Example: `formatCurrency()` utility function
  - Mock external dependencies, focus on logic
  - Run fast, no DOM rendering

- **Backend:** Test individual classes/functions without external I/O
  - Example: Service methods, validators, helpers
  - Use Mockery for dependencies
  - Located in `tests/Unit/`

**Integration Tests:**
- **Frontend:** Test component behavior with React Query, form submission
  - Render component, interact with user events
  - Mock API calls but test form integration
  - Example: LoginForm submission flow

- **Backend:** Test API endpoints, database interactions, service flows
  - Located in `tests/Feature/`
  - Use in-memory database with factories
  - Example: POST /api/admin/products creates product with translations
  - HTTP client available: `$this->post()`, `$this->get()`

**E2E Tests:**
- Not configured in codebase
- Would require Playwright or Cypress for frontend
- Would require integration testing at HTTP level (already available via PHPUnit Feature tests)

## Common Patterns

**Frontend - Async Testing:**

```typescript
import { userEvent } from '@testing-library/user-event'

it('handles async submission', async () => {
  const user = userEvent.setup()
  render(<LoginForm onSubmit={handleSubmit} />)

  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.click(screen.getByRole('button', { name: /login/i }))

  // Wait for async handler
  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalled()
  })
})
```

**Frontend - Error Testing:**

```typescript
it('displays validation errors from Zod schema', async () => {
  const user = userEvent.setup()
  render(<LoginForm onSubmit={vi.fn()} />)

  // Submit empty form
  await user.click(screen.getByRole('button', { name: /login/i }))

  // Zod validates email format
  expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
  expect(screen.getByText(/minimum 8/i)).toBeInTheDocument()
})
```

**Backend - HTTP Testing:**

```php
public function test_product_validation(): void
{
    $response = $this->postJson('/api/admin/products', [
        'sku' => '',  // Required
        'price' => -100,  // Invalid
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['sku', 'price']);
}
```

**Backend - Database Assertions:**

```php
public function test_creates_product_with_translations(): void
{
    $this->post('/api/admin/products', [
        'sku' => 'SKU-001',
        'translations' => [
            'fr' => ['name' => 'Trotinette', 'slug' => 'trotinette'],
            'en' => ['name' => 'Scooter', 'slug' => 'scooter'],
        ],
    ]);

    $this->assertDatabaseHas('products', ['sku' => 'SKU-001']);
    $this->assertDatabaseHas('product_translations', ['locale' => 'fr', 'name' => 'Trotinette']);
}
```

## Infrastructure

**Frontend:**
- Vitest UI available via `@vitest/ui` 3.2.4
- Browser environment: jsdom 27.0.1 (DOM simulation)
- React testing utilities built-in

**Backend:**
- SQLite in-memory database for tests (fast, isolated)
- Faker for generating test data: `fakerphp/faker` 1.23
- Laravel Pail for real-time log streaming: `laravel/pail` 1.2.2

---

*Testing analysis: 2026-02-20*
