"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/common/button";
import { ErrorState } from "@/components/common/error-state";
import { Input } from "@/components/common/input";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-checkout";
import { parseDiscountCode } from "@/lib/discount";
import { roundUpToNearestThousandPublic } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { orderSchema } from "@/schemas/order.schema";

const FACEBOOK_NAME_KEY = "card-shop-facebook-name";
const SHIP_FEE_VND = 35000;

const confirmSchema = z.object({
  note: z.string().optional(),
  discountCode: z.string().optional(),
});

type ConfirmInput = z.infer<typeof confirmSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const checkout = useCheckout();
  const [facebookName, setFacebookName] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving">(
    "idle",
  );

  const form = useForm<ConfirmInput>({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      note: "",
      discountCode: "",
    },
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(FACEBOOK_NAME_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFacebookName(raw ?? "");
  }, []);

  const watchedDiscountCode = useWatch({
    control: form.control,
    name: "discountCode",
  });
  const discount = parseDiscountCode(watchedDiscountCode ?? undefined);

  const preview = (() => {
    const beforeDiscountSubtotal = subtotal;
    if (discount.type === "none") {
      return {
        total: roundUpToNearestThousandPublic(
          beforeDiscountSubtotal + SHIP_FEE_VND,
        ),
      };
    }
    if (discount.type === "percent") {
      const discountedSubtotal =
        beforeDiscountSubtotal * (1 - discount.value / 100);
      return {
        total: roundUpToNearestThousandPublic(
          discountedSubtotal + SHIP_FEE_VND,
        ),
      };
    }
    // fixed VND amount subtract from total bill
    const discounted =
      beforeDiscountSubtotal + SHIP_FEE_VND - discount.value;
    return {
      total: roundUpToNearestThousandPublic(Math.max(0, discounted)),
    };
  })();

  const onSubmit = form.handleSubmit(async (values) => {
    if (!facebookName.trim()) return;
    try {
      setSubmitStatus("saving");
      const payload = orderSchema.parse({
        facebookName: facebookName.trim(),
        note: values.note?.trim() ? values.note.trim() : undefined,
        discountCode: values.discountCode?.trim()
          ? values.discountCode.trim()
          : undefined,
        items: items.map((item) => ({
          productName: item.name,
          price: item.price,
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
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
      <p className="mt-1 text-sm text-gray-600">
        Please confirm once more and add your note.
      </p>

      <div className="mt-4 grid gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">Facebook name</label>
          <Input value={facebookName} disabled />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Discount code</label>
          <Input {...form.register("discountCode")} disabled={checkout.isPending} placeholder="Optional" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Note</label>
          <Input {...form.register("note")} disabled={checkout.isPending} placeholder="Optional" />
        </div>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{formatCurrency(SHIP_FEE_VND)}</span>
        </div>
        <div className="mt-2 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span className="text-(--accent-teal)">{formatCurrency(preview.total)}</span>
        </div>
      </div>

      {checkout.error ? (
        <div className="mt-3">
          <ErrorState message={checkout.error.message} />
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-3 text-xs text-[#8a2d49]">Cart must not be empty.</p>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          type="submit"
          disabled={checkout.isPending || items.length === 0 || !facebookName.trim() || submitStatus === "saving"}
        >
          {checkout.isPending || submitStatus === "saving"
            ? "Confirming..."
            : "Confirm"}
        </Button>
      </div>
    </form>
  );
}
