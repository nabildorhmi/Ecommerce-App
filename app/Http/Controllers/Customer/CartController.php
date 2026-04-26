<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * GET /cart — List authenticated user's cart items.
     */
    public function index(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cart->load(['items.product', 'items.variant.product', 'items.variant.attributeValues']);

        // Filter out stale items (deleted/inactive products)
        $items = $cart->items->filter(function (CartItem $item) {
            return $item->product && $item->product->is_active;
        });

        return response()->json($items->values()->map(fn (CartItem $item) => $this->formatItem($item)));
    }

    /**
     * POST /cart/sync — Replace server cart with provided items.
     * Used for syncing local cart state (on login) and for debounced sync when authenticated.
     */
    public function sync(Request $request): JsonResponse
    {
        $request->validate([
            'items'              => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:variants,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        DB::transaction(function () use ($cart, $request) {
            // Replace mode: delete all existing items, then insert fresh from request
            $cart->items()->delete();

            foreach ($request->input('items') as $incoming) {
                $product = \App\Models\Product::find($incoming['product_id']);
                if (!$product || !$product->is_active) continue;

                $variantId = $incoming['variant_id'] ?? null;
                if ($variantId) {
                    $variant = \App\Models\Variant::where('id', $variantId)
                        ->where('product_id', $product->id)
                        ->where('is_active', true)
                        ->first();
                    if (!$variant) continue;
                    $maxStock = $variant->stock;
                } else {
                    $variant = null;
                    $maxStock = $product->stock_quantity;
                }

                $cart->items()->create([
                    'product_id' => $incoming['product_id'],
                    'variant_id' => $variantId,
                    'quantity'   => min($incoming['quantity'], $maxStock),
                ]);
            }
        });

        $cart->load(['items.product', 'items.variant.product', 'items.variant.attributeValues']);

        $items = $cart->items->filter(function (CartItem $item) {
            return $item->product && $item->product->is_active;
        });

        return response()->json($items->values()->map(fn (CartItem $item) => $this->formatItem($item)));
    }

    /**
     * POST /cart/items — Add an item to the cart.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:variants,id',
            'quantity'   => 'integer|min:1',
        ]);

        $product = \App\Models\Product::findOrFail($request->input('product_id'));
        abort_unless($product->is_active, 422, 'Product is not available.');

        $variantId = $request->input('variant_id');
        if ($variantId) {
            $variant = \App\Models\Variant::where('id', $variantId)
                ->where('product_id', $product->id)
                ->where('is_active', true)
                ->firstOrFail();
            $maxStock = $variant->stock;
        } else {
            $maxStock = $product->stock_quantity;
        }

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $quantity = $request->input('quantity', 1);

        $existing = $cart->items()
            ->where('product_id', $product->id)
            ->where('variant_id', $variantId)
            ->first();

        if ($existing) {
            $newQty = min($existing->quantity + $quantity, $maxStock);
            $existing->update(['quantity' => max($newQty, 1)]);
            $item = $existing->fresh(['product', 'variant.product', 'variant.attributeValues']);
        } else {
            $item = $cart->items()->create([
                'product_id' => $product->id,
                'variant_id' => $variantId,
                'quantity'   => min($quantity, $maxStock),
            ]);
            $item->load(['product', 'variant.product', 'variant.attributeValues']);
        }

        return response()->json($this->formatItem($item), 201);
    }

    /**
     * PATCH /cart/items/{cartItem} — Update item quantity.
     */
    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        abort_unless($cartItem->cart->user_id === $request->user()->id, 403);

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $maxStock = $cartItem->variant
            ? $cartItem->variant->stock
            : $cartItem->product->stock_quantity;

        $cartItem->update([
            'quantity' => min($request->input('quantity'), $maxStock),
        ]);

        $cartItem->load(['product', 'variant.product', 'variant.attributeValues']);

        return response()->json($this->formatItem($cartItem));
    }

    /**
     * DELETE /cart/items/{cartItem} — Remove a single item.
     */
    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        abort_unless($cartItem->cart->user_id === $request->user()->id, 403);

        $cartItem->delete();

        return response()->json(null, 204);
    }

    /**
     * DELETE /cart — Clear all cart items.
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json(null, 204);
    }

    /**
     * Format a CartItem for JSON response.
     */
    private function formatItem(CartItem $item): array
    {
        $product = $item->product;
        $variant = $item->variant;

        // Determine effective price (promo if on sale)
        if ($variant) {
            $price = $variant->is_on_sale ? $variant->effective_promo_price : $variant->effective_price;
            $stock = $variant->stock;
            $sku = $variant->sku ?? $product->sku;
            $variantLabel = $variant->relationLoaded('attributeValues')
                ? $variant->attributeValues->pluck('value')->join(' / ')
                : null;
        } else {
            $price = ($product->promo_price && $product->promo_price < $product->price)
                ? $product->promo_price
                : $product->price;
            $stock = $product->stock_quantity;
            $sku = $product->sku;
            $variantLabel = null;
        }

        return [
            'id'             => $item->id,
            'product_id'     => $product->id,
            'variant_id'     => $variant?->id,
            'quantity'        => $item->quantity,
            'name'           => $product->name,
            'sku'            => $sku,
            'price'          => $price,
            'stock_quantity' => $stock,
            'thumbnail_url'  => $product->getFirstMediaUrl('images', 'thumbnail'),
            'variant_label'  => $variantLabel ?: null,
        ];
    }
}
