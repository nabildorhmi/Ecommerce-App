import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { Category } from '../types';

/**
 * Fetch active categories for the filter bar.
 * Categories rarely change so staleTime is 10 minutes.
 */
export function useCategories() {
  return useQuery<{ data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Category[] }>('/categories');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
