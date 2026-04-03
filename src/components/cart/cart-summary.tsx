import Link from "next/link";

import { Button } from "@/components/common/button";
import { formatCurrency } from "@/lib/utils";

type Props = {
  subtotal: number;
  itemCount: number;
};

export function CartSummary({ subtotal, itemCount }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">Summary</h3>
      <div className="mt-2 space-y-1 text-sm text-gray-600">
        <p>Items: {itemCount}</p>
        <p className="font-semibold text-gray-800">
          Subtotal: {formatCurrency(subtotal)}
        </p>
      </div>
      <Link href="/checkout" className="mt-3 block">
        <Button className="w-full bg-(--primary) hover:bg-(--primary-hover)">
          Go to checkout
        </Button>
      </Link>
    </div>
  );
}
