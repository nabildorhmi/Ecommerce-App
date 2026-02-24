import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { AdminProduct, PaginatedProducts } from '../types';

// ---- Query hooks ----

export function useAdminProducts(params?: Record<string, unknown>) {
  return useQuery<PaginatedProducts>({
    queryKey: ['admin', 'products', params],
    queryFn: async () => {
      const res = await apiClient.get('/admin/products', { params });
      return res.data;
    },
  });
}

export function useAdminProduct(id: number) {
  return useQuery<{ data: AdminProduct }>({
    queryKey: ['admin', 'products', id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/products/${id}`);
      return res.data;
    },
    enabled: id > 0,
  });
}

// ---- Helpers ----

/**
 * Build a FormData object from the structured product form data.
 * CRITICAL: Do not set Content-Type — let the browser add the multipart boundary.
 */
function buildProductFormData(data: {
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number; // centimes (already converted)
  category_id?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
  attributes?: Record<string, string | number>;
  images?: File[];
  delete_images?: number[];
}): FormData {
  const fd = new FormData();

  if (data.sku !== undefined) fd.append('sku', data.sku);
  if (data.name !== undefined) fd.append('name', data.name);
  if (data.slug !== undefined) fd.append('slug', data.slug);
  if (data.description !== undefined) fd.append('description', data.description);
  if (data.price !== undefined) fd.append('price', String(data.price));
  if (data.category_id !== undefined && data.category_id !== null)
    fd.append('category_id', String(data.category_id));
  if (data.is_active !== undefined)
    fd.append('is_active', data.is_active ? '1' : '0');
  if (data.is_featured !== undefined)
    fd.append('is_featured', data.is_featured ? '1' : '0');

  // Attributes as JSON string (backend decodes in PrepareForValidation)
  if (data.attributes) {
    fd.append('attributes', JSON.stringify(data.attributes));
  }

  // Images as array
  if (data.images) {
    for (const file of data.images) {
      fd.append('images[]', file);
    }
  }

  // Images to delete
  if (data.delete_images) {
    for (const id of data.delete_images) {
      fd.append('delete_images[]', String(id));
    }
  }

  return fd;
}

// ---- Mutation hooks ----

interface CreateProductInput {
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in MAD — we convert to centimes here
  category_id: number | null;
  is_active: boolean;
  is_featured: boolean;
  attributes: Record<string, string | number>;
  images: File[];
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const fd = buildProductFormData({
        ...input,
        price: Math.round(input.price * 100), // MAD -> centimes
        delete_images: [],
      });
      const res = await apiClient.post('/admin/products', fd, {
        headers: { 'Content-Type': undefined }, // let browser set multipart boundary
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

interface UpdateProductInput {
  id: number;
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number; // in MAD — converted to centimes
  category_id?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
  attributes?: Record<string, string | number>;
  images?: File[];
  delete_images?: number[];
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, price, ...rest }: UpdateProductInput) => {
      const fd = buildProductFormData({
        ...rest,
        price: price !== undefined ? Math.round(price * 100) : undefined,
      });
      // Laravel doesn't support PUT/PATCH with multipart — use POST + _method
      fd.append('_method', 'PATCH');
      const res = await apiClient.post(`/admin/products/${id}`, fd, {
        headers: { 'Content-Type': undefined },
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'products', variables.id],
      });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/admin/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      mediaId,
    }: {
      productId: number;
      mediaId: number;
    }) => {
      const res = await apiClient.delete(
        `/admin/products/${productId}/media/${mediaId}`
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'products', variables.productId],
      });
    },
  });
}
