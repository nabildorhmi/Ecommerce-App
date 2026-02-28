import { useSearchParams } from 'react-router';
import type { CatalogFilters } from '../types';

/**
 * Manages catalog filter state via URL search params (Pattern 9 from RESEARCH.md).
 * All filters persist in the URL — survives page reload and is shareable.
 * Changing any filter resets page to 1.
 */
export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: CatalogFilters = {
    'filter[category_id]': searchParams.get('filter[category_id]') ?? '',
    'filter[min_price]':   searchParams.get('filter[min_price]') ?? '',
    'filter[max_price]':   searchParams.get('filter[max_price]') ?? '',
    'filter[in_stock]':    searchParams.get('filter[in_stock]') ?? '',
    'filter[search]':      searchParams.get('filter[search]') ?? '',
    'filter[is_new]':      searchParams.get('filter[is_new]') ?? '',
    'filter[is_on_sale]':  searchParams.get('filter[is_on_sale]') ?? '',
    sort:     searchParams.get('sort') ?? '-created_at',
    page:     Number(searchParams.get('page') ?? '1'),
    per_page: Number(searchParams.get('per_page') ?? '12'),
  };

  const setFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      // Reset to page 1 on any filter change (but not when changing page itself)
      if (key !== 'page') {
        next.delete('page');
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return { filters, setFilter, clearFilters };
}
