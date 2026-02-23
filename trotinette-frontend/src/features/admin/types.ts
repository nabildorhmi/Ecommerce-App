// Admin-specific TypeScript types for product and category management

export interface ProductImage {
  id: number;
  thumbnail: string;
  card: string;
  full: string;
  original: string;
}

export interface AdminProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // in centimes
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: number | null;       // may be absent in API response
  category?: { id: number; name: string; slug: string; is_active: boolean } | null;
  attributes: Record<string, string | number>;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in MAD — converted to centimes on submit
  stock_quantity: number;
  category_id: number | null;
  is_active: boolean;
  is_featured: boolean;
  attributes: Record<string, string>;
  images: File[];
  delete_images: number[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  is_active: boolean;
}

// API response shapes
export interface PaginatedProducts {
  data: AdminProduct[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'customer' | 'global_admin';
  is_active: boolean;
  address_city: string | null;
  address_street: string | null;
  order_history: unknown[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedUsers {
  data: AdminUser[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface DashboardKpis {
  total_orders: number;
  orders_by_status: { status: string; label: string; count: number }[];
  total_revenue: number;
  average_order_value: number;
  best_selling_products: { product_id: number; product_name: string; total_quantity: number }[];
  best_selling_categories: { category_id: number; category_name: string; total_revenue: number }[];
  new_customers: number;
}

export interface MonthlyStats {
  month: string;
  revenue: number;
  order_count: number;
}

export interface YearlyStats {
  year: number;
  revenue: number;
  order_count: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  monthly_stats: MonthlyStats[];
  yearly_stats: YearlyStats[];
}

export interface DashboardFilters {
  date_from?: string;
  date_to?: string;
  month?: number;
  year?: number;
  status?: string;
}

export interface VariationValue {
  id: number;
  value: string;
}

export interface VariationType {
  id: number;
  name: string;
  values: VariationValue[];
  created_at: string;
}

export interface ProductVariantValue {
  id: number;
  variation_type_id: number;
  variation_type_name: string;
  value: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string | null;
  price_override: number | null;
  stock_quantity: number;
  is_active: boolean;
  values: ProductVariantValue[];
  effective_price: number;
  created_at: string;
}
