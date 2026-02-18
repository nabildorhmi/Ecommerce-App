import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { DeliveryZone } from '../types';

/**
 * Fetches the list of active delivery zones from the API.
 * Stale time: 10 minutes (zones rarely change during a session).
 */
export function useDeliveryZones() {
  return useQuery<DeliveryZone[]>({
    queryKey: ['delivery-zones'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: DeliveryZone[] }>('/delivery-zones');
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
