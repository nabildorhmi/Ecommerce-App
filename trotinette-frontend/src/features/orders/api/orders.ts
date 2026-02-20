import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { Order, PaginatedOrders } from '../types';

// ---- Customer hooks ----

/**
 * Fetches the authenticated customer's order history.
 */
export function useMyOrders(page: number = 1) {
  return useQuery<PaginatedOrders>({
    queryKey: ['orders', { page }],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedOrders>('/orders', {
        params: { page },
      });
      return res.data;
    },
  });
}

// ---- Admin hooks ----

export interface AdminOrderFilters {
  'filter[status]'?: string;
  'filter[delivery_zone_id]'?: number | string;
  'filter[city]'?: string;
  'filter[date_from]'?: string;
  'filter[date_to]'?: string;
  page?: number;
  sort?: string;
}

/**
 * Fetches the admin order list with optional filters and pagination.
 */
export function useAdminOrders(filters: AdminOrderFilters = {}) {
  return useQuery<PaginatedOrders>({
    queryKey: ['admin', 'orders', filters],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedOrders>('/admin/orders', {
        params: filters,
      });
      return res.data;
    },
  });
}

/**
 * Fetches a single order for admin detail view.
 */
export function useAdminOrder(orderId: number) {
  return useQuery<{ data: Order }>({
    queryKey: ['admin', 'orders', orderId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Order }>(
        `/admin/orders/${orderId}`
      );
      return res.data;
    },
    enabled: orderId > 0,
  });
}

// ---- Admin mutations ----

interface TransitionOrderInput {
  orderId: number;
  status: string;
  note?: string;
}

/**
 * Transitions an order to a new status.
 * Invalidates admin order list, admin order detail, and customer order list.
 */
export function useTransitionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, note }: TransitionOrderInput) => {
      const res = await apiClient.patch(`/admin/orders/${orderId}/status`, {
        status,
        note,
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'orders', variables.orderId],
      });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

interface AddOrderNoteInput {
  orderId: number;
  note: string;
}

/**
 * Adds a note to an order.
 * Invalidates admin order detail.
 */
export function useAddOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, note }: AddOrderNoteInput) => {
      const res = await apiClient.post(`/admin/orders/${orderId}/note`, {
        note,
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'orders', variables.orderId],
      });
    },
  });
}
