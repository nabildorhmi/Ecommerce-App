import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from './types';
import type { Product, ProductVariantDisplay } from '../catalog/types';
import { useAuthStore } from '@/features/auth/store';
import {
  syncCart,
  fetchCart,
  clearCartApi,
  type ServerCartItem,
} from './api/cart';

function isAuthenticated(): boolean {
  return useAuthStore.getState().token !== null;
}

function mapServerToLocal(item: ServerCartItem): CartItem {
  return {
    productId: item.product_id,
    sku: item.sku,
    name: item.name,
    price: item.price,
    thumbnailUrl: item.thumbnail_url,
    quantity: item.quantity,
    stockQuantity: item.stock_quantity,
    variantId: item.variant_id ?? undefined,
    variantSku: item.sku,
    variantLabel: item.variant_label ?? undefined,
  };
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSync(items: CartItem[]) {
  if (!isAuthenticated()) return;
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncCart(
      items.map((i) => ({
        product_id: i.productId,
        variant_id: i.variantId ?? null,
        quantity: i.quantity,
      }))
    ).catch(() => {});
  }, 500);
}

interface CartState {
  items: CartItem[];
  // Actions
  addItem: (
    product: Product,
    localeName: string,
    variant?: ProductVariantDisplay | null
  ) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    variantId?: number
  ) => void;
  removeItem: (productId: number, variantId?: number) => void;
  clearCart: () => void;
  // Server sync
  syncWithServer: () => Promise<void>;
  loadFromServer: () => Promise<void>;
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
        const existing = items.find(
          (i) =>
            i.productId === product.id &&
            (i.variantId ?? null) === (variant?.id ?? null)
        );

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id &&
              (i.variantId ?? null) === (variant?.id ?? null)
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

        debouncedSync(get().items);
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          set({
            items: get().items.filter(
              (i) =>
                !(
                  i.productId === productId &&
                  (i.variantId ?? null) === (variantId ?? null)
                )
            ),
          });
        } else {
          set({
            items: get().items.map((i) =>
              i.productId === productId &&
              (i.variantId ?? null) === (variantId ?? null)
                ? { ...i, quantity: Math.min(quantity, i.stockQuantity) }
                : i
            ),
          });
        }

        debouncedSync(get().items);
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (i) =>
              !(
                i.productId === productId &&
                (i.variantId ?? null) === (variantId ?? null)
              )
          ),
        });

        debouncedSync(get().items);
      },

      clearCart: () => {
        set({ items: [] });
        if (isAuthenticated()) {
          clearCartApi().catch(() => {});
        }
      },

      syncWithServer: async () => {
        const { items } = get();
        try {
          if (items.length === 0) {
            // No local items — load from server (e.g. new browser/device)
            const serverItems = await fetchCart();
            if (serverItems.length > 0) {
              set({ items: serverItems.map(mapServerToLocal) });
            }
          } else {
            // Has local items — merge with server cart
            const localItems = items.map((i) => ({
              product_id: i.productId,
              variant_id: i.variantId ?? null,
              quantity: i.quantity,
            }));
            const serverItems = await syncCart(localItems);
            set({ items: serverItems.map(mapServerToLocal) });
          }
        } catch (err) {
          console.error('Cart sync failed:', err);
        }
      },

      loadFromServer: async () => {
        try {
          const serverItems = await fetchCart();
          set({ items: serverItems.map(mapServerToLocal) });
        } catch {
          console.error('Cart load failed');
        }
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCentimes: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persistedState, _version) => {
        // v1 -> v2: items may be missing variantId field — that's fine, they default to undefined
        // v2 -> v3: added syncWithServer/loadFromServer methods — no persisted shape change
        return persistedState as CartState;
      },
    }
  )
);
