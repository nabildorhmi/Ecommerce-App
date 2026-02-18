import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';

export interface AdminDeliveryZone {
  id: number;
  city: string;
  city_ar: string | null;
  /** Delivery fee in centimes */
  fee: number;
  is_active: boolean;
}

// ---- Query hooks ----

/**
 * Fetches all delivery zones (including inactive) for admin management.
 */
export function useAdminDeliveryZones() {
  return useQuery<{ data: AdminDeliveryZone[] }>({
    queryKey: ['admin', 'delivery-zones'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/delivery-zones');
      return res.data;
    },
  });
}

// ---- Mutation hooks ----

interface CreateDeliveryZoneInput {
  city: string;
  city_ar?: string;
  /** Fee in centimes */
  fee: number;
  is_active: boolean;
}

export function useCreateDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDeliveryZoneInput) => {
      const res = await apiClient.post('/admin/delivery-zones', input);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-zones'] });
      void queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
    },
  });
}

interface UpdateDeliveryZoneInput {
  id: number;
  city?: string;
  city_ar?: string;
  /** Fee in centimes */
  fee?: number;
  is_active?: boolean;
}

export function useUpdateDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...rest }: UpdateDeliveryZoneInput) => {
      const res = await apiClient.put(`/admin/delivery-zones/${id}`, rest);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-zones'] });
      void queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
    },
  });
}

export function useDeleteDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/admin/delivery-zones/${id}`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-zones'] });
      void queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
    },
  });
}
