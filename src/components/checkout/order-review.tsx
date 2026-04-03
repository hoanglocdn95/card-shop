import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/types/cart";

type Props = {
  items: CartItem[];
  subtotal: number;
  total: number;
};

export function OrderReview({ items, subtotal, total }: Props) {
  const shipFee = Math.max(0, total - subtotal);
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Order review</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <p className="text-gray-700">
              {item.name} x {item.quantity}
            </p>
            <p className="font-medium text-gray-800">
              {formatCurrency(item.lineTotal)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-200 pt-3 text-sm">
        <div className="flex justify-between">
          <p className="text-gray-600">Subtotal</p>
          <p className="text-gray-800">{formatCurrency(subtotal)}</p>
        </div>
        <div className="mt-1 flex justify-between">
          <p className="text-gray-600">Shipping</p>
          <p className="text-gray-800">{formatCurrency(shipFee)}</p>
        </div>
        <div className="mt-1 flex justify-between font-semibold">
          <p className="text-gray-900">Total (before discount)</p>
          <p className="text-(--accent-teal)">{formatCurrency(total)}</p>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-[#f7d96b] bg-[#fff9dd] p-3 text-xs text-[#7a6622]">
        We usually confirm new orders in under 2 minutes.
      </div>
    </section>
  );
}
