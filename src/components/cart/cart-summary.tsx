"use client";

import { useMemo } from "react";

import { Button } from "@/components/common/button";
import { useI18n } from "@/components/providers/i18n-provider";
import { CustomerTier } from "@/lib/customer-tier";
import { formatCurrency } from "@/lib/utils";

type Props = {
  subtotal: number;
  itemCount: number;
  shippingFee: number;
  customerTier: CustomerTier;
  onCustomerTierChange: (tier: CustomerTier) => void;
  onCheckout: () => void;
  checkoutDisabled?: boolean;
};

export function CartSummary({
  subtotal,
  itemCount,
  shippingFee,
  customerTier,
  onCustomerTierChange,
  onCheckout,
  checkoutDisabled = false,
}: Props) {
  const { t } = useI18n();
  const total = useMemo(() => subtotal + shippingFee, [shippingFee, subtotal]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{t("cart.summary")}</h3>
      <div className="mt-2 space-y-1 text-sm text-gray-600">
        <p>{t("cart.itemTypes", { count: itemCount })}</p>
        <p className="flex items-center justify-between">
          <span>{t("cart.subtotal")}:</span>
          <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
        </p>
        <div className="flex items-center justify-between gap-2">
          <label className="shrink-0" htmlFor="customer-tier">
            {t("cart.customerTier")}:
          </label>
          <select
            id="customer-tier"
            value={customerTier}
            onChange={(event) =>
              onCustomerTierChange(event.target.value as CustomerTier)
            }
            className="h-8 min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-2 text-xs outline-none focus:border-(--accent-teal) sm:text-sm"
          >
            <option value="guest">{t("cart.tierGuest")}</option>
            <option value="friend">{t("cart.tierFriend")}</option>
            <option value="vip">{t("cart.tierVip")}</option>
          </select>
        </div>
        <p className="flex items-center justify-between">
          <span>{t("cart.shippingEstimate")}:</span>
          <span className="font-semibold text-gray-800">{formatCurrency(shippingFee)}</span>
        </p>
        <p className="flex items-center justify-between text-base">
          <span className="font-semibold text-gray-900">{t("cart.total")}:</span>
          <span className="font-bold text-(--accent-teal)">{formatCurrency(total)}</span>
        </p>
      </div>

      <Button
        type="button"
        className="mt-3 w-full bg-(--primary) hover:bg-(--primary-hover)"
        onClick={onCheckout}
        disabled={checkoutDisabled}
      >
        {t("cart.checkout")}
      </Button>
    </div>
  );
}
