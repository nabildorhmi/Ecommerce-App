/**
 * CartItem — snapshot of product data at the time the item was added to cart.
 * Prices and stock are snapshotted so the cart remains consistent even if
 * the admin updates the catalog while the user is shopping.
 */
export interface CartItem {
  productId: number;
  sku: string;
  /** Localized product name at add-time */
  name: string;
  /** Price in centimes at add-time */
  price: number;
  thumbnailUrl: string;
  quantity: number;
  /** Snapshotted stock quantity — used to cap quantity in controls */
  stockQuantity: number;
  /** Variant ID if a specific variant was selected */
  variantId?: number;
  /** Variant SKU override (e.g. "TROT-PRO-RED-M") */
  variantSku?: string | null;
  /** Human-readable variant label (e.g. "Rouge / M") */
  variantLabel?: string;
}
