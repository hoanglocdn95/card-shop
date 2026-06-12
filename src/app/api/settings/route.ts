import { NextResponse } from "next/server";

import { getShopSettingsViaAppsScript } from "@/lib/apps-script";
import {
  DEFAULT_SHIPPING_FEE_VND,
  DEFAULT_SHIPPING_TIERS,
} from "@/lib/shipping";

export async function GET() {
  try {
    const settings = await getShopSettingsViaAppsScript();
    return NextResponse.json({
      defaultShippingFee:
        settings?.defaultShippingFee ?? DEFAULT_SHIPPING_FEE_VND,
      shippingTiers: settings?.shippingTiers ?? DEFAULT_SHIPPING_TIERS,
      source: settings ? "apps_script" : "fallback",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load settings";
    return NextResponse.json({ message }, { status: 500 });
  }
}
