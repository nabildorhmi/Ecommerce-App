/**
 * Checkout domain types — matches the API response shapes for delivery zones and orders.
 */

export interface DeliveryZone {
  id: number;
  city: string;
  /** Delivery fee in centimes */
  fee: number;
}

export interface PlaceOrderInput {
  phone: string;
  city: string;
  items: Array<{ product_id: number; quantity: number }>;
  note?: string;
}

export interface OrderConfirmationItem {
  product_id: number;
  product_sku: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderConfirmation {
  id: number;
  order_number: string;
  phone: string;
  city: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
  delivery_zone?: {
    id: number;
    city: string;
    fee: number;
  } | null;
  items: OrderConfirmationItem[];
}
