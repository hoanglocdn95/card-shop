"use client";

import Link from "next/link";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderReview } from "@/components/checkout/order-review";
import { EmptyState } from "@/components/common/empty-state";
import { useCart } from "@/hooks/use-cart";
import { calculateTotal } from "@/lib/order";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const total = calculateTotal(items);

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <EmptyState
          title="Cart is empty"
          message="Add products before going to checkout."
        />
        <Link href="/" className="mt-3 inline-block text-sm text-blue-600">
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
