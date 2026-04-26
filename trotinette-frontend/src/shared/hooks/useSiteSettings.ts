import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { defaultSiteSettings, parseSiteSettingsContent, type SiteSettings } from '@/shared/types/siteSettings';

interface PagePayload {
  data: {
    slug: string;
    title: string;
    content: string;
  };
}

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<PagePayload>('/pages/site-settings');
        return parseSiteSettingsContent(res.data.data.content);
      } catch {
        return defaultSiteSettings;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
