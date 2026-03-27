import dayjs from "dayjs";
import { NextResponse } from "next/server";

import {
  calculateSubtotal,
  calculateTotal,
  enrichCartItems,
  generateOrderCode,
} from "@/lib/order";
import { persistOrder } from "@/lib/order-storage";
import { orderSchema } from "@/schemas/order.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.parse(body);
    const items = enrichCartItems(parsed.items);
    const subtotal = calculateSubtotal(items);
    const total = calculateTotal(items);
    const createdAt = dayjs().toISOString();
    const orderCode = generateOrderCode();

    await persistOrder({
      orderCode,
      customerName: parsed.customerName,
      phone: parsed.phone,
      address: parsed.address,
      note: parsed.note,
      subtotal,
      total,
      createdAt,
      items,
    });

    return NextResponse.json({
      success: true,
      orderCode,
      createdAt,
      customerName: parsed.customerName,
      total,
      status: "CONFIRMED",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json({ message }, { status: 400 });
  }
}
