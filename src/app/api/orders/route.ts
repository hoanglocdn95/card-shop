import dayjs from "dayjs";
import { NextResponse } from "next/server";

import { generateOrderCode } from "@/lib/order";
import { persistOrder } from "@/lib/order-storage";
import { parseDiscountCode } from "@/lib/discount";
import { roundUpToNearestThousandPublic } from "@/lib/pricing";
import { orderSchema } from "@/schemas/order.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.parse(body);

    const shipFee = 35000;
    const createdAt = dayjs().toISOString();
    const orderCode = generateOrderCode();

    const discount = parseDiscountCode(parsed.discountCode);

    // Base subtotal is computed from snapshot item prices (VND).
    const baseSubtotal = parsed.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    let total: number;
    if (discount.type === "none") {
      total = baseSubtotal + shipFee;
    } else if (discount.type === "percent") {
      total = baseSubtotal * (1 - discount.value / 100) + shipFee;
    } else {
      total = baseSubtotal + shipFee - discount.value;
    }
    total = roundUpToNearestThousandPublic(Math.max(0, total));

    await persistOrder({
      orderCode,
      facebookName: parsed.facebookName,
      note: parsed.note,
      total,
      createdAt,
      items: parsed.items.map((item) => {
        const unitPrice =
          discount.type === "percent"
            ? roundUpToNearestThousandPublic(
                item.price * (1 - discount.value / 100),
              )
            : item.price;
        const lineTotal = unitPrice * item.quantity;
        return {
          productName: item.productName,
          price: unitPrice,
          quantity: item.quantity,
          rarity: item.rarity,
          lineTotal,
        };
      }),
    });

    return NextResponse.json({
      success: true,
      orderCode,
      createdAt,
      total,
      facebookName: parsed.facebookName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json({ message }, { status: 400 });
  }
}
