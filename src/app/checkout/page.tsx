"use client";

import Link from "next/link";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderReview } from "@/components/checkout/order-review";
import { EmptyState } from "@/components/common/empty-state";
import { useCart } from "@/hooks/use-cart";

export default function CheckoutPage() {
  const { items, subtotal, isReady } = useCart();
  const shipFee = 35000;
  const total = subtotal + shipFee;

  if (!isReady) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Loading checkout...
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <EmptyState
          title="Cart is empty"
          message="Add products before going to checkout."
        />
        <Link href="/" className="mt-3 inline-block text-sm text-(--primary)">
          Back to product list
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-4 px-4 py-8 lg:grid-cols-2">
      <CheckoutForm />
      <div className="self-start lg:sticky lg:top-6">
        <OrderReview items={items} subtotal={subtotal} total={total} />
      </div>
    </main>
  );
}
