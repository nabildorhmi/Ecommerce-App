import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { Attribute, Variant } from '../types';

// ── Attributes ────────────────────────────────────────────────────────────────

export function useAttributes() {
  return useQuery<Attribute[]>({
    queryKey: ['admin', 'attributes'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/attributes');
      return res.data.data;
    },
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; values?: string[] }) => {
      const res = await apiClient.post('/admin/attributes', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] });
    },
  });
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; values?: string[] } }) => {
      const res = await apiClient.put(`/admin/attributes/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] });
    },
  });
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/attributes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] });
    },
  });
}

// Legacy aliases (used by existing page components)
export const useVariationTypes      = useAttributes;
export const useCreateVariationType = useCreateAttribute;
export const useUpdateVariationType = useUpdateAttribute;
export const useDeleteVariationType = useDeleteAttribute;

// ── Variants ──────────────────────────────────────────────────────────────────

export function useProductVariants(productId: number) {
  return useQuery<Variant[]>({
    queryKey: ['admin', 'products', productId, 'variants'],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/products/${productId}/variants`);
      return res.data.data;
    },
    enabled: productId > 0,
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: number;
      data: {
        sku?: string | null;
        price?: number | null;
        stock: number;
        is_active: boolean;
        attribute_value_ids: number[];
      };
    }) => {
      const res = await apiClient.post(`/admin/products/${productId}/variants`, data);
      return res.data.data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId, 'variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId] });
    },
  });
}

export function useUpdateVariant() {
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
        price?: number | null;
        stock: number;
        is_active: boolean;
        attribute_value_ids: number[];
      };
    }) => {
      const res = await apiClient.put(`/admin/products/${productId}/variants/${variantId}`, data);
      return res.data.data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId, 'variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId] });
    },
  });
}

export function useDeleteVariant() {
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

// Legacy aliases
export const useCreateProductVariant = useCreateVariant;
export const useUpdateProductVariant = useUpdateVariant;
export const useDeleteProductVariant = useDeleteVariant;

// ── Generate Variants (Cartesian auto-generation) ─────────────────────────────

export interface GenerateVariantsPayload {
  attribute_values: Record<number, number[]>; // { attribute_id: [value_id, ...] }
  default_price?: number | null;              // centimes
  default_stock?: number;
  skip_existing?: boolean;
}

export interface GenerateVariantsResponse {
  message: string;
  created: number;
  data: Variant[];
}

export function useGenerateVariants() {
  const queryClient = useQueryClient();
  return useMutation<GenerateVariantsResponse, Error, { productId: number; data: GenerateVariantsPayload }>({
    mutationFn: async ({ productId, data }) => {
      const res = await apiClient.post(`/admin/products/${productId}/variants/generate`, data);
      return res.data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId, 'variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId] });
    },
  });
}
