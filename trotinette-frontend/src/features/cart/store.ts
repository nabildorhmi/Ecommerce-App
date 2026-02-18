import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from './types';
import type { Product } from '../catalog/types';

interface CartState {
  items: CartItem[];
  // Actions
  addItem: (product: Product, localeName: string) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  // Computed
  totalItems: () => number;
  subtotalCentimes: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, localeName) => {
        // Do not add out-of-stock products
        if (product.stock_quantity <= 0) return;

        const { items } = get();
        const existing = items.find((i) => i.productId === product.id);

        if (existing) {
          // Increment quantity, capped at stockQuantity
          set({
            items: items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: Math.min(i.quantity + 1, i.stockQuantity) }
                : i
            ),
          });
        } else {
          const thumbnailUrl =
            product.images.length > 0 ? product.images[0].thumbnail : '';

          const newItem: CartItem = {
            productId: product.id,
            sku: product.sku,
            name: localeName,
            price: product.price,
            thumbnailUrl,
            quantity: 1,
            stockQuantity: product.stock_quantity,
          };

          set({ items: [...items, newItem] });
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.min(quantity, i.stockQuantity) }
                : i
            ),
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCentimes: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
