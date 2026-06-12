import { NextResponse } from "next/server";

import { previewCheckoutViaAppsScript } from "@/lib/apps-script";
import { DEFAULT_CUSTOMER_TIER } from "@/lib/customer-tier";
import { resolveShippingFeeForTier } from "@/lib/shipping";
import { orderSchema } from "@/schemas/order.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.parse(body);

    const fromAppsScript = await previewCheckoutViaAppsScript(parsed);
    if (fromAppsScript) {
      return NextResponse.json({
        subtotal: fromAppsScript.subtotal,
        shippingFee: fromAppsScript.shippingFee,
        total: fromAppsScript.total,
        discount: fromAppsScript.discount,
        source: "apps_script",
      });
    }

    const tier = parsed.customerTier ?? DEFAULT_CUSTOMER_TIER;
    const shippingFee = resolveShippingFeeForTier(undefined, tier);

    return NextResponse.json(
      {
        message:
          "Apps Script preview unavailable. Configure APPS_SCRIPT_* or use client estimate.",
        subtotal: 0,
        shippingFee,
        total: shippingFee,
        source: "fallback",
      },
      { status: 503 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to preview checkout";
    return NextResponse.json({ message }, { status: 400 });
  }
}
