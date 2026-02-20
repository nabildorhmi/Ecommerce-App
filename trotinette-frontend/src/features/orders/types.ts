/**
 * Order domain types — matches the API response shapes for orders and status transitions.
 */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  product_id: number;
  product_sku: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  product?: {
    id: number;
    name: string;
  };
}

export interface OrderStatusLog {
  id: number;
  from_status: string | null;
  to_status: string;
  from_status_label: string | null;
  to_status_label: string;
  actor_id: number | null;
  actor_type: string | null;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  phone: string;
  city: string | null;
  status: OrderStatus;
  status_label: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  note: string | null;
  delivery_zone?: {
    id: number;
    city: string;
    fee: number;
  } | null;
  items: OrderItem[];
  status_logs?: OrderStatusLog[];
  allowed_transitions: string[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PaginatedOrders {
  data: Order[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}
