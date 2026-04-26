import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { PageData } from './pages';

export function useAdminSiteSettingsPage() {
  return useQuery<PageData>({
    queryKey: ['admin', 'site-settings'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PageData }>('/admin/site-settings');
      return res.data.data;
    },
  });
}

export function useUpdateAdminSiteSettingsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const res = await apiClient.put<{ data: PageData }>('/admin/site-settings', { title, content });
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'site-settings'] });
      void queryClient.invalidateQueries({ queryKey: ['pages', 'site-settings'] });
      void queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}
