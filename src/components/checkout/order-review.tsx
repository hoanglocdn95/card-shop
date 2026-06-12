"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/types/cart";

type Props = {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
};

export function OrderReview({ items, subtotal, shippingFee, total }: Props) {
  const { t } = useI18n();

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{t("checkout.reviewTitle")}</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between gap-3 text-sm">
            <p className="line-clamp-2 min-w-0 text-gray-700">
              {item.displayName || item.name} x {item.quantity}
            </p>
            <p className="font-medium text-gray-800">
              {formatCurrency(item.lineTotal)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-200 pt-3 text-sm">
        <div className="flex justify-between">
          <p className="text-gray-600">{t("checkout.reviewSubtotal")}</p>
          <p className="text-gray-800">{formatCurrency(subtotal)}</p>
        </div>
        <div className="mt-1 flex justify-between">
          <p className="text-gray-600">{t("checkout.reviewShipping")}</p>
          <p className="text-gray-800">{formatCurrency(shippingFee)}</p>
        </div>
        <div className="mt-1 flex justify-between font-semibold">
          <p className="text-gray-900">{t("checkout.reviewTotalBeforeDiscount")}</p>
          <p className="text-(--accent-teal)">{formatCurrency(total)}</p>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-[#f7d96b] bg-[#fff9dd] p-3 text-xs text-[#7a6622]">
        {t("checkout.reviewNote")}
      </div>
    </section>
  );
}
