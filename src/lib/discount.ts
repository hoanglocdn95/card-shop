import { roundUpToNearestThousandPublic } from "@/lib/pricing";

export type DiscountResult =
  | { type: "none"; value: 0; scope: "none"; code?: string }
  | {
      type: "percent";
      value: number;
      scope: "items" | "shipping" | "total";
      code: string;
    }
  | {
      type: "fixed";
      value: number;
      scope: "items" | "shipping" | "total";
      code: string;
    };

export function parseDiscountCode(code?: string): DiscountResult {
  const normalized = (code ?? "").trim().toUpperCase();
  if (!normalized) return { type: "none", value: 0, scope: "none" };

  const itemsPercentMatch = normalized.match(/^(\d{1,2})%$/);
  if (itemsPercentMatch) {
    const value = Number(itemsPercentMatch[1]);
    if (Number.isFinite(value) && value > 0) {
      return { type: "percent", value, scope: "items", code: normalized };
    }
  }

  const billPercentMatch = normalized.match(/^BILL(\d{1,2})$/);
  if (billPercentMatch) {
    const value = Number(billPercentMatch[1]);
    if (Number.isFinite(value) && value > 0) {
      return { type: "percent", value, scope: "total", code: normalized };
    }
  }

  const shipPercentMatch = normalized.match(/^SHIP(\d{1,2})$/);
  if (shipPercentMatch) {
    const value = Number(shipPercentMatch[1]);
    if (Number.isFinite(value) && value > 0) {
      return { type: "percent", value, scope: "shipping", code: normalized };
    }
  }

  const offMatch = normalized.match(/^OFF(\d{1,9})$/);
  if (offMatch) {
    const value = Number(offMatch[1]);
    if (Number.isFinite(value) && value > 0) {
      return { type: "fixed", value, scope: "total", code: normalized };
    }
  }

  return { type: "none", value: 0, scope: "none" };
}

export function computeDiscountedTotal({
  subtotal,
  shippingFee,
  discountCode,
}: {
  subtotal: number;
  shippingFee: number;
  discountCode?: string;
}) {
  const discount = parseDiscountCode(discountCode);
  const base = subtotal + shippingFee;
  let discounted = base;

  if (discount.type === "percent" && discount.scope === "items") {
    discounted = subtotal * (1 - discount.value / 100) + shippingFee;
  } else if (discount.type === "percent" && discount.scope === "shipping") {
    discounted = subtotal + shippingFee * (1 - discount.value / 100);
  } else if (discount.type === "percent" && discount.scope === "total") {
    discounted = base * (1 - discount.value / 100);
  } else if (discount.type === "fixed" && discount.scope === "items") {
    discounted = Math.max(0, subtotal - discount.value) + shippingFee;
  } else if (discount.type === "fixed" && discount.scope === "shipping") {
    discounted = subtotal + Math.max(0, shippingFee - discount.value);
  } else if (discount.type === "fixed") {
    discounted = base - discount.value;
  }

  const rounded = roundUpToNearestThousandPublic(Math.max(0, discounted));
  return {
    discount,
    total: rounded,
  };
}
