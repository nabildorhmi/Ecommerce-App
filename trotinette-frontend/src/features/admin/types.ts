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
  promo_price: number | null;
  is_new: boolean;
  is_on_sale: boolean;
  category_id: number | null;       // may be absent in API response
  category?: { id: number; name: string; slug: string; is_active: boolean } | null;
  attributes: Record<string, string | number>;
  images: ProductImage[];
  default_variant?: { id: number; sku: string; price: number; promo_price: number | null; is_on_sale: boolean; stock: number } | null;
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

export interface AttributeValue {
  id: number;
  value: string;
  slug: string;
}

export interface Attribute {
  id: number;
  name: string;
  slug: string;
  values: AttributeValue[];
  created_at: string;
}

export interface VariantAttributeValue {
  id: number;
  attribute_id: number;
  attribute_name: string;
  attribute_slug: string;
  value: string;
  slug: string;
}

export interface Variant {
  id: number;
  product_id: number;
  sku: string | null;
  price: number | null;        // null = use product base_price
  promo_price: number | null;  // null = no promo
  stock: number;
  is_active: boolean;
  is_default: boolean;
  is_on_sale: boolean;
  status: 'active' | 'inactive';
  attribute_values: VariantAttributeValue[];
  effective_price: number;
  effective_promo_price: number | null;
  created_at: string;
}

// Legacy aliases (kept for backward compat during migration)
export type VariationValue = AttributeValue;
export type VariationType = Attribute;
export type ProductVariantValue = VariantAttributeValue;
export type ProductVariant = Variant;
