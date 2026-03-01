import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from './types';
import type { Product, ProductVariantDisplay } from '../catalog/types';

interface CartState {
  items: CartItem[];
  // Actions
  addItem: (product: Product, localeName: string, variant?: ProductVariantDisplay | null) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  removeItem: (productId: number, variantId?: number) => void;
  clearCart: () => void;
  // Computed
  totalItems: () => number;
  subtotalCentimes: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, localeName, variant) => {
        // For variants: check variant stock; for base product: check product stock
        const availableStock = variant ? variant.stock : product.stock_quantity;
        if (availableStock <= 0) return;

        const { items } = get();
        // Unique key: productId + variantId (so same product different variant = different cart row)
        const existing = items.find((i) =>
          i.productId === product.id && (i.variantId ?? null) === (variant?.id ?? null)
        );

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id && (i.variantId ?? null) === (variant?.id ?? null)
                ? { ...i, quantity: Math.min(i.quantity + 1, i.stockQuantity) }
                : i
            ),
          });
        } else {
          const thumbnailUrl =
            product.images.length > 0 ? product.images[0].thumbnail : '';

          // Build variant label from attribute_values: e.g. "Rouge / M"
          const variantLabel = variant?.attribute_values
            ?.map((av) => av.value)
            .join(' / ');

          const newItem: CartItem = {
            productId: product.id,
            sku: variant?.sku ?? product.sku,
            name: localeName,
            price: variant?.price ?? product.price,
            thumbnailUrl,
            quantity: 1,
            stockQuantity: availableStock,
            variantId: variant?.id,
            variantSku: variant?.sku ?? null,
            variantLabel: variantLabel || undefined,
          };

          set({ items: [...items, newItem] });
        }
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => !(i.productId === productId && (i.variantId ?? null) === (variantId ?? null))) });
        } else {
          set({
            items: get().items.map((i) =>
              i.productId === productId && (i.variantId ?? null) === (variantId ?? null)
                ? { ...i, quantity: Math.min(quantity, i.stockQuantity) }
                : i
            ),
          });
        }
      },

      removeItem: (productId, variantId) => {
        set({ items: get().items.filter((i) => !(i.productId === productId && (i.variantId ?? null) === (variantId ?? null))) });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCentimes: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState, _version) => {
        // v1 → v2: items may be missing variantId field — that's fine, they default to undefined
        return persistedState as CartState;
      },
    }
  )
);
