import { NextResponse } from "next/server";

import { createOrderViaAppsScript } from "@/lib/apps-script";
import { orderSchema } from "@/schemas/order.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.parse(body);

    const result = await createOrderViaAppsScript(parsed);

    return NextResponse.json({
      success: true,
      orderCode: result.orderCode,
      createdAt: result.createdAt,
      facebookName: result.facebookName,
      total: result.total,
      subtotal: result.subtotal,
      shippingFee: result.shippingFee,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json({ message }, { status: 400 });
  }
}
