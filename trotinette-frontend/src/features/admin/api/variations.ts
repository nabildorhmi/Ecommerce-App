import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { VariationType, ProductVariant } from '../types';

// Variation Types
export function useVariationTypes() {
  return useQuery<VariationType[]>({
    queryKey: ['admin', 'variation-types'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/variation-types');
      return res.data;
    },
  });
}

export function useCreateVariationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; values?: string[] }) => {
      const res = await apiClient.post('/admin/variation-types', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'variation-types'] });
    },
  });
}

export function useUpdateVariationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; values?: string[] } }) => {
      const res = await apiClient.put(`/admin/variation-types/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'variation-types'] });
    },
  });
}

export function useDeleteVariationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/variation-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'variation-types'] });
    },
  });
}

// Product Variants
export function useProductVariants(productId: number) {
  return useQuery<ProductVariant[]>({
    queryKey: ['admin', 'products', productId, 'variants'],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/products/${productId}/variants`);
      return res.data;
    },
    enabled: productId > 0,
  });
}

export function useCreateProductVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: number;
      data: {
        sku?: string | null;
        price_override?: number | null;
        stock_quantity: number;
        is_active: boolean;
        variation_value_ids: number[];
      };
    }) => {
      const res = await apiClient.post(`/admin/products/${productId}/variants`, data);
      return res.data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId, 'variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId] });
    },
  });
}

export function useUpdateProductVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
      data,
    }: {
      productId: number;
      variantId: number;
      data: {
        sku?: string | null;
        price_override?: number | null;
        stock_quantity: number;
        is_active: boolean;
        variation_value_ids: number[];
      };
    }) => {
      const res = await apiClient.put(`/admin/products/${productId}/variants/${variantId}`, data);
      return res.data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId, 'variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId] });
    },
  });
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, variantId }: { productId: number; variantId: number }) => {
      await apiClient.delete(`/admin/products/${productId}/variants/${variantId}`);
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId, 'variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId] });
    },
  });
}
