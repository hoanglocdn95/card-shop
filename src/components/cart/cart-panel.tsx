"use client";

import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyState } from "@/components/common/empty-state";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/providers/toast-provider";

export function CartPanel() {
  const { items, subtotal, updateQuantity, removeItem, isReady } = useCart();
  const { showToast } = useToast();

  const handleRemove = (productId: string) => {
    removeItem(productId);
    showToast("Removed from cart");
  };

  return (
    <aside className="flex min-h-0 flex-1 flex-col gap-3">
      <h2 className="shrink-0 text-xl font-semibold text-gray-900">Your cart</h2>
      {!isReady ? (
        <div className="shrink-0 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Loading cart...
        </div>
      ) : items.length === 0 ? (
        <div className="shrink-0">
          <EmptyState
            title="Your cart is empty"
            message="Add some cards to continue checkout."
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
            {items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>
          <div className="shrink-0">
            <CartSummary subtotal={subtotal} itemCount={items.length} />
          </div>
        </div>
      )}
    </aside>
  );
}
