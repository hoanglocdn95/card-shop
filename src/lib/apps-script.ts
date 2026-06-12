import {
  appsScriptGet,
  appsScriptPost,
  hasAppsScriptConfig,
} from "@/lib/apps-script/client";
import { shouldBypassGoogleSheetsInDev } from "@/lib/env";
import { OrderInput } from "@/schemas/order.schema";

type CreateOrderResult = {
  result: {
    orderCode: string;
    createdAt: string;
    facebookName: string;
    total: number;
    subtotal: number;
    shippingFee: number;
  };
};

export async function createOrderViaAppsScript(input: OrderInput) {
  const canBypassInDev = shouldBypassGoogleSheetsInDev();

  if (!hasAppsScriptConfig()) {
    if (canBypassInDev) {
      console.warn(
        "[card-shop] Apps Script config missing in local dev. Order is mocked.",
      );
      return {
        orderCode: `DEV-${Date.now()}`,
        createdAt: new Date().toISOString(),
        facebookName: input.facebookName,
        total: 0,
        subtotal: 0,
        shippingFee: 0,
      };
    }
    throw new Error("Apps Script Web App credentials are missing.");
  }

  const data = await appsScriptPost<CreateOrderResult>("createOrder", {
    facebookName: input.facebookName,
    customerTier: input.customerTier ?? "guest",
    note: input.note ?? "",
    discountCode: input.discountCode ?? "",
    items: input.items.map((item) => ({
      productId: item.productId,
      cardCode: item.cardCode,
      game: item.game,
      quantity: item.quantity,
      rarity: item.rarity ?? "",
      source: item.source,
    })),
  });

  if (!data.result?.orderCode) {
    throw new Error("Apps Script did not return orderCode.");
  }

  return data.result;
}

type PreviewCheckoutResult = {
  result: {
    subtotal: number;
    shippingFee: number;
    total: number;
    discount: {
      type: string;
      value: number;
      scope: string;
      code?: string;
    };
  };
};

export async function previewCheckoutViaAppsScript(input: OrderInput) {
  if (!hasAppsScriptConfig()) return null;

  const data = await appsScriptPost<PreviewCheckoutResult>("previewCheckout", {
    facebookName: input.facebookName,
    customerTier: input.customerTier ?? "guest",
    note: input.note ?? "",
    discountCode: input.discountCode ?? "",
    items: input.items.map((item) => ({
      productId: item.productId,
      cardCode: item.cardCode,
      game: item.game,
      quantity: item.quantity,
      rarity: item.rarity ?? "",
      source: item.source,
    })),
  });

  return data.result;
}

export async function getShopSettingsViaAppsScript() {
  if (!hasAppsScriptConfig()) return null;

  const data = await appsScriptGet<{
    settings: {
      defaultShippingFee: number;
      shippingTiers?: Partial<Record<"guest" | "friend" | "vip", number>>;
    };
  }>("getSettings");
  return data.settings;
}

export { hasAppsScriptConfig };
