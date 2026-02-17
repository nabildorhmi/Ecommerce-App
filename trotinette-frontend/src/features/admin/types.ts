// Admin-specific TypeScript types for product and category management

export interface ProductImage {
  id: number;
  url: string;
  thumbnail_url: string;
  card_url: string;
  full_url: string;
  name: string;
  size: number;
  mime_type: string;
  order_column: number;
}

export interface ProductTranslation {
  locale: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface AdminProduct {
  id: number;
  sku: string;
  price: number; // in centimes
  stock_quantity: number;
  is_active: boolean;
  category_id: number | null;
  attributes: Record<string, string | number>;
  translations: {
    fr: ProductTranslation;
    en: ProductTranslation;
  };
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface AdminCategory {
  id: number;
  slug: string;
  is_active: boolean;
  product_count?: number;
  translations: {
    fr: { name: string };
    en: { name: string };
  };
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  sku: string;
  price: number; // in MAD — converted to centimes on submit
  stock_quantity: number;
  category_id: number | null;
  is_active: boolean;
  translations: {
    fr: { name: string; slug: string; description: string };
    en: { name: string; slug: string; description: string };
  };
  attributes: {
    speed: string;
    battery: string;
    range_km: string;
    weight: string;
    motor_power: string;
  };
  images: File[];
  delete_images: number[];
}

export interface CategoryFormData {
  slug: string;
  is_active: boolean;
  translations: {
    fr: { name: string };
    en: { name: string };
  };
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
  role: 'admin' | 'customer';
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
