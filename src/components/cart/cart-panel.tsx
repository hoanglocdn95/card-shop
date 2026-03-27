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
    <aside className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-900">Your cart</h2>
      {!isReady ? (
        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Loading cart...
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Add some cards to continue checkout."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={handleRemove}
            />
          ))}
          <CartSummary subtotal={subtotal} itemCount={items.length} />
        </div>
      )}
    </aside>
  );
}
