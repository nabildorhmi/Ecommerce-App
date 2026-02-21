// Admin-specific TypeScript types for product and category management

export interface ProductImage {
  id: number;
  thumbnail: string;
  card: string;
  full: string;
  original: string;
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
