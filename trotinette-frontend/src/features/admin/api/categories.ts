import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { AdminCategory } from '../types';

// ---- Query hooks ----

export function useAdminCategories() {
  return useQuery<{ data: AdminCategory[] }>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/categories');
      return res.data;
    },
  });
}

// ---- Mutation hooks ----

interface CreateCategoryInput {
  slug: string;
  is_active: boolean;
  translations: {
    fr: { name: string };
    en: { name: string };
  };
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const res = await apiClient.post('/admin/categories', input);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

interface UpdateCategoryInput {
  id: number;
  slug?: string;
  is_active?: boolean;
  translations?: {
    fr?: { name?: string };
    en?: { name?: string };
  };
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...rest }: UpdateCategoryInput) => {
      const res = await apiClient.patch(`/admin/categories/${id}`, rest);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/admin/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
