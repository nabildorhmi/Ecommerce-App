import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { DashboardData, DashboardFilters } from '../types';

export function useAdminDashboard(filters: DashboardFilters = {}) {
  return useQuery<DashboardData>({
    queryKey: ['admin', 'dashboard', filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.status) params.status = filters.status;
      const res = await apiClient.get('/admin/dashboard', { params });
      return res.data;
    },
  });
}
