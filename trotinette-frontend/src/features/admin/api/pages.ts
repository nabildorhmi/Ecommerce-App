import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';

export interface PageData {
  id: number;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export function useAdminPages() {
  return useQuery({
    queryKey: ['admin', 'pages'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PageData[] }>('/admin/pages');
      return res.data.data;
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, title, content }: { slug: string; title: string; content: string }) => {
      const res = await apiClient.put<{ data: PageData }>(`/admin/pages/${slug}`, { title, content });
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
      void queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}
