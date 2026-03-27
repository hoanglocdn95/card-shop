"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/common/button";
import { ErrorState } from "@/components/common/error-state";
import { Input } from "@/components/common/input";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-checkout";
import { calculateTotal } from "@/lib/order";
import { formatCurrency } from "@/lib/utils";
import { orderSchema } from "@/schemas/order.schema";

const customerSchema = orderSchema.omit({ items: true });
type CustomerFormInput = z.infer<typeof customerSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const checkout = useCheckout();
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "saved"
  >("idle");

  const form = useForm<CustomerFormInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      address: "",
      note: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitStatus("submitting");
      const payload = orderSchema.parse({
        ...values,
        items,
      });

      const response = await checkout.mutateAsync(payload);
      setSubmitStatus("saved");
      clearCart();
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      router.push(
        `/success?orderCode=${encodeURIComponent(response.orderCode)}&total=${response.total}&customerName=${encodeURIComponent(response.customerName)}&createdAt=${encodeURIComponent(response.createdAt)}`,
      );
    } catch {
      setSubmitStatus("idle");
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">Customer info</h2>
      <div className="mt-3 grid gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">Customer name</label>
          <Input {...form.register("customerName")} disabled={checkout.isPending} />
          <p className="mt-1 text-xs text-red-600">
            {form.formState.errors.customerName?.message}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Phone</label>
          <Input {...form.register("phone")} disabled={checkout.isPending} />
          <p className="mt-1 text-xs text-red-600">
            {form.formState.errors.phone?.message}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Address</label>
          <Input {...form.register("address")} disabled={checkout.isPending} />
          <p className="mt-1 text-xs text-red-600">
            {form.formState.errors.address?.message}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Note</label>
          <Input {...form.register("note")} disabled={checkout.isPending} />
        </div>
      </div>

      {checkout.error ? (
        <div className="mt-3">
          <ErrorState message={checkout.error.message} />
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Total:{" "}
          <span className="font-semibold text-gray-900">
            {formatCurrency(calculateTotal(items))}
          </span>
        </p>
        <Button type="submit" disabled={checkout.isPending || items.length === 0}>
          {checkout.isPending ? "Creating order..." : "Place order"}
        </Button>
      </div>
      {submitStatus === "saved" ? (
        <p className="mt-2 text-xs font-medium text-green-700">
          Order saved successfully, redirecting...
        </p>
      ) : null}
      {submitStatus === "submitting" ? (
        <p className="mt-2 text-xs font-medium text-indigo-700">Creating order...</p>
      ) : null}
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-red-600">Cart must not be empty.</p>
      ) : null}
      <p className="mt-1 text-xs text-gray-500">
        Subtotal: {formatCurrency(subtotal)}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Estimated confirmation time: under 2 minutes.
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Need help? Contact support at support@cardshop.demo
      </p>
    </form>
  );
}
