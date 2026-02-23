// Catalog domain types — matches the API response shape from ProductResource

export interface ProductImage {
  id: number;
  thumbnail: string;
  card: string;
  full: string;
  original: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductVariantDisplay {
  id: number;
  sku: string | null;
  price: number; // integer in centimes
  stock_quantity: number;
  values: { type: string; value: string }[];
}

export interface Product {
  id: number;
  sku: string;
  price: number; // integer in centimes
  stock_quantity: number;
  in_stock: boolean;
  attributes: Record<string, string | number> | null;
  is_active: boolean;
  is_featured: boolean;
  name: string;
  description: string | null;
  slug: string;
  category: Category | null;
  images: ProductImage[];
  variants?: ProductVariantDisplay[];
  created_at: string;
}

export interface PaginatedLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginatedLinks;
  meta: PaginatedMeta;
}

// Filter shape used by useCatalogFilters and passed to useProducts
export interface CatalogFilters {
  'filter[category_id]'?: string;
  'filter[min_price]'?: string;
  'filter[max_price]'?: string;
  'filter[in_stock]'?: string;
  'filter[search]'?: string;
  'filter[is_featured]'?: string;
  sort?: string;
  page?: number;
}
