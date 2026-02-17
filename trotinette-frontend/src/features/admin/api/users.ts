import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { AdminUser, PaginatedUsers } from '../types';

// ---- Query hooks ----

export function useAdminUsers(page?: number) {
  return useQuery<PaginatedUsers>({
    queryKey: ['admin', 'users', page],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users', {
        params: page ? { page } : undefined,
      });
      return res.data;
    },
  });
}

export function useAdminUser(id: number) {
  return useQuery<{ data: AdminUser }>({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/users/${id}`);
      return res.data;
    },
    enabled: id > 0,
  });
}

// ---- Mutation hooks ----

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.patch(`/admin/users/${id}/deactivate`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
