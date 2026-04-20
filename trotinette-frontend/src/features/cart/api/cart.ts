import { apiClient } from '@/shared/api/client';

export interface ServerCartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  thumbnail_url: string;
  variant_label: string | null;
}

export async function fetchCart(): Promise<ServerCartItem[]> {
  const res = await apiClient.get<ServerCartItem[]>('/cart');
  return res.data;
}

export async function syncCart(
  items: { product_id: number; variant_id: number | null; quantity: number }[]
): Promise<ServerCartItem[]> {
  const res = await apiClient.post<ServerCartItem[]>('/cart/sync', { items });
  return res.data;
}

export async function addCartItem(data: {
  product_id: number;
  variant_id?: number;
  quantity?: number;
}): Promise<ServerCartItem> {
  const res = await apiClient.post<ServerCartItem>('/cart/items', data);
  return res.data;
}

export async function updateCartItem(
  id: number,
  quantity: number
): Promise<ServerCartItem> {
  const res = await apiClient.patch<ServerCartItem>(`/cart/items/${id}`, {
    quantity,
  });
  return res.data;
}

export async function removeCartItem(id: number): Promise<void> {
  await apiClient.delete(`/cart/items/${id}`);
}

export async function clearCartApi(): Promise<void> {
  await apiClient.delete('/cart');
}
