import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

/* ── Types ────────────────────────────────────────────── */
export interface HeroBannerImageVariant {
  id: number;
  url: string;
  thumbnail: string;
  hero: string;
}

export interface HeroBannerImage {
  desktop: HeroBannerImageVariant | null;
  mobile: HeroBannerImageVariant | null;
}

export interface HeroBanner {
  id: number;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  sort_order: number;
  is_active: boolean;
  object_position: string;
  image: HeroBannerImage | null;
  has_desktop: boolean;
  has_mobile: boolean;
  created_at: string;
  updated_at: string;
}

/* ── Public (homepage) ───────────────────────────────── */
export function useHeroBanners() {
  return useQuery<{ data: HeroBanner[] }>({
    queryKey: ['hero-banners'],
    queryFn: async () => {
      const res = await apiClient.get('/hero-banners');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ── Admin ───────────────────────────────────────────── */
export function useAdminHeroBanners() {
  return useQuery<{ data: HeroBanner[] }>({
    queryKey: ['admin', 'hero-banners'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/hero-banners');
      return res.data;
    },
  });
}

export function useCreateHeroBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Do NOT set Content-Type manually — axios must set it with the correct boundary for FormData
      const res = await apiClient.post('/admin/hero-banners', formData);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'hero-banners'] });
      qc.invalidateQueries({ queryKey: ['hero-banners'] });
    },
  });
}

export function useUpdateHeroBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      // Do NOT set Content-Type manually — axios must set it with the correct boundary for FormData
      const res = await apiClient.post(`/admin/hero-banners/${id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'hero-banners'] });
      qc.invalidateQueries({ queryKey: ['hero-banners'] });
    },
  });
}

export function useDeleteHeroBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/hero-banners/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'hero-banners'] });
      qc.invalidateQueries({ queryKey: ['hero-banners'] });
    },
  });
}
