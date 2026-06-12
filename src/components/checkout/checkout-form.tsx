"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/common/button";
import { ErrorState } from "@/components/common/error-state";
import { Input } from "@/components/common/input";
import { useI18n } from "@/components/providers/i18n-provider";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-checkout";
import { CustomerTier } from "@/lib/customer-tier";
import { computeDiscountedTotal, parseDiscountCode } from "@/lib/discount";
import { formatCurrency } from "@/lib/utils";
import { orderSchema } from "@/schemas/order.schema";

const FACEBOOK_NAME_KEY = "card-shop-facebook-name";

const confirmSchema = z.object({
  note: z.string().optional(),
  discountCode: z.string().optional(),
});

type ConfirmInput = z.infer<typeof confirmSchema>;

type Props = {
  shippingFee: number;
  customerTier: CustomerTier;
};

export function CheckoutForm({ shippingFee, customerTier }: Props) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const checkout = useCheckout();
  const { t } = useI18n();
  const [facebookName, setFacebookName] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving">("idle");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const form = useForm<ConfirmInput>({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      note: "",
      discountCode: "",
    },
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(FACEBOOK_NAME_KEY);
    setFacebookName(raw ?? "");
  }, []);

  const watchedDiscountCode = useWatch({
    control: form.control,
    name: "discountCode",
  });
  const discount = parseDiscountCode(watchedDiscountCode ?? undefined);
  const preview = computeDiscountedTotal({
    subtotal,
    shippingFee,
    discountCode: watchedDiscountCode ?? undefined,
  });

  const submitOrder = form.handleSubmit(async (values) => {
    if (!facebookName.trim()) return;
    try {
      setSubmitStatus("saving");
      const payload = orderSchema.parse({
        facebookName: facebookName.trim(),
        customerTier,
        note: values.note?.trim() ? values.note.trim() : undefined,
        discountCode: values.discountCode?.trim()
          ? values.discountCode.trim()
          : undefined,
        items: items.map((item) => ({
          productId: item.productId,
          cardCode: item.cardCode,
          game: item.game,
          quantity: item.quantity,
          rarity: item.rarity,
        })),
      });

      const response = await checkout.mutateAsync(payload);
      clearCart();
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      router.push(
        `/success?orderCode=${encodeURIComponent(response.orderCode)}&total=${response.total}&facebookName=${encodeURIComponent(response.facebookName)}&createdAt=${encodeURIComponent(response.createdAt)}`,
      );
    } catch {
      setSubmitStatus("idle");
    } finally {
      setShowConfirmModal(false);
    }
  });

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{t("checkout.title")}</h2>
      <p className="mt-1 text-sm text-gray-600">{t("checkout.subtitle")}</p>

      <div className="mt-4 grid gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">
            {t("checkout.facebookName")}
          </label>
          <Input value={facebookName} disabled />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">
            {t("checkout.discountCode")}
          </label>
          <Input
            {...form.register("discountCode")}
            disabled={checkout.isPending}
            placeholder={t("checkout.discountPlaceholder")}
          />
          <p className="mt-1 text-xs text-gray-500">{t("checkout.discountHint")}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>{t("cart.subtotal")}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-gray-600">
          <span>{t("checkout.shippingFee")}</span>
          <span>{formatCurrency(shippingFee)}</span>
        </div>
        {discount.type !== "none" ? (
          <div className="mt-1 flex justify-between text-gray-600">
            <span>{t("checkout.appliedCode")}</span>
            <span>{discount.code}</span>
          </div>
        ) : null}
        <div className="mt-2 flex justify-between font-semibold text-gray-900">
          <span>{t("checkout.totalAfterDiscount")}</span>
          <span className="text-(--accent-teal)">{formatCurrency(preview.total)}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">{t("checkout.totalNote")}</p>
      </div>

      {checkout.error ? (
        <div className="mt-3">
          <ErrorState message={checkout.error.message} />
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-3 text-xs text-[#8a2d49]">{t("checkout.cartEmptyWarning")}</p>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          type="button"
          disabled={
            checkout.isPending ||
            items.length === 0 ||
            !facebookName.trim() ||
            submitStatus === "saving"
          }
          onClick={() => setShowConfirmModal(true)}
        >
          {t("checkout.submitList")}
        </Button>
      </div>

      {showConfirmModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900">
              {t("checkout.confirmTitle")}
            </h3>
            <p className="mt-1 text-sm text-gray-600">{t("checkout.confirmMessage")}</p>
            <div className="mt-3">
              <label className="mb-1 block text-sm font-semibold">
                {t("checkout.note")}
              </label>
              <Input
                {...form.register("note")}
                disabled={checkout.isPending || submitStatus === "saving"}
                placeholder={t("checkout.notePlaceholder")}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                className="bg-gray-600 hover:bg-gray-700"
                onClick={() => setShowConfirmModal(false)}
                disabled={checkout.isPending || submitStatus === "saving"}
              >
                {t("checkout.cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => void submitOrder()}
                disabled={checkout.isPending || submitStatus === "saving"}
              >
                {checkout.isPending || submitStatus === "saving"
                  ? t("checkout.submitting")
                  : t("checkout.confirm")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
