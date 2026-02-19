import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { CatalogFilters, PaginatedResponse, Product } from '../types';

/**
 * Fetch paginated product listing with filters.
 * queryKey includes filters so React Query refetches when filters change.
 */
export function useProducts(filters: CatalogFilters) {
  // Build clean params: omit empty string values so they don't pollute the API call
  const params: Record<string, string | number> = {};
  if (filters['filter[category_id]']) params['filter[category_id]'] = filters['filter[category_id]']!;
  if (filters['filter[min_price]']) params['filter[min_price]'] = filters['filter[min_price]']!;
  if (filters['filter[max_price]']) params['filter[max_price]'] = filters['filter[max_price]']!;
  if (filters['filter[in_stock]']) params['filter[in_stock]'] = filters['filter[in_stock]']!;
  if (filters['filter[search]']) params['filter[search]'] = filters['filter[search]']!;
  if (filters.sort) params.sort = filters.sort;
  if (filters.page && filters.page > 1) params.page = filters.page;

  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>('/products', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch single product by slug for the detail page.
 */
export function useProduct(slug: string) {
  return useQuery<Product>({
    queryKey: ['products', slug],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Product }>(`/products/${slug}`);
      return response.data.data;
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch featured products for the homepage carousel.
 * Uses the `filter[is_featured]=1` query param added in the backend.
 */
export function useFeaturedProducts() {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
        params: { 'filter[is_featured]': 1 },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
