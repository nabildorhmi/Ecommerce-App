import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';

export interface PageData {
  id: number;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

async function fetchPage(slug: string): Promise<PageData> {
  const res = await apiClient.get<{ data: PageData }>(`/pages/${slug}`);
  return res.data.data;
}

export function usePageBySlug(slug: string) {
  return useQuery({
    queryKey: ['pages', slug],
    queryFn: () => fetchPage(slug),
  });
}
