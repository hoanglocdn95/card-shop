"use client";

import { useMemo, useState } from "react";

import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { EmptyState } from "@/components/common/empty-state";
import { useI18n } from "@/components/providers/i18n-provider";
import { useCart } from "@/hooks/use-cart";
import { useShopSettings } from "@/hooks/use-shop-settings";
import {
  CustomerTier,
  getClientCustomerTier,
  setClientCustomerTier,
} from "@/lib/customer-tier";
import { resolveShippingFeeForTier } from "@/lib/shipping";
import { useToast } from "@/components/providers/toast-provider";

const FACEBOOK_NAME_KEY = "card-shop-facebook-name";

export function CartPanel() {
  const { items, subtotal, updateQuantity, removeItem, isReady } = useCart();
  const { showToast } = useToast();
  const { t } = useI18n();
  const settingsQuery = useShopSettings();
  const [customerTier, setCustomerTier] = useState<CustomerTier>(() =>
    getClientCustomerTier(),
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const shippingFee = useMemo(
    () =>
      resolveShippingFeeForTier(
        settingsQuery.data?.shippingTiers,
        customerTier,
      ),
    [customerTier, settingsQuery.data?.shippingTiers],
  );

  const handleRemove = (
    productId: string,
    source: Parameters<typeof removeItem>[1],
  ) => {
    removeItem(productId, source);
    showToast(t("cart.removed"));
  };

  const handleTierChange = (tier: CustomerTier) => {
    setCustomerTier(tier);
    setClientCustomerTier(tier);
    showToast(t("cart.tierUpdated"));
  };

  const handleCheckout = () => {
    const facebookName = (window.localStorage.getItem(FACEBOOK_NAME_KEY) ?? "").trim();
    if (!facebookName) {
      showToast(t("checkout.facebookRequired"));
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <>
      <aside className="flex min-h-0 flex-1 flex-col gap-3">
        <h2 className="shrink-0 text-xl font-semibold text-gray-900">
          {t("cart.title")}
        </h2>
        {!isReady ? (
          <div className="shrink-0 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-500">
            {t("cart.loading")}
          </div>
        ) : items.length === 0 ? (
          <div className="shrink-0">
            <EmptyState
              title={t("cart.emptyTitle")}
              message={t("cart.emptyMessage")}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
              {items.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.source}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            <div className="shrink-0">
              <CartSummary
                subtotal={subtotal}
                itemCount={items.length}
                shippingFee={shippingFee}
                customerTier={customerTier}
                onCustomerTierChange={handleTierChange}
                onCheckout={handleCheckout}
                checkoutDisabled={items.length === 0}
              />
            </div>
          </div>
        )}
      </aside>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        shippingFee={shippingFee}
        customerTier={customerTier}
      />
    </>
  );
}
