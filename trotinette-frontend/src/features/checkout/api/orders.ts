import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { apiClient } from '../../../shared/api/client';
import { useCartStore } from '../../cart/store';
import type { PlaceOrderInput, OrderConfirmation } from '../types';

/**
 * Places a new customer order.
 * On success: clears cart, invalidates order queries, navigates to confirmation page.
 * Double-click prevention: button should be disabled via isPending.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: PlaceOrderInput) => {
      const res = await apiClient.post<{ data: OrderConfirmation }>('/orders', input);
      return res.data.data;
    },
    onSuccess: (data) => {
      // Clear cart (outside React render tree — use getState() pattern)
      useCartStore.getState().clearCart();
      // Invalidate order history queries
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Navigate to confirmation page, passing order data via location state
      void navigate(`/orders/${data.order_number}/confirmation`, {
        state: { order: data },
      });
    },
  });
}
